"use client"

export const MAX_GUEST_QUIZZES = 1
const GUEST_LIMIT_KEY = 'mindar_guest_quiz_count'

export const AccessControl = {
    getGuestUsage: (): number => {
        if (typeof window === 'undefined') return 0
        const count = localStorage.getItem(GUEST_LIMIT_KEY)
        return count ? parseInt(count, 10) : 0
    },

    consumeGuestUsage: () => {
        if (typeof window === 'undefined') return
        const current = AccessControl.getGuestUsage()
        localStorage.setItem(GUEST_LIMIT_KEY, (current + 1).toString())
    },

    hasAccess: (user: any): boolean => {
        // If logged in, always has access
        if (user) return true
        
        // If guest, check count
        return AccessControl.getGuestUsage() < MAX_GUEST_QUIZZES
    },

    resetGuestUsage: () => {
        // Useful for debugging or special promotions
        if (typeof window === 'undefined') return
        localStorage.removeItem(GUEST_LIMIT_KEY)
    }
}
