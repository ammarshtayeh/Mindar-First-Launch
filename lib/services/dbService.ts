import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  increment,
  onSnapshot,
  writeBatch,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  createdAt: any;
  lastLogin: any;
  level: number;
  xp: number;
  quizzesTaken: number;
  badges?: string[];
}

export interface QuizResult {
  userId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: any;
  quizData?: any;
  id?: string;
}

export interface UserActivity {
  userId: string;
  userName: string;
  actionKey: string;
  timestamp: any;
}

export const createUserProfile = async (
  uid: string, 
  email: string | null, 
  displayName: string | null,
  firstName?: string,
  lastName?: string
) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const profile: any = {
      uid,
      email,
      displayName,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      level: 1,
      xp: 0,
      quizzesTaken: 0,
      badges: []
    };
    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    
    await setDoc(userRef, profile);
  } else {
    const updateData: any = {
      lastLogin: serverTimestamp()
    };
    if (displayName) updateData.displayName = displayName;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    
    await updateDoc(userRef, updateData);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const saveQuizResult = async (result: Omit<QuizResult, 'timestamp'>) => {
  try {
    const resultWithTimestamp = {
      ...result,
      timestamp: serverTimestamp()
    };
    
    // 1. Save result to history
    await addDoc(collection(db, "quiz_history"), resultWithTimestamp);
    
    // 2. Update user stats (XP, Quizzes Taken)
    const userRef = doc(db, "users", result.userId);
    const xpGained = Math.floor(result.score * 10); // Example: 10 XP per correct answer
    
    const updateData: any = {
      xp: increment(xpGained),
      quizzesTaken: increment(1)
    };

    // Award "Genius" badge if 100%
    if (result.percentage >= 100) {
      const userSnap = await getDoc(userRef);
      const badges = userSnap.data()?.badges || [];
      if (!badges.includes("Genius")) {
        updateData.badges = [...badges, "Genius"];
      }
    }

    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw error;
  }
};

export const getQuizHistory = async (userId: string): Promise<QuizResult[]> => {
  const historyRef = collection(db, "quiz_history");
  // Fetch user history without sorting to avoid composite index error
  const q = query(
    historyRef, 
    where("userId", "==", userId)
  );
  
  const querySnapshot = await getDocs(q);
  const allHistory = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  
  // Sort client-side
  return allHistory
    .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
    .slice(0, 20);
};

export const clearQuizHistory = async (userId: string) => {
  try {
    const historyRef = collection(db, "quiz_history");
    const q = query(historyRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error clearing history:", error);
    throw error;
  }
};

export const deleteQuizResult = async (resultId: string) => {
    try {
        await deleteDoc(doc(db, "quiz_history", resultId));
    } catch (error) {
        console.error("Error deleting quiz result:", error);
        throw error;
    }
};

export const getGlobalLeaderboard = async (limitCount: number = 10): Promise<UserProfile[]> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("xp", "desc"), limit(limitCount));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as UserProfile);
};

export const logActivity = async (userId: string, userName: string, actionKey: string) => {
  try {
    const activity: UserActivity = {
      userId,
      userName,
      actionKey,
      timestamp: serverTimestamp()
    };
    await addDoc(collection(db, "activity_feed"), activity);
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

export const getRecentActivities = async (limitCount: number = 10): Promise<UserActivity[]> => {
  try {
    const activityRef = collection(db, "activity_feed");
    const q = query(activityRef, orderBy("timestamp", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserActivity);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};

export const onRecentActivities = (callback: (activities: UserActivity[]) => void, limitCount: number = 20) => {
  const activityRef = collection(db, "activity_feed");
  // Simple query to avoid composite index requirement
  const q = query(
    activityRef, 
    orderBy("timestamp", "desc"), 
    limit(limitCount)
  );
  
  return onSnapshot(q, (snapshot) => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const activities = snapshot.docs
      .map(doc => doc.data() as UserActivity)
      .filter(act => {
        // Client-side filtering for last 24h
        if (!act.timestamp) return false;
        try {
            return act.timestamp.toDate() > oneDayAgo;
        } catch (e) {
            return false;
        }
      });
      
    callback(activities);
  });
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, "users");
    // Sort by createdAt desc if possible, or just fetch all
    const q = query(usersRef, orderBy("createdAt", "desc"), limit(100));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
};
