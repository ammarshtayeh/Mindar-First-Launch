// Motivational content database - Prayers and motivational phrases in Palestinian dialect

export interface MotivationalContent {
  text: string;
  type: 'prayer' | 'motivation';
  context?: 'home' | 'upload' | 'quiz' | 'results';
}

// Prayers & Focus Affirmations
export const prayers: MotivationalContent[] = [
  { text: "Oh Lord, make this learning easy for me.", type: 'prayer', context: 'quiz' },
  { text: "Open my heart and mind to true knowledge.", type: 'prayer', context: 'upload' },
  { text: "Lord, grant me understanding and clear thought.", type: 'prayer', context: 'quiz' },
  { text: "I seek success through hard work and focus.", type: 'prayer', context: 'quiz' },
  { text: "Bless my time and help me learn what is useful.", type: 'prayer', context: 'home' },
  { text: "Increase my knowledge and understanding.", type: 'prayer', context: 'home' },
  { text: "I trust in the process and my ability to grow.", type: 'prayer', context: 'quiz' },
  { text: "I entrust my hard work to the future.", type: 'prayer', context: 'results' },
];

// Motivational Phrases (عبارات تحفيزية)
// Motivational Phrases
export const motivationalPhrases: MotivationalContent[] = [
  { text: "Go for it, hero! You're more than capable! 💪", type: 'motivation', context: 'home' },
  { text: "Success isn't accidental, it's hard work and persistence.", type: 'motivation', context: 'home' },
  { text: "Every step forward brings you closer to your goal.", type: 'motivation', context: 'quiz' },
  { text: "Studying is an investment in your future self.", type: 'motivation', context: 'home' },
  { text: "You're stronger than you think, trust yourself!", type: 'motivation', context: 'quiz' },
  { text: "Failure is just the beginning of a better success.", type: 'motivation', context: 'results' },
  { text: "Focus is the secret to success. Keep your eyes on the prize!", type: 'motivation', context: 'quiz' },
  { text: "Every mistake you learn from makes you stronger.", type: 'motivation', context: 'results' },
  { text: "Believe in yourself! Half the battle is won.", type: 'motivation', context: 'home' },
  { text: "The road to the top isn't easy, but the view is worth it!", type: 'motivation', context: 'home' },
];

// Get random content by context
export function getRandomContent(context?: 'home' | 'upload' | 'quiz' | 'results'): MotivationalContent {
  const allContent = [...prayers, ...motivationalPhrases];
  
  // Filter by context if provided
  const filtered = context 
    ? allContent.filter(c => !c.context || c.context === context)
    : allContent;
  
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

// Get random prayer
export function getRandomPrayer(context?: string): MotivationalContent {
  const filtered = context 
    ? prayers.filter(p => !p.context || p.context === context)
    : prayers;
  
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

// Get random motivational phrase
export function getRandomMotivation(context?: string): MotivationalContent {
  const filtered = context 
    ? motivationalPhrases.filter(p => !p.context || p.context === context)
    : motivationalPhrases;
  
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

// Get context-specific message for results based on score
export function getResultMessage(percentage: number): MotivationalContent {
  if (percentage >= 90) {
    const messages: MotivationalContent[] = [
      { text: "Incredible! You're a natural-born genius! 🌟", type: 'motivation', context: 'results' },
      { text: "Pure excellence! Keep up this amazing standard 🏆", type: 'motivation', context: 'results' },
      { text: "Legendary performance! You've mastered this 🎯", type: 'motivation', context: 'results' },
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else if (percentage >= 70) {
    const messages: MotivationalContent[] = [
      { text: "Great job! A very solid performance 👍", type: 'motivation', context: 'results' },
      { text: "Well done! You definitely know your stuff 👋", type: 'motivation', context: 'results' },
      { text: "Impressive! Just a bit more focus and you'll hit 100% 📈", type: 'motivation', context: 'results' },
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else if (percentage >= 50) {
    const messages: MotivationalContent[] = [
      { text: "Not bad, but there's room for improvement 📚", type: 'motivation', context: 'results' },
      { text: "You're getting there! Keep working hard! 💪", type: 'motivation', context: 'results' },
      { text: "Halfway to perfection, let's finish strong! 🚀", type: 'motivation', context: 'results' },
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else {
    const messages: MotivationalContent[] = [
      { text: "Keep trying! Practice makes perfect 📖", type: 'motivation', context: 'results' },
      { text: "Not your best, but you'll get it next time! 🔥", type: 'motivation', context: 'results' },
      { text: "Don't give up! Every expert was once a beginner ✨", type: 'motivation', context: 'results' },
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
