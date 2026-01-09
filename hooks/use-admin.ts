"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// TODO: In production, this should be a role in the database (e.g. user.role === 'admin')
// For now, we will simply hardcode the admin emails here.
const ADMIN_EMAILS = [
    "ammar@example.com", 
    "admin@mindar.com",
    "ammar.shtayeh@gmail.com"
];

export function useAdmin() {
    const { user, loading } = useAuth()
    const router = useRouter()
    
    const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

    useEffect(() => {
        if (!loading) {
             if (!user || !isAdmin) {
                 router.replace("/")
             }
        }
    }, [user, loading, router, isAdmin])

    return { 
        loading, 
        isAdmin: !!isAdmin
    }
}
