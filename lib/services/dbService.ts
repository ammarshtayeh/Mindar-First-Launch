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
  deleteDoc,
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

export interface Summary {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: "pdf" | "image";
  userId: string;
  userName: string;
  createdAt: any;
  subject?: string;
  likes?: number;
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
  parentId: string | null;
  createdAt: any;
  color?: string;
}

export interface StudyMaterial {
  id: string;
  userId: string;
  title: string;
  extractedText: string;
  fileUrl?: string;
  folderId: string | null;
  tags: string[];
  createdAt: any;
  lastUsed: any;
}

export const createUserProfile = async (
  uid: string,
  email: string | null,
  displayName: string | null,
  firstName?: string,
  lastName?: string,
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
      badges: [],
    };
    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;

    await setDoc(userRef, profile);
  } else {
    const updateData: any = {
      lastLogin: serverTimestamp(),
    };
    if (displayName) updateData.displayName = displayName;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    await updateDoc(userRef, updateData);
  }
};

export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const saveQuizResult = async (result: Omit<QuizResult, "timestamp">) => {
  try {
    const resultWithTimestamp = {
      ...result,
      timestamp: serverTimestamp(),
    };

    // 1. Save result to history
    await addDoc(collection(db, "quiz_history"), resultWithTimestamp);

    // 2. Update user stats (XP, Quizzes Taken)
    const userRef = doc(db, "users", result.userId);
    const xpGained = Math.floor(result.score * 10); // Example: 10 XP per correct answer

    const updateData: any = {
      xp: increment(xpGained),
      quizzesTaken: increment(1),
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
  const q = query(historyRef, where("userId", "==", userId));

  const querySnapshot = await getDocs(q);
  const allHistory = querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as any,
  );

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

export const getGlobalLeaderboard = async (
  limitCount: number = 10,
): Promise<UserProfile[]> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("xp", "desc"), limit(limitCount));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as UserProfile);
};

