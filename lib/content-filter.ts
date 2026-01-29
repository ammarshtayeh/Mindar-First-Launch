/**
 * content-filter.ts
 * 
 * مكتبة لتصفية المحتوى غير المفيد من النصوص المستخرجة
 * - إزالة صفحات الفهرس (Table of Contents)
 * - إزالة الرؤوس والتذييلات المتكررة
 * - معالجة علامات الصفحات من OCR
 */

/**
 * كشف ما إذا كانت الصفحة عبارة عن فهرس (TOC)
 * 
 * @param content - محتوى الصفحة
 * @returns true إذا كانت الصفحة فهرس
 */
function isTOCPage(content: string): boolean {
  if (!content || content.trim().length < 10) return false;
  
  const lowerContent = content.toLowerCase();
  
  // الكلمات المفتاحية للفهرس (عربي وإنجليزي)
  const tocKeywords = [
    'فهرس',
    'محتويات',
    'جدول المحتويات',
    'قائمة المحتويات',
    'الفهرست',
    'table of contents',
    'contents',
    'index',
    'toc'
  ];
  
  // كشف الكلمات المفتاحية
  const hasKeyword = tocKeywords.some(kw => lowerContent.includes(kw));
  if (hasKeyword) return true;
  
  // كشف نمط الفهرس: نص + نقاط + رقم
  // مثال: "الفصل الأول .............. 5"
  // مثال: "Chapter 1 .............. 5"
  const lines = content.split('\n');
  let tocPatternCount = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length < 5) continue;
    
    // نمط: نص + 3+ نقاط + رقم في النهاية
    if (/^.+\.{3,}\s*\d+\s*$/.test(trimmedLine)) {
      tocPatternCount++;
    }
    
    // نمط: نص + مسافات كثيرة + رقم
    if (/^.+\s{5,}\d+\s*$/.test(trimmedLine)) {
      tocPatternCount++;
    }
  }
  
  // إذا كان 60%+ من الأسطر يتبع نمط الفهرس
  const validLines = lines.filter(l => l.trim().length > 5).length;
  if (validLines > 0 && tocPatternCount / validLines > 0.6) {
    return true;
  }
  
  return false;
}

/**
 * كشف وحذف صفحات الفهرس من النص
 * 
 * @param text - النص الكامل
 * @returns النص بعد حذف صفحات الفهرس
 */
export function detectAndRemoveTOC(text: string): string {
  if (!text || text.trim().length < 100) return text;
  
  const lines = text.split('\n');
  
  // الكلمات المفتاحية للفهرس
  const tocKeywords = [
    'فهرس',
    'محتويات',
    'جدول المحتويات',
    'قائمة المحتويات',
    'الفهرست',
    'table of contents',
    'contents',
    'index'
  ];
  
  // الكلمات المفتاحية لبداية المحتوى الحقيقي
  const contentStartKeywords = [
    /^(الفصل|الباب|المقدمة|التمهيد|الوحدة)\s+/i,
    /^(chapter|unit|introduction|preface|part)\s+/i,
    /^(مقدمة|تمهيد|تقديم)$/i,
    /^(introduction|preface)$/i
  ];
  
  let startIndex = 0;
  let tocDetected = false;
  let inTOCSection = false;
  
  // فحص أول 150 سطر فقط (الفهرس عادة في البداية)
  const linesToCheck = Math.min(lines.length, 150);
  
  for (let i = 0; i < linesToCheck; i++) {
    const line = lines[i].toLowerCase().trim();
    
    // تخطي الأسطر الفارغة
    if (line.length === 0) continue;
    
    // كشف بداية الفهرس
    if (!inTOCSection && tocKeywords.some(kw => line.includes(kw))) {
      tocDetected = true;
      inTOCSection = true;
      continue;
    }
    
    // كشف نمط الفهرس: نص + نقاط + رقم
    if (/^.+\.{3,}\s*\d+$/.test(line) || /^.+\s{5,}\d+$/.test(line)) {
      inTOCSection = true;
      tocDetected = true;
      continue;
    }
    
    // إذا كنا في قسم الفهرس، ابحث عن نهايته
    if (inTOCSection) {
      // كشف بداية المحتوى الحقيقي
      const isContentStart = contentStartKeywords.some(pattern => pattern.test(lines[i]));
      
      if (isContentStart) {
        startIndex = i;
        break;
      }
      
      // إذا وجدنا فقرة طويلة (> 200 حرف)، نعتبرها نهاية الفهرس
      if (lines[i].trim().length > 200) {
        startIndex = i;
        break;
      }
    }
  }
  
  // إذا تم كشف فهرس وإيجاد بداية المحتوى، احذف الفهرس
  if (tocDetected && startIndex > 0) {
    const removedLines = startIndex;
    console.log(`[content-filter] TOC detected and removed (${removedLines} lines)`);
    return lines.slice(startIndex).join('\n');
  }
  
  return text;
}

/**
 * إزالة الرؤوس والتذييلات المتكررة
 * 
 * @param text - النص الكامل
 * @returns النص بعد إزالة الرؤوس والتذييلات
 */
