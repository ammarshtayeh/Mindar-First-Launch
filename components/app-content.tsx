import { PomodoroTimer } from "@/components/pomodoro-timer"
import { PageTransition } from "@/components/page-transition"

export function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Main Content */}
      <PageTransition>
        <div className="relative">
          {children}
        </div>
      </PageTransition>

      {/* Global Utilities */}
      <PomodoroTimer />
    </>
  )
}