export const logActivity = async (
  userId: string,
  userName: string,
  actionKey: string,
) => {
  try {
    const activity: UserActivity = {
      userId,
      userName,
      actionKey,
      timestamp: serverTimestamp(),
    };
    await addDoc(collection(db, "activity_feed"), activity);
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

export const getRecentActivities = async (
  limitCount: number = 10,
): Promise<UserActivity[]> => {
  try {
    const activityRef = collection(db, "activity_feed");
    const q = query(
      activityRef,
      orderBy("timestamp", "desc"),
      limit(limitCount),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as UserActivity);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};

export const onRecentActivities = (
  callback: (activities: UserActivity[]) => void,
  limitCount: number = 20,
) => {
  const activityRef = collection(db, "activity_feed");
  // Simple query to avoid composite index requirement
  const q = query(activityRef, orderBy("timestamp", "desc"), limit(limitCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const activities = snapshot.docs
        .map((doc) => doc.data() as UserActivity)
        .filter((act) => {
          // Client-side filtering for last 24h
          if (!act.timestamp) return false;
          try {
            return act.timestamp.toDate() > oneDayAgo;
          } catch (e) {
            return false;
          }
        });

      callback(activities);
    },
    (error) => {
      console.error("Recent activities listener failed:", error);
      callback([]); // Return empty on error
    },
  );
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, "users");
    // Sort by createdAt desc if possible, or just fetch all
    const q = query(usersRef, orderBy("createdAt", "desc"), limit(100));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as UserProfile);
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
};

// --- Mulakhasat (Summaries) Service ---

export const addSummary = async (
  summary: Omit<Summary, "id" | "createdAt" | "likes">,
) => {
  try {
    const summaryData = {
      ...summary,
      createdAt: serverTimestamp(),
      likes: 0,
    };
    await addDoc(collection(db, "summaries"), summaryData);

    // Log activity
    await logActivity(
      summary.userId,
      summary.userName,
      "action_uploaded_summary",
    );
  } catch (error) {
    console.error("Error adding summary:", error);
    throw error;
  }
};

export const getSummaries = async (
  limitCount: number = 20,
): Promise<Summary[]> => {
  try {
    const summariesRef = collection(db, "summaries");
    const q = query(
      summariesRef,
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Summary,
    );
  } catch (error) {
    console.error("Error fetching summaries:", error);
    return [];
  }
};

export const deleteSummary = async (summaryId: string) => {
  try {
    await deleteDoc(doc(db, "summaries", summaryId));
  } catch (error) {
    console.error("Error deleting summary:", error);
    throw error;
  }
};
// --- Folders & Materials Service ---

export const createFolder = async (
  folder: Omit<Folder, "id" | "createdAt">,
) => {
  try {
    const folderData = {
      ...folder,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "folders"), folderData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
};

export const getFolders = async (userId: string): Promise<Folder[]> => {
  try {
    const q = query(
      collection(db, "folders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Folder,
    );
  } catch (error) {
    console.error("Error fetching folders:", error);
    return [];
  }
};

export const updateFolder = async (folderId: string, data: Partial<Folder>) => {
  try {
    await updateDoc(doc(db, "folders", folderId), data);
  } catch (error) {
    console.error("Error updating folder:", error);
    throw error;
  }
};

export const deleteFolder = async (folderId: string) => {
  try {
    await deleteDoc(doc(db, "folders", folderId));
    // Note: In a production app, you might want to handle recursive deletion or moving children
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
};

export const saveStudyMaterial = async (
  material: Omit<StudyMaterial, "id" | "createdAt" | "lastUsed">,
) => {
  try {
    const materialData = {
      ...material,
      createdAt: serverTimestamp(),
      lastUsed: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "materials"), materialData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving study material:", error);
    throw error;
  }
};

export const getStudyMaterials = async (
  userId: string,
  folderId: string | null = null,
): Promise<StudyMaterial[]> => {
  try {
    const materialsRef = collection(db, "materials");
    let q;
    if (folderId) {
      q = query(
        materialsRef,
        where("userId", "==", userId),
        where("folderId", "==", folderId),
        orderBy("lastUsed", "desc"),
      );
    } else {
      q = query(
        materialsRef,
        where("userId", "==", userId),
        orderBy("lastUsed", "desc"),
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as StudyMaterial,
    );
  } catch (error) {
    console.error("Error fetching study materials:", error);
    return [];
  }
};

export const updateStudyMaterial = async (
  materialId: string,
  data: Partial<StudyMaterial>,
) => {
  try {
    await updateDoc(doc(db, "materials", materialId), {
      ...data,
      lastUsed: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating study material:", error);
    throw error;
  }
};

// --- System Configuration Service ---

export interface SystemFeatures {
  quiz: boolean;
  flashcards: boolean;
  challenge: boolean;
  coding: boolean;
  mindmap: boolean;
  checklist: boolean;
  summaries: boolean;
  askMindar: boolean;
  roadmap: boolean;
  rooms: boolean;
  interview: boolean;
}

const DEFAULT_FEATURES: SystemFeatures = {
  quiz: true,
  flashcards: true,
  challenge: true,
  coding: true,
  mindmap: true,
  checklist: true,
  summaries: true,
  askMindar: true,
  roadmap: true,
  rooms: true,
  interview: true,
};

export const getSystemConfig = async (): Promise<SystemFeatures | null> => {
  try {
    const configRef = doc(db, "system_config", "features");
    const configSnap = await getDoc(configRef);
    if (configSnap.exists()) {
      return { ...DEFAULT_FEATURES, ...configSnap.data() } as SystemFeatures;
    }
    return DEFAULT_FEATURES;
  } catch (error) {
    console.error("Error fetching system config:", error);
    return DEFAULT_FEATURES;
  }
};

export const updateSystemConfig = async (features: Partial<SystemFeatures>) => {
  try {
    const configRef = doc(db, "system_config", "features");
    await setDoc(configRef, features, { merge: true });
  } catch (error) {
    console.error("Error updating system config:", error);
    throw error;
  }
};

export const onSystemConfig = (
  callback: (features: SystemFeatures) => void,
) => {
  const configRef = doc(db, "system_config", "features");
  return onSnapshot(
    configRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({
          ...DEFAULT_FEATURES,
          ...snapshot.data(),
        } as SystemFeatures);
      } else {
        callback(DEFAULT_FEATURES);
      }
    },
    (error) => {
      console.warn(
        "System config listener failed (likely permissions):",
        error,
      );
    },
  );
};
