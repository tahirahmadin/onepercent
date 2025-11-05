export type ExerciseCategory =
  | "Chest"
  | "Back"
  | "Shoulder"
  | "Triceps"
  | "Biceps"
  | "Legs";

export interface ExerciseLog {
  id: string;
  userEmail: string;
  exerciseName: string;
  category: ExerciseCategory;
  weight: number;
  reps?: number;
  sets?: number;
  notes?: string;
  date: Date;
  createdAt: Date;
}

export interface Exercise {
  name: string;
  category: ExerciseCategory;
  imageUrl: string;
}
