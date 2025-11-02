import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ExerciseLog, ExerciseCategory } from '../types/exercise';

export function useExerciseLogs(userEmail: string | null | undefined) {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      setLogs([]);
      setLoading(false);
      return;
    }

    // Ensure the user document exists (with email as document ID)
    const userDocRef = doc(db, 'exerciseLogs', userEmail);
    setDoc(userDocRef, { userEmail }, { merge: true }).catch(console.error);

    // Query the subcollection of logs for this user
    const logsCollectionRef = collection(db, 'exerciseLogs', userEmail, 'logs');
    const q = query(logsCollectionRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            createdAt: data.createdAt.toDate(),
          } as ExerciseLog;
        });
        setLogs(logsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching logs:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userEmail]);

  const addLog = async (
    exerciseName: string,
    category: ExerciseCategory,
    weight: number,
    reps?: number,
    sets?: number,
    notes?: string,
    date?: Date
  ) => {
    if (!userEmail) throw new Error('User not authenticated');

    // Ensure the user document exists
    const userDocRef = doc(db, 'exerciseLogs', userEmail);
    await setDoc(userDocRef, { userEmail }, { merge: true });

    // Add the log to the user's logs subcollection
    const logsCollectionRef = collection(db, 'exerciseLogs', userEmail, 'logs');
    await addDoc(logsCollectionRef, {
      userEmail,
      exerciseName,
      category,
      weight,
      reps: reps || null,
      sets: sets || null,
      notes: notes || '',
      date: Timestamp.fromDate(date || new Date()),
      createdAt: Timestamp.fromDate(new Date()),
    });
  };

  const deleteLog = async (logId: string) => {
    if (!userEmail) throw new Error('User not authenticated');
    await deleteDoc(doc(db, 'exerciseLogs', userEmail, 'logs', logId));
  };

  return { logs, loading, addLog, deleteLog };
}
