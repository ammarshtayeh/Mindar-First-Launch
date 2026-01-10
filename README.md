# 🎯 MINDAR - AI-Powered Study Companion

MINDAR is a modern, intelligence-driven educational platform designed to transform traditional study materials into interactive learning experiences. Using advanced AI, it parses PDF and PPTX files to generate quizzes, flashcards, and personalized study paths.

![MINDAR Hero Image](https://mindar.app/og-image.png)

## ✨ Core Features

- **🚀 Smart Parsing**: Instantly extract key concepts from PDF and PPTX documents.
- **📝 AI Quiz Generation**: Automatically generates multiple-choice and open-ended questions based on your material.
- **🎴 Dynamic Flashcards**: Build a vocabulary and concept bank for fast revision.
- **🏆 Gamification**: Earn XP, level up, and unlock badges as you study.
- **📊 Performance Analytics**: Deep insights into your strengths and weaknesses.
- **📅 Study Smart**: Integrated To-Do list and study planner.
- **🌐 Bilingual Support**: Seamless switching between Arabic and English.
- **📱 PWA Ready**: Install Mindar on your device for a native-like experience.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Framer Motion for animations
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions)
- **State Management**: Redux Toolkit
- **UI Components**: Shadcn UI (Radix Primitives)
- **Icons**: Lucide React
- **Analytics**: Google Analytics 4

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- Firebase project setup
- Google AI (Gemini) API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ammarshtayeh/Mindar-First-Launch.git
   cd Mindar-First-Launch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file and add your credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
   # Add other required variables
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 PWA Support

Mindar is a Progressive Web App. You can install it on iOS (via Safari Share -> Add to Home Screen) or Android (via Chrome Prompt).

## ⚖️ Legal

This project includes a [Privacy Policy](https://mindar.app/privacy) and [Terms of Service](https://mindar.app/terms) to ensure user data protection and compliance.

## 👤 Author

Developed by **Ammar Shtayeh**.
- LinkedIn: [Ammar Shtayeh](https://www.linkedin.com/in/ammar-shtayeh-174259221/)
- Instagram: [@ammar._.space](https://www.instagram.com/ammar._.space)

---
Developed with ❤️ for students worldwide.
