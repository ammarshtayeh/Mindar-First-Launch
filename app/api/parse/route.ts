import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import os from "os";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { normalizeArabic, detectCorruptedArabic, processText } from "@/lib/text-normalizer";
import { filterContent, hasUsefulContent } from "@/lib/content-filter";

// Backup Keys for OCR fallback
const API_KEYS = [
    process.env.GEMINI_API_KEY
].filter(Boolean) as string[];

/**
 * Polyfills for pdf-parse in Node environments.
 */
function applyPolyfills() {
    const globals = [global, globalThis] as any[];
    globals.forEach(g => {
        if (g && typeof g.DOMMatrix === 'undefined') {
            g.DOMMatrix = class DOMMatrix {};
        }
        if (g && typeof g.ImageData === 'undefined') {
            g.ImageData = class ImageData {};
        }
        if (g && typeof g.Path2D === 'undefined') {
            g.Path2D = class Path2D {};
        }
    });
}

applyPolyfills();

export const maxDuration = 60; // Allow 60 seconds for PDF parsing
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bufferStream = await file.arrayBuffer();
        const buffer = Buffer.from(bufferStream);
        const filename = file.name.toLowerCase();
        let text = "";

        // Determine file type and parse
        if (filename.endsWith(".pdf")) {
            const { extractText } = await import('unpdf');
            try {
                // 1. Try Local Extraction First (Fast & Free)
                const result = await extractText(new Uint8Array(buffer));
                text = Array.isArray(result.text) ? result.text.join("\n") : result.text;
                
                // Apply Arabic normalization
                text = normalizeArabic(text);
                
                // 2. Fallback to Gemini OCR if text is insufficient or corrupted
                if (!text || text.trim().length < 50 || detectCorruptedArabic(text)) {
                     console.log("Local parsing failed/insufficient/corrupted. Attempting Gemini OCR...");
                     text = await performGeminiOCR(buffer, file.type || "application/pdf");
                     text = normalizeArabic(text); // Normalize OCR output too
                }
            } catch (err: any) {
                console.warn("Local PDF Parse Error, trying OCR:", err);
                try {
                     text = await performGeminiOCR(buffer, file.type || "application/pdf");
                     text = normalizeArabic(text);
                } catch (ocrErr: any) {
                     throw new Error("Failed to read PDF even with OCR. The file might be corrupted or password protected.");
                }
            }
        } 
        else if (filename.endsWith(".docx") || filename.endsWith(".pptx") || filename.endsWith(".ppt")) {
            const tempFilePath = join(os.tmpdir(), `upload-${Date.now()}-${filename}`);
            try {
                if (!filename.endsWith('.ppt')) {
                    await writeFile(tempFilePath, buffer);
                    const { getTextExtractor } = await import('office-text-extractor');
                    const extractor = getTextExtractor();
                    text = await extractor.extractText({ input: tempFilePath, type: 'file' });
                    text = normalizeArabic(text);
                } else {
                    throw new Error("Force binary extraction for .ppt");
                }
            } catch (e: any) {
                if (e.message.includes('application/x-cfb') || filename.endsWith('.ppt') || e.message === "Force binary extraction for .ppt") {
                    console.warn(`Attempting binary string extraction for ${filename}`);
                    text = extractStringsFromBinary(buffer);
                    if (!text) {
                         throw new Error("Failed to extract readable text from this old PPT file.");
                    }
                    text = "[NOTE: Extracted from legacy PPT format - some formatting may be missing]\n" + text;
                    text = normalizeArabic(text);
                } else {
                    throw e;
                }
            } finally {
                await unlink(tempFilePath).catch(() => {});
            }
        } 
        else {
            return NextResponse.json({ error: "Unsupported file type. Please provide a PDF or PPTX file." }, { status: 400 });
        }

        // Advanced text processing: filter TOC, headers, etc.
        text = filterContent(text);
        
        // Final cleanup
        text = text.replace(/\n\s*\n/g, "\n").trim();
        
        if (!text || text.length < 50) {
            return NextResponse.json({ 
                error: "Empty or insufficient content!", 
                details: "We tried reading the file (even with OCR) but couldn't find enough text. Please check if the file is valid." 
            }, { status: 400 });
        }

        // Check if we have useful content (not just TOC)
        if (!hasUsefulContent(text)) {
            return NextResponse.json({ 
                error: "No useful content found!", 
                details: "The file appears to contain only Table of Contents or headers. Please provide a file with actual content." 
            }, { status: 400 });
        }

        return NextResponse.json({ text, type: filename.split('.').pop() });

    } catch (e: any) {
        console.error("General Upload Error:", e);
        return NextResponse.json({ 
            error: "Upload failed", 
            details: e.message || "Something went wrong during processing."
        }, { status: 500 });
    }
}

