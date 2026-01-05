
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
  Timestamp 
} from "firebase/firestore";
import { db } from "../firebase";

export interface TodoTask {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  scheduledAt: Date | null;
  reminderSent: boolean;
  createdAt: any;
  priority: 'low' | 'medium' | 'high';
  email?: string;
}

export const addTask = async (
  userId: string, 
  email: string,
  title: string, 
  scheduledAt: Date | null,
  priority: 'low' | 'medium' | 'high' = 'medium',
  description: string = ""
) => {
  try {
    const taskData: any = {
      userId,
      email,
      title,
      description,
      completed: false,
      reminderSent: false,
      priority,
      createdAt: serverTimestamp()
    };

    if (scheduledAt) {
      taskData.scheduledAt = Timestamp.fromDate(scheduledAt);
    } else {
      taskData.scheduledAt = null;
    }

    await addDoc(collection(db, "tasks"), taskData);
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId: string, completed: boolean) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { completed });
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const subscribeToTasks = (userId: string, callback: (tasks: TodoTask[]) => void) => {
  const tasksRef = collection(db, "tasks");
  const q = query(
    tasksRef, 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        scheduledAt: data.scheduledAt ? data.scheduledAt.toDate() : null
      } as TodoTask;
    });
    callback(tasks);
  });
};
