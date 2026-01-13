export type Priority = 'high' | 'medium' | 'low';
export type ChecklistSource = 'ai' | 'manual';

export interface ChecklistItem {
  id: string;
  task: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: any; // Firestore Timestamp
  priority: Priority;
  relatedPages?: number[];
  relatedTopics?: string[];
  source: ChecklistSource;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface StudyChecklist {
  id: string;
  userId: string;
  materialId: string;
  materialTitle: string;
  items: ChecklistItem[];
  progress: number; // 0-100
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}
