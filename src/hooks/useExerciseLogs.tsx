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
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ExerciseLog, ExerciseCategory } from '../types/exercise';

/**
 * Utility function to validate email format
 */
function isValidEmail(email: string | null | undefined): email is string {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Custom hook for managing exercise logs using Firebase Firestore
 * Uses user email as the unique document identifier
 * 
 * Data Structure:
 * exerciseLogs/
 *   {userEmail}/          <- Document ID is the user's email
 *     userEmail: string   <- Stored as field for reference
 *     logs/               <- Subcollection for individual exercise logs
 *       {logId}/
 *         exerciseName, category, weight, reps, sets, notes, date, createdAt
 */
export function useExerciseLogs(userEmail: string | null | undefined) {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isValidEmail(userEmail)) {
      setLogs([]);
      setLoading(false);
      return;
    }

    // Ensure the user document exists (with email as document ID)
    const userDocRef = doc(db, 'exerciseLogs', userEmail);
    
    // Initialize user document if it doesn't exist
    getDoc(userDocRef).then((docSnapshot) => {
      if (!docSnapshot.exists()) {
        setDoc(userDocRef, { 
          userEmail,
          createdAt: Timestamp.fromDate(new Date()),
          lastUpdated: Timestamp.fromDate(new Date())
        }, { merge: true }).catch((error) => {
          console.error('Error initializing user document:', error);
        });
      }
    }).catch((error) => {
      console.error('Error checking user document:', error);
    });

    // Query the subcollection of logs for this user
    // Using email as the document ID ensures unique user identification
    const logsCollectionRef = collection(db, 'exerciseLogs', userEmail, 'logs');
    const q = query(logsCollectionRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logsData = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            userEmail: data.userEmail as string,
            exerciseName: data.exerciseName as string,
            category: data.category as ExerciseCategory,
            weight: data.weight as number,
            reps: data.reps ?? undefined,
            sets: data.sets ?? undefined,
            notes: data.notes as string || '',
            date: data.date?.toDate() ?? new Date(),
            createdAt: data.createdAt?.toDate() ?? new Date(),
          } as ExerciseLog;
        });
        setLogs(logsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching exercise logs:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userEmail]);

  /**
   * Add a new exercise log entry
   * Stores data under: exerciseLogs/{userEmail}/logs/{logId}
   */
  const addLog = async (
    exerciseName: string,
    category: ExerciseCategory,
    weight: number,
    reps?: number,
    sets?: number,
    notes?: string,
    date?: Date
  ): Promise<void> => {
    if (!isValidEmail(userEmail)) {
      throw new Error('User email is required and must be valid');
    }

    try {
      // Ensure the user document exists
      const userDocRef = doc(db, 'exerciseLogs', userEmail);
      await setDoc(userDocRef, { 
        userEmail,
        lastUpdated: Timestamp.fromDate(new Date())
      }, { merge: true });

      // Add the log to the user's logs subcollection
      const logsCollectionRef = collection(db, 'exerciseLogs', userEmail, 'logs');
      await addDoc(logsCollectionRef, {
        userEmail, // Store email in each log for easy querying/filtering
        exerciseName,
        category,
        weight,
        reps: reps ?? null,
        sets: sets ?? null,
        notes: notes ?? '',
        date: Timestamp.fromDate(date || new Date()),
        createdAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error adding exercise log:', error);
      throw new Error('Failed to add exercise log. Please try again.');
    }
  };

  /**
   * Delete an exercise log entry
   * Deletes from: exerciseLogs/{userEmail}/logs/{logId}
   */
  const deleteLog = async (logId: string): Promise<void> => {
    if (!isValidEmail(userEmail)) {
      throw new Error('User email is required and must be valid');
    }

    try {
      const logDocRef = doc(db, 'exerciseLogs', userEmail, 'logs', logId);
      await deleteDoc(logDocRef);
    } catch (error) {
      console.error('Error deleting exercise log:', error);
      throw new Error('Failed to delete exercise log. Please try again.');
    }
  };

  return { logs, loading, addLog, deleteLog };
}
