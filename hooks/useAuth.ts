import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { subscribeToAuthChanges } from "../lib/services/authService";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Safety timeout: If Firebase doesn't respond in 5s, force loading false
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);

    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      clearTimeout(timeout);
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [loading]);

  return { user, loading, error, setError };
};
