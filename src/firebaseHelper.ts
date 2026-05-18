import { db } from './firebase';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

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
