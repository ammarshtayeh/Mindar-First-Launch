import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export interface RoomAnnotation {
  id?: string;
  userId: string;
  userName: string;
  type: "highlight" | "note";
  page: number;
  rects: { x: number; y: number; width: number; height: number }[];
  color: string;
  note?: string; // Content of the note/label
  timestamp: any;
}

export interface RoomChatMessage {
  id?: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: any;
}

export interface RoomCursor {
  id: string; // User ID
  x: number;
  y: number;
  userName: string;
  lastActive: any;
}

export interface StudyRoom {
  id: string;
  name: string;
  pdfUrl?: string;
  pdfName?: string;
  createdBy: string;
  createdAt: any;
}

export const createRoom = async (userId: string, name: string) => {
  const roomId = Math.random().toString(36).substring(2, 9).toUpperCase();
  const roomRef = doc(db, "rooms", roomId);

  const roomData: StudyRoom = {
    id: roomId,
    name,
    createdBy: userId,
    createdAt: serverTimestamp(),
  };

  await setDoc(roomRef, roomData);
  return roomId;
};

export const getRoom = async (roomId: string) => {
  const roomRef = doc(db, "rooms", roomId);
  const snap = await getDoc(roomRef);
  return snap.exists() ? (snap.data() as StudyRoom) : null;
};

export const updateRoomPdf = async (
  roomId: string,
  pdfUrl: string,
  pdfName: string,
) => {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, { pdfUrl, pdfName });
};

export const addAnnotation = async (
  roomId: string,
  annotation: Omit<RoomAnnotation, "timestamp">,
) => {
  const annRef = collection(db, "rooms", roomId, "annotations");
  await addDoc(annRef, {
    ...annotation,
    timestamp: serverTimestamp(),
  });
};

export const updateAnnotation = async (
  roomId: string,
  annId: string,
  updates: Partial<RoomAnnotation>,
) => {
  const annRef = doc(db, "rooms", roomId, "annotations", annId);
  await updateDoc(annRef, updates);
};

export const deleteAnnotation = async (roomId: string, annId: string) => {
  const annRef = doc(db, "rooms", roomId, "annotations", annId);
  await deleteDoc(annRef);
};

export const sendChatMessage = async (
  roomId: string,
  message: Omit<RoomChatMessage, "timestamp">,
) => {
  const chatRef = collection(db, "rooms", roomId, "chat");
  await addDoc(chatRef, {
    ...message,
    timestamp: serverTimestamp(),
  });
};

export const updateCursor = async (
  roomId: string,
  cursor: Omit<RoomCursor, "lastActive">,
) => {
  const cursorRef = doc(db, "rooms", roomId, "cursors", cursor.id);
  await setDoc(cursorRef, {
    ...cursor,
    lastActive: serverTimestamp(),
  });
};

export const subscribeToRoom = (
  roomId: string,
  callback: (room: StudyRoom | null) => void,
) => {
  return onSnapshot(doc(db, "rooms", roomId), (snap) => {
    callback(snap.exists() ? (snap.data() as StudyRoom) : null);
  });
};

export const subscribeToAnnotations = (
  roomId: string,
  callback: (annotations: RoomAnnotation[]) => void,
) => {
  const q = query(
    collection(db, "rooms", roomId, "annotations"),
    orderBy("timestamp", "asc"),
  );
  return onSnapshot(q, (snap) => {
    const anns = snap.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as RoomAnnotation,
    );
    callback(anns);
  });
};

export const subscribeToChat = (
  roomId: string,
  callback: (messages: RoomChatMessage[]) => void,
) => {
  const q = query(
    collection(db, "rooms", roomId, "chat"),
    orderBy("timestamp", "asc"),
  );
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as RoomChatMessage,
    );
    callback(messages);
  });
};

export const subscribeToCursors = (
  roomId: string,
  callback: (cursors: RoomCursor[]) => void,
) => {
  return onSnapshot(collection(db, "rooms", roomId, "cursors"), (snap) => {
    const cursors = snap.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as RoomCursor,
    );
    callback(cursors);
  });
};
