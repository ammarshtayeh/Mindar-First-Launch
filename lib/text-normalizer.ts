/**
 * text-normalizer.ts
 * 
 * مكتبة لتطبيع النصوص العربية وكشف النصوص الفاسدة
 * تهدف إلى توحيد الحروف المتشابهة وإزالة التشكيل والأحرف الخاصة
 */

/**
 * تطبيع النصوص العربية
 * 
 * @param text - النص المراد تطبيعه
 * @returns النص بعد التطبيع
 * 
 * العمليات:
 * - توحيد الألف: (أ، إ، آ، ٱ) → ا
 * - توحيد الياء: (ى، ئ) → ي
 * - إزالة التشكيل (الحركات)
 * - إزالة Zero-Width Characters (ZWNJ، ZWJ)
 * - ضغط المسافات المتعددة
 */
export function normalizeArabic(text: string): string {
  if (!text) return text;
  
  return text
    // توحيد أشكال الألف المختلفة
    .replace(/[أإآٱ]/g, 'ا')
    
    // توحيد أشكال الياء (لكن ليس الياء العادية)
    .replace(/[ىئ]/g, 'ي')
    
    // إزالة التشكيل (الحركات العربية)
    // U+064B (فتحتان) إلى U+065F (علامة صفر مستديرة فوقية)
    .replace(/[\u064B-\u065F]/g, '')
    
    // إزالة Zero-Width Non-Joiner (ZWNJ) و Zero-Width Joiner (ZWJ)
    .replace(/[\u200C\u200D]/g, '')
    
    // إزالة علامات الاتجاه (RTL/LTR marks)
    .replace(/[\u200E\u200F]/g, '')
    
    // ضغط المسافات المتعددة إلى مسافة واحدة
    .replace(/\s+/g, ' ')
    
    // إزالة المسافات من البداية والنهاية
    .trim();
}

/**
 * تطبيع متحفظ (للحالات التي نريد فيها الحفاظ على التاء المربوطة)
 * 
 * @param text - النص المراد تطبيعه
 * @returns النص بعد التطبيع المتحفظ
 */
export function normalizeArabicConservative(text: string): string {
  if (!text) return text;
  
  return text
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىئ]/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[\u200C\u200D\u200E\u200F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * كشف النصوص العربية الفاسدة أو المعكوسة
 * 
 * @param text - النص المراد فحصه
 * @returns true إذا كان النص فاسداً أو مشكوك به
 * 
 * معايير الكشف:
 * 1. نسبة عالية من الرموز الغريبة مقارنة بالحروف العربية
 * 2. وجود أنماط غير منطقية (حروف مقلوبة، ترتيب خاطئ)
 * 3. كثافة عالية من الرموز الخاصة
 */
export function detectCorruptedArabic(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  
  // كشف الحروف العربية
  const arabicChars = text.match(/[\u0600-\u06FF]/g);
  
  // إذا لم يكن هناك حروف عربية، لا نعتبره فاسداً (قد يكون إنجليزي)
  if (!arabicChars || arabicChars.length < 10) return false;
  
  // حساب نسبة الرموز الغريبة
  // الرموز المسموحة: العربية، ASCII، المسافات، الأرقام
  const allowedChars = text.match(/[\u0600-\u06FF\u0020-\u007E\s\n\r\t]/g);
  const totalChars = text.length;
  
  if (!allowedChars) return true;
  
  const strangeRatio = 1 - (allowedChars.length / totalChars);
  
  // إذا كانت نسبة الرموز الغريبة أكثر من 30%، النص فاسد
  if (strangeRatio > 0.3) {
    console.warn('[text-normalizer] High strange character ratio detected:', strangeRatio);
    return true;
  }
  
  // كشف نمط معكوس: البحث عن سلاسل من الحروف العربية متبوعة برموز Unicode خاصة
  const reversedPattern = /[\u0600-\u06FF]{2,}[\uFE00-\uFEFF]{2,}/g;
  if (reversedPattern.test(text)) {
    console.warn('[text-normalizer] Reversed pattern detected');
    return true;
  }
  
  // كشف كثافة عالية من علامات الترتيب (قد تشير إلى نص مقلوب)
  const rtlMarkers = text.match(/[\u200E\u200F\u202A-\u202E]/g);
  if (rtlMarkers && rtlMarkers.length / arabicChars.length > 0.2) {
    console.warn('[text-normalizer] High RTL marker density detected');
    return true;
  }
  
  return false;
}

/**
 * كشف اللغة السائدة في النص
 * 
 * @param text - النص المراد تحليله
 * @returns 'ar' للعربية، 'en' للإنجليزية، 'mixed' للمختلط، 'unknown' لغير معروف
 */
export function detectLanguage(text: string): 'ar' | 'en' | 'mixed' | 'unknown' {
  if (!text || text.trim().length === 0) return 'unknown';
  
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const totalLetters = arabicChars + englishChars;
  
  if (totalLetters === 0) return 'unknown';
  
  const arabicRatio = arabicChars / totalLetters;
  
  if (arabicRatio > 0.7) return 'ar';
  if (arabicRatio < 0.3) return 'en';
  return 'mixed';
}

/**
 * تنظيف النص من الأحرف الخاصة غير المرئية
 * 
 * @param text - النص المراد تنظيفه
 * @returns النص بعد التنظيف
 */
export function cleanInvisibleChars(text: string): string {
  if (!text) return text;
  
  return text
    // إزالة Byte Order Mark (BOM)
    .replace(/^\uFEFF/, '')
    
    // إزالة Zero Width Space
    .replace(/\u200B/g, '')
    
    // إزالة Soft Hyphen
    .replace(/\u00AD/g, '')
    
    // إزالة Line Separator و Paragraph Separator
    .replace(/[\u2028\u2029]/g, '\n')
    
    // تحويل Non-Breaking Space إلى مسافة عادية
    .replace(/\u00A0/g, ' ')
    
    // ضغط الأسطر الفارغة المتعددة
    .replace(/\n\s*\n\s*\n/g, '\n\n');
}

/**
 * معالجة شاملة للنص (تطبيع + تنظيف)
 * 
 * @param text - النص المراد معالجته
 * @returns النص بعد المعالجة الشاملة
 */
export function processText(text: string): string {
  if (!text) return text;
  
  // تنظيف الأحرف غير المرئية أولاً
  let processed = cleanInvisibleChars(text);
  
  // تطبيع النص العربي
  processed = normalizeArabic(processed);
  
  return processed;
}
