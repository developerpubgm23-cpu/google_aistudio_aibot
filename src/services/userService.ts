import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

export interface UserProfile {
  uid: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  tier: "free" | "premium" | "professional";
  selectedModel: string;
  createdAt: any;
  updatedAt: any;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, path));
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const createUserProfile = async (profile: Partial<UserProfile>) => {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, path), {
      ...profile,
      tier: profile.tier || "free",
      selectedModel: profile.selectedModel || "llama-3.3-70b-versatile",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, path), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};
