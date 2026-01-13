import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  sendPasswordResetEmail,
  updatePassword
} from "firebase/auth";
import { auth } from "../firebase";
import { createUserProfile } from "./dbService";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    
    // Create/Update Firestore profile - NON-BLOCKING
    try {
      createUserProfile(user.uid, user.email, user.displayName).catch(err => {
        console.error("Non-blocking profile update failed:", err);
      });
    } catch (e) {
      console.error("Sync profile trigger failed:", e);
    }
    
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signUp = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update Auth Profile
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });
    
    // Create Firestore profile - NON-BLOCKING
    try {
      createUserProfile(user.uid, user.email, `${firstName} ${lastName}`, firstName, lastName).catch(err => {
         console.error("Non-blocking profile creation failed:", err);
      });
    } catch (e) {
      console.error("Sync profile trigger failed:", e);
    }
    
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login in Firestore - NON-BLOCKING
    try {
      createUserProfile(user.uid, user.email, user.displayName).catch(err => {
        console.error("Non-blocking login update failed:", err);
      });
    } catch (e) {
      console.error("Sync profile trigger failed:", e);
    }
    
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const changePassword = async (newPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  try {
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
