import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase";

export interface Ad {
  id?: string;
  title: string;
  imageUrl: string;
  link: string;
  variant: "banner" | "box" | "sidebar";
  active: boolean;
  createdAt?: any;
  clicks?: number;
}

const ADS_COLLECTION = "ads";

/**
 * جلب جميع الإعلانات (للأدمن)
 */
export const getAllAds = async (): Promise<Ad[]> => {
  try {
    const adsRef = collection(db, ADS_COLLECTION);
    const q = query(adsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
  } catch (error) {
    console.error("Error fetching ads:", error);
    return [];
  }
};

/**
 * جلب الإعلانات النشطة حسب النوع (للعرض في الموقع)
 */
export const getActiveAdsByVariant = async (variant: Ad["variant"]): Promise<Ad[]> => {
  try {
    const adsRef = collection(db, ADS_COLLECTION);
    const q = query(
      adsRef, 
      where("variant", "==", variant), 
      where("active", "==", true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
  } catch (error) {
    console.error("Error fetching active ads:", error);
    return [];
  }
};

/**
 * إضافة إعلان جديد
 */
export const createAd = async (ad: Omit<Ad, "id" | "createdAt" | "clicks">) => {
  try {
    const adData = {
      ...ad,
      clicks: 0,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, ADS_COLLECTION), adData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating ad:", error);
    throw error;
  }
};

/**
 * تحديث إعلان موجود
 */
export const updateAd = async (adId: string, data: Partial<Ad>) => {
  try {
    const adRef = doc(db, ADS_COLLECTION, adId);
    await updateDoc(adRef, data);
  } catch (error) {
    console.error("Error updating ad:", error);
    throw error;
  }
};

/**
 * حذف إعلان
 */
export const deleteAd = async (adId: string) => {
  try {
    const adRef = doc(db, ADS_COLLECTION, adId);
    await deleteDoc(adRef);
  } catch (error) {
    console.error("Error deleting ad:", error);
    throw error;
  }
};

/**
 * تسجيل نقرة على الإعلان
 */
export const trackAdClick = async (adId: string) => {
  try {
    const adRef = doc(db, ADS_COLLECTION, adId);
    // Note: In a real production app, you might want to use increment()
    // but for simplicity we can just update it or use increment if available in firestore
    const { increment } = await import("firebase/firestore");
    await updateDoc(adRef, {
      clicks: increment(1)
    });
  } catch (error) {
    console.error("Error tracking ad click:", error);
  }
};
