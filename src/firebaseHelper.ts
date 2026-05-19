import { db } from './firebase';
import { doc, setDoc, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';

export const setLatestUnlock = async (id: number) => {
  const docRef = doc(db, 'game_state', 'latest_unlock');
  await setDoc(docRef, {
    levelId: id,
    timestamp: serverTimestamp(),
  });
};

export const clearLatestUnlock = async () => {
  const docRef = doc(db, 'game_state', 'latest_unlock');
  await setDoc(docRef, {
    levelId: null,
    timestamp: serverTimestamp(),
  });
};

export const listenToLatestUnlock = (callback: (data: any) => void) => {
  const docRef = doc(db, 'game_state', 'latest_unlock');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Firestore onSnapshot Error:", error);
  });
};

// Global state sync to allow the mobile scanner to know what levels are unlocked
export const syncGlobalUnlockedLevels = async (levels: number[]) => {
  const docRef = doc(db, 'game_state', 'global_state');
  await setDoc(docRef, { unlockedLevels: levels }, { merge: true });
};

export const getGlobalUnlockedLevels = async (): Promise<number[]> => {
  const docRef = doc(db, 'game_state', 'global_state');
  const snap = await getDoc(docRef);
  if (snap.exists() && snap.data()?.unlockedLevels) {
    return snap.data().unlockedLevels;
  }
  return [];
};

