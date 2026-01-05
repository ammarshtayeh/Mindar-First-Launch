import { 
  ref, 
  set, 
  onValue, 
  update, 
  push, 
  get, 
  serverTimestamp 
} from "firebase/database";
import { rtdb } from "../firebase";

export interface Participant {
  uid: string;
  displayName: string;
  score: number;
  isReady: boolean;
  lastActive: any;
}

export interface RoomData {
  id: string;
  name: string;
  creatorId: string;
  status: 'waiting' | 'active' | 'finished';
  createdAt: any;
  participants: Record<string, Participant>;
  quizData: any; // Added this
}

export const createRoom = async (
  name: string, 
  creatorId: string, 
  creatorName: string,
  quizData: any
) => {
  const roomsRef = ref(rtdb, 'rooms');
  const newRoomRef = push(roomsRef);
  const roomId = newRoomRef.key;

  if (!roomId) throw new Error("Could not generate room ID");

  const roomData: RoomData = {
    id: roomId,
    name,
    creatorId,
    status: 'waiting',
    createdAt: serverTimestamp(),
    quizData,
    participants: {
      [creatorId]: {
        uid: creatorId,
        displayName: creatorName,
        score: 0,
        isReady: true,
        lastActive: serverTimestamp()
      }
    }
  };

  await set(newRoomRef, roomData);
  return roomId;
};

export const joinRoom = async (roomId: string, userId: string, userName: string) => {
  const roomRef = ref(rtdb, `rooms/${roomId}/participants/${userId}`);
  const participant: Participant = {
    uid: userId,
    displayName: userName,
    score: 0,
    isReady: false,
    lastActive: serverTimestamp()
  };

  await set(roomRef, participant);
};

export const updateParticipantScore = async (roomId: string, userId: string, score: number) => {
  const scoreRef = ref(rtdb, `rooms/${roomId}/participants/${userId}`);
  await update(scoreRef, {
    score,
    lastActive: serverTimestamp()
  });
};

export const updateRoomStatus = async (roomId: string, status: RoomData['status']) => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  await update(roomRef, { status });
};

export const subscribeToRoom = (roomId: string, callback: (data: RoomData | null) => void) => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  return onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
};

export const startQuizRoom = async (roomId: string) => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  await update(roomRef, { 
    status: 'active',
    startedAt: serverTimestamp()
  });
};

export const getRoomData = async (roomId: string): Promise<RoomData | null> => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  const snapshot = await get(roomRef);
  return snapshot.val();
};