/**
 * Uses Gemini 1.5 Flash to extract text from images/scanned PDFs.
 */
async function performGeminiOCR(buffer: Buffer, mimeType: string): Promise<string> {
    const base64Data = buffer.toString("base64");
    
    // Try models in rotation to balance load
    const models = ["gemini-2.0-flash-lite-preview-02-05", "gemini-1.5-flash"];
    const useSecondModelFirst = Math.random() > 0.5;
    if (useSecondModelFirst) models.reverse();

    const ocrPrompt = `Extract all visible text from this document with EXTREME ACCURACY.

CRITICAL INSTRUCTIONS:
1. If the text is in Arabic, ensure correct RTL (Right-to-Left) logical order.
2. Preserve diacritics (harakat) if present, but prioritize accuracy over perfect diacritics.
3. If you can detect page numbers, mark them as: ### PAGE [X] ###
4. SKIP pages that look like Table of Contents (keywords: فهرس، محتويات، جدول المحتويات, Table of Contents, Contents, Index).
5. Preserve all headers, data structure, and formatting.
6. Focus on extracting the actual content, not just chapter titles or page numbers.

Return the text EXACTLY as it appears in the document.`;

    for (const apiKey of API_KEYS) {
        const genAI = new GoogleGenerativeAI(apiKey);
        for (const modelId of models) {
            try {
                console.log(`OCR ROTATION: Trying ${modelId}...`);
                const model = genAI.getGenerativeModel(
                    { model: modelId },
                    { apiVersion: "v1beta" }
                );
                
                const result = await model.generateContent([
                    ocrPrompt,
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    }
                ]);
                
                const text = result.response.text();
                if (text && text.length > 20) return text;
                
            } catch (e: any) {
                console.warn(`OCR Model ${modelId} failed:`, e.message);
                continue;
            }
        }
    }
    throw new Error("OCR Failed: All API keys exhausted or model refused content.");
}

/**
 * Heuristic to extract strings from binary files (e.g. PPT 97).
 * Enhanced to support Arabic text extraction.
 */
function extractStringsFromBinary(buffer: Buffer): string {
    // Try UTF-8 first for better Arabic support
    const content = buffer.toString('utf8');
    let text = "";
    
    // Extract ASCII strings (4+ consecutive printable ASCII chars)
    const asciiRegex = /[ -~\t\n\r]{4,}/g;
    const asciiMatches = content.match(asciiRegex);
    if (asciiMatches) {
        text += asciiMatches.join("\n");
    }
    
    // Extract Arabic strings (4+ consecutive Arabic chars + spaces)
    // Unicode Range: U+0600 to U+06FF (Arabic block)
    const arabicRegex = /[\u0600-\u06FF\s]{4,}/g;
    const arabicMatches = content.match(arabicRegex);
    if (arabicMatches) {
        // Clean up extracted Arabic (remove excessive spaces)
        const cleanedArabic = arabicMatches
            .map(s => s.trim())
            .filter(s => s.length > 3)
            .join("\n");
        
        if (cleanedArabic) {
            text += "\n" + cleanedArabic;
        }
    }
    
    return text;
}
