// Performance analysis and tracking system

export interface QuestionResult {
  questionId: number;
  question: string;
  type: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
  chapter?: string;
  slideNumber?: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent?: number; // in seconds
}

export interface PerformanceData {
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: number;
  results: QuestionResult[];
  completedAt: string;
  totalTimeSpent?: number;
}

export interface TopicPerformance {
  topic: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface ChapterPerformance {
  chapter: string;
  slideNumbers?: number[];
  total: number;
  correct: number;
  accuracy: number;
}

export interface WeakArea {
  type: 'topic' | 'chapter';
  name: string;
  accuracy: number;
  recommendation: string;
}

// Analyze performance by topic
export function analyzeByTopic(results: QuestionResult[]): TopicPerformance[] {
  const topicMap = new Map<string, { total: number; correct: number }>();

  results.forEach(result => {
    const topic = result.topic || 'عام';
    const current = topicMap.get(topic) || { total: 0, correct: 0 };
    topicMap.set(topic, {
      total: current.total + 1,
      correct: current.correct + (result.isCorrect ? 1 : 0)
    });
  });

  return Array.from(topicMap.entries()).map(([topic, data]) => ({
    topic,
    total: data.total,
    correct: data.correct,
    accuracy: Math.round((data.correct / data.total) * 100)
  }));
}

// Analyze performance by chapter
export function analyzeByChapter(results: QuestionResult[]): ChapterPerformance[] {
  const chapterMap = new Map<string, { total: number; correct: number; slides: Set<number> }>();

  results.forEach(result => {
    if (result.chapter) {
      const current = chapterMap.get(result.chapter) || { total: 0, correct: 0, slides: new Set<number>() };
      if (result.slideNumber) {
        current.slides.add(result.slideNumber);
      }
      chapterMap.set(result.chapter, {
        total: current.total + 1,
        correct: current.correct + (result.isCorrect ? 1 : 0),
        slides: current.slides
      });
    }
  });

  return Array.from(chapterMap.entries()).map(([chapter, data]) => ({
    chapter,
    slideNumbers: Array.from(data.slides).sort((a, b) => a - b),
    total: data.total,
    correct: data.correct,
    accuracy: Math.round((data.correct / data.total) * 100)
  }));
}

// Identify weak areas (< 60% accuracy)
export function identifyWeakAreas(
  topicPerformance: TopicPerformance[],
  chapterPerformance: ChapterPerformance[]
): WeakArea[] {
  const weakAreas: WeakArea[] = [];

  // Check topics
  topicPerformance.forEach(topic => {
    if (topic.accuracy < 60) {
      weakAreas.push({
        type: 'topic',
        name: topic.topic,
        accuracy: topic.accuracy,
        recommendation: `راجع موضوع "${topic.topic}" - دقتك ${topic.accuracy}% بس`
      });
    }
  });

  // Check chapters
  chapterPerformance.forEach(chapter => {
    if (chapter.accuracy < 60) {
      const slideInfo = chapter.slideNumbers && chapter.slideNumbers.length > 0
        ? ` (خاصة ${chapter.slideNumbers.length > 3 ? 'الشرائح' : 'الشريحة'} ${chapter.slideNumbers.slice(0, 3).join(', ')}${chapter.slideNumbers.length > 3 ? '...' : ''})`
        : '';
      
      weakAreas.push({
        type: 'chapter',
        name: chapter.chapter,
        accuracy: chapter.accuracy,
        recommendation: `راجع ${chapter.chapter}${slideInfo} - محتاج تركيز أكثر`
      });
    }
  });

  return weakAreas.sort((a, b) => a.accuracy - b.accuracy);
}

// Generate study recommendations
export function generateRecommendations(
  performance: PerformanceData,
  weakAreas: WeakArea[]
): string[] {
  const recommendations: string[] = [];

  if (performance.percentage >= 90) {
    recommendations.push("🌟 أداء ممتاز! حافظ على هذا المستوى");
    recommendations.push("راجع الأخطاء البسيطة عشان تكون 100%");
  } else if (performance.percentage >= 70) {
    recommendations.push("👍 أداء جيد! في مجال للتحسين");
    if (weakAreas.length > 0) {
      recommendations.push("ركز على المواضيع الضعيفة المذكورة أدناه");
    }
  } else if (performance.percentage >= 50) {
    recommendations.push("📚 محتاج مراجعة شاملة للمادة");
    recommendations.push("خصص وقت أطول للدراسة والفهم");
  } else {
    recommendations.push("⚠️ لازم تراجع المادة من البداية");
    recommendations.push("حاول تفهم المفاهيم الأساسية قبل ما تحل أسئلة");
  }

  // Add specific weak area recommendations
  weakAreas.forEach(area => {
    recommendations.push(area.recommendation);
  });

  // Time-based recommendations
  if (performance.totalTimeSpent) {
    const avgTimePerQuestion = performance.totalTimeSpent / performance.totalQuestions;
    if (avgTimePerQuestion < 30) {
      recommendations.push("⏱️ خذ وقتك أكثر في قراءة الأسئلة");
    } else if (avgTimePerQuestion > 180) {
      recommendations.push("⚡ حاول تحسن سرعتك بالإجابة");
    }
  }

  return recommendations;
}

// Save performance to localStorage
export function savePerformance(performance: PerformanceData): void {
  try {
    const history = getPerformanceHistory();
    history.push(performance);
    
    // Keep only last 20 attempts
    const trimmed = history.slice(-20);
    localStorage.setItem('quiz-performance-history', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save performance:', error);
  }
}

// Get performance history
export function getPerformanceHistory(): PerformanceData[] {
  try {
    const stored = localStorage.getItem('quiz-performance-history');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load performance history:', error);
    return [];
  }
}

// Calculate improvement trend
export function calculateImprovement(): { trend: 'up' | 'down' | 'stable'; change: number } | null {
  const history = getPerformanceHistory();
  if (history.length < 2) return null;

  const recent = history.slice(-5);
  const older = history.slice(-10, -5);

  if (older.length === 0) return null;

  const recentAvg = recent.reduce((sum, p) => sum + p.percentage, 0) / recent.length;
  const olderAvg = older.reduce((sum, p) => sum + p.percentage, 0) / older.length;

  const change = Math.round(recentAvg - olderAvg);

  return {
    trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
    change
  };
}
