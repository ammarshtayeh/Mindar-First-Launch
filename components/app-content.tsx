import { PomodoroTimer } from "@/components/pomodoro-timer"

export function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Main Content */}
      <div>
        {children}
      </div>

      {/* Global Utilities */}
      <PomodoroTimer />
    </>
  )
}