export function cleanHeaders(text: string): string {
  if (!text || text.trim().length < 100) return text;
  
  const lines = text.split('\n');
  const frequency: { [key: string]: number } = {};
  
  // حساب تكرار الأسطر القصيرة (الرؤوس/التذييلات عادة قصيرة ومتكررة)
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // فقط الأسطر التي طولها بين 5 و 100 حرف
    if (trimmed.length > 5 && trimmed.length < 100) {
      frequency[trimmed] = (frequency[trimmed] || 0) + 1;
    }
  });
  
  // حذف الأسطر المتكررة أكثر من 3 مرات (محتمل رأس/تذييل)
  const cleanedLines = lines.filter(line => {
    const trimmed = line.trim();
    
    // إبقاء الأسطر الفارغة
    if (trimmed.length === 0) return true;
    
    // إبقاء الأسطر الطويلة (محتوى حقيقي)
    if (trimmed.length > 100) return true;
    
    // حذف إذا كانت متكررة أكثر من 3 مرات
    if (frequency[trimmed] && frequency[trimmed] > 3) {
      return false;
    }
    
    return true;
  });
  
  const removedCount = lines.length - cleanedLines.length;
  if (removedCount > 0) {
    console.log(`[content-filter] Removed ${removedCount} repeated headers/footers`);
  }
  
  return cleanedLines.join('\n');
}

/**
 * معالجة علامات الصفحات من OCR وإزالة صفحات الفهرس
 * 
 * @param text - النص مع علامات الصفحات (### PAGE [X] ###)
 * @returns النص بعد تصفية صفحات الفهرس
 */
export function parsePageMarkers(text: string): string {
  if (!text) return text;
  
  // البحث عن علامات الصفحات
  const pageRegex = /###\s*PAGE\s*\[(\d+)\]\s*###/gi;
  
  // إذا لم يكن هناك علامات صفحات، إرجاع النص كما هو
  if (!pageRegex.test(text)) {
    return text;
  }
  
  // إعادة تعيين الـ regex (لأن test() يحرك المؤشر)
  const pages = text.split(/###\s*PAGE\s*\[(\d+)\]\s*###/gi);
  
  const cleanedPages: string[] = [];
  let skippedPages: number[] = [];
  
  // pages[0] هو النص قبل أول علامة صفحة
  if (pages[0] && pages[0].trim().length > 50) {
    cleanedPages.push(pages[0]);
  }
  
  // معالجة الصفحات (pages[1] = رقم الصفحة، pages[2] = محتوى الصفحة، وهكذا)
  for (let i = 1; i < pages.length; i += 2) {
    const pageNum = parseInt(pages[i]);
    const pageContent = pages[i + 1] || '';
    
    // تخطي صفحات الفهرس (عادة في أول 5 صفحات)
    if (pageNum <= 5 && isTOCPage(pageContent)) {
      skippedPages.push(pageNum);
      console.log(`[content-filter] Skipped TOC page ${pageNum}`);
      continue;
    }
    
    // تخطي الصفحات الفارغة جداً
    if (pageContent.trim().length < 20) {
      continue;
    }
    
    cleanedPages.push(pageContent);
  }
  
  if (skippedPages.length > 0) {
    console.log(`[content-filter] Total TOC pages skipped: ${skippedPages.join(', ')}`);
  }
  
  return cleanedPages.join('\n\n');
}

/**
 * تصفية شاملة للنص (جميع المعالجات مجتمعة)
 * 
 * @param text - النص الخام
 * @returns النص بعد التصفية الشاملة
 */
export function filterContent(text: string): string {
  if (!text || text.trim().length < 50) return text;
  
  console.log('[content-filter] Starting content filtering...');
  
  // 1. معالجة علامات الصفحات (إن وجدت)
  let filtered = parsePageMarkers(text);
  
  // 2. حذف الفهرس
  filtered = detectAndRemoveTOC(filtered);
  
  // 3. إزالة الرؤوس والتذييلات المتكررة
  filtered = cleanHeaders(filtered);
  
  // 4. تنظيف نهائي
  filtered = filtered
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // ضغط الأسطر الفارغة المتعددة
    .trim();
  
  console.log('[content-filter] Content filtering completed');
  
  return filtered;
}

/**
 * كشف ما إذا كان النص يحتوي على محتوى مفيد (ليس فقط فهرس)
 * 
 * @param text - النص المراد فحصه
 * @returns true إذا كان النص يحتوي على محتوى مفيد
 */
export function hasUsefulContent(text: string): boolean {
  if (!text || text.trim().length < 100) return false;
  
  // إذا كان كل النص عبارة عن فهرس، لا يوجد محتوى مفيد
  if (isTOCPage(text)) return false;
  
  // حساب نسبة الأسطر ذات المحتوى الحقيقي
  const lines = text.split('\n');
  const contentLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed.length > 50 && !/^.+\.{3,}\s*\d+$/.test(trimmed);
  });
  
  // يجب أن يكون على الأقل 30% من الأسطر محتوى حقيقي
  return contentLines.length / lines.length > 0.3;
}
