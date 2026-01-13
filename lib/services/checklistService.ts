import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs,
  Timestamp,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { StudyChecklist, ChecklistItem } from "../types/checklist";

const COLLECTION_NAME = "study_checklists";

export const createChecklist = async (userId: string, materialId: string, materialTitle: string, items: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>[]) => {
  try {
    const checklistItems: ChecklistItem[] = items.map((item, index) => ({
      ...item,
      id: crypto.randomUUID(),
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const checklistData = {
      userId,
      materialId,
      materialTitle,
      items: checklistItems,
      progress: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), checklistData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating checklist:", error);
    throw error;
  }
};

export const getChecklistByMaterial = async (userId: string, materialId: string): Promise<StudyChecklist | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("userId", "==", userId),
      where("materialId", "==", materialId)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as StudyChecklist;
    }
    return null;
  } catch (error) {
    console.error("Error getting checklist:", error);
    return null;
  }
};

export const updateChecklistItemStatus = async (checklistId: string, itemId: string, isCompleted: boolean) => {
  try {
    const checklistRef = doc(db, COLLECTION_NAME, checklistId);
    const checklistSnap = await getDoc(checklistRef);
    
    if (checklistSnap.exists()) {
      const data = checklistSnap.data() as StudyChecklist;
      const updatedItems = data.items.map(item => {
        if (item.id === itemId) {
          return { 
            ...item, 
            isCompleted, 
            completedAt: isCompleted ? new Date() : null,
            updatedAt: new Date() 
          };
        }
        return item;
      });

      const completedCount = updatedItems.filter(item => item.isCompleted).length;
      const progress = Math.round((completedCount / updatedItems.length) * 100);

      await updateDoc(checklistRef, {
        items: updatedItems,
        progress: progress,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error updating checklist item status:", error);
    throw error;
  }
};

export const subscribeToChecklists = (userId: string, callback: (checklists: StudyChecklist[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME), 
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const checklists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StudyChecklist));
    callback(checklists);
  });
};

export const deleteChecklist = async (checklistId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, checklistId));
  } catch (error) {
    console.error("Error deleting checklist:", error);
    throw error;
  }
};
