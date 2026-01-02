import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import os from "os";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
                
                // 2. Fallback to Gemini OCR if text is insufficient (Scanned PDF)
                if (!text || text.trim().length < 50) {
                     console.log("Local parsing failed/insufficient. Attempting Gemini OCR...");
                     text = await performGeminiOCR(buffer, file.type || "application/pdf");
                }
            } catch (err: any) {
                console.warn("Local PDF Parse Error, trying OCR:", err);
                try {
                     text = await performGeminiOCR(buffer, file.type || "application/pdf");
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

        // Text Cleanup
        text = text.replace(/\n\s*\n/g, "\n").trim();
        
        if (!text || text.length < 50) {
            return NextResponse.json({ 
                error: "Empty or insufficient content!", 
                details: "We tried reading the file (even with OCR) but couldn't find enough text. Please check if the file is valid." 
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
    
    // Try keys in rotation
    for (const apiKey of API_KEYS) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const result = await model.generateContent([
                "Extract all visible text from this document perfectly. CRITICAL: If you can determine page numbers, include them using the marker '### PAGE [X] ###' before the text of each page. Preserve all headers and data structure.",
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ]);
            
            const text = result.response.text();
            if (text && text.length > 20) return text;
            
        } catch (e) {
            console.warn(`OCR Key failed, trying next...`);
            continue;
        }
    }
    throw new Error("OCR Failed: All API keys exhausted or model refused content.");
}

/**
 * Heuristic to extract strings from binary files (e.g. PPT 97).
 */
function extractStringsFromBinary(buffer: Buffer): string {
    const content = buffer.toString('binary');
    let text = "";
    const asciiRegex = /[ -~\t\n\r]{4,}/g;
    const asciiMatches = content.match(asciiRegex);
    if (asciiMatches) {
        text += asciiMatches.join("\n");
    }
    return text;
}
