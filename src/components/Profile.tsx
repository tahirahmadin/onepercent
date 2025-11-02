import { useMemo } from 'react';
import { User as UserIcon, Mail, Calendar, Dumbbell, TrendingUp, Award, Target, Flame } from 'lucide-react';
import { User } from 'firebase/auth';
import { useExerciseLogs } from '../hooks/useExerciseLogs';
import { ExerciseCategory } from '../types/exercise';

interface ProfileProps {
  user: User;
}

const categoryColors: Record<ExerciseCategory, string> = {
  Chest: 'bg-green-700',
  Back: 'bg-green-600',
  Shoulder: 'bg-green-800',
  Core: 'bg-green-600',
  Triceps: 'bg-green-700',
  Legs: 'bg-green-800',
};

export function Profile({ user }: ProfileProps) {
  const { logs, loading } = useExerciseLogs(user.email);

  const insights = useMemo(() => {
    if (logs.length === 0) {
      return {
        totalWorkouts: 0,
        uniqueExercises: 0,
        favoriteCategory: null,
        currentStreak: 0,
        maxWeight: 0,
        avgWorkoutsPerWeek: 0,
        firstWorkoutDate: null,
        lastWorkoutDate: null,
        topExercise: null,
      };
    }

    const totalWorkouts = logs.length;

    const uniqueExercises = new Set(logs.map((log) => log.exerciseName)).size;

    const categoryCount = new Map<ExerciseCategory, number>();
    logs.forEach((log) => {
      categoryCount.set(log.category, (categoryCount.get(log.category) || 0) + 1);
    });
    const favoriteCategory = Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const exerciseCount = new Map<string, { name: string; category: ExerciseCategory; count: number }>();
    logs.forEach((log) => {
      const existing = exerciseCount.get(log.exerciseName);
      if (existing) {
        existing.count += 1;
      } else {
        exerciseCount.set(log.exerciseName, {
          name: log.exerciseName,
          category: log.category,
          count: 1,
        });
      }
    });
    const topExercise = Array.from(exerciseCount.values()).sort((a, b) => b.count - a.count)[0] || null;

    const maxWeight = Math.max(...logs.map((log) => log.weight));

    const sortedLogs = [...logs].sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstWorkoutDate = sortedLogs[0]?.date || null;
    const lastWorkoutDate = sortedLogs[sortedLogs.length - 1]?.date || null;

    const uniqueDates = new Set(logs.map((log) => log.date.toDateString()));
    const sortedDates = Array.from(uniqueDates)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const dateStr = checkDate.toDateString();
      if (uniqueDates.has(dateStr)) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    const daysSinceFirst = firstWorkoutDate
      ? Math.max(1, Math.floor((Date.now() - firstWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 1;
    const avgWorkoutsPerWeek = (uniqueDates.size / daysSinceFirst) * 7;

    return {
      totalWorkouts,
      uniqueExercises,
      favoriteCategory,
      currentStreak,
      maxWeight,
      avgWorkoutsPerWeek,
      firstWorkoutDate,
      lastWorkoutDate,
      topExercise,
    };
  }, [logs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-green-600"></div>
          <p className="text-green-700 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 pb-24 space-y-6">
        <div className="bg-green-950/30 backdrop-blur-xl rounded-2xl p-6 border border-green-800/30">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-20 h-20 rounded-full border-4 border-green-700/50" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-black" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-400 mb-1">{user.displayName || 'User'}</h2>
              <div className="flex items-center gap-2 text-green-500">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              {insights.firstWorkoutDate && (
                <div className="flex items-center gap-2 text-green-700 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Member since {insights.firstWorkoutDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {logs.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-950/40 backdrop-blur-xl rounded-2xl p-4 border border-green-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-400">Current Streak</span>
                </div>
                <div className="text-3xl font-bold text-green-400">{insights.currentStreak}</div>
                <div className="text-xs text-green-700 mt-1">days in a row</div>
              </div>

              <div className="bg-green-950/50 backdrop-blur-xl rounded-2xl p-4 border border-green-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-400">Top Exercise</span>
                </div>
                {insights.topExercise ? (
                  <>
                    <div className="text-lg font-bold text-green-400 truncate">{insights.topExercise.name}</div>
                    <div className="text-xs text-green-700 mt-1">{insights.topExercise.count} logs</div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-400">-</div>
                    <div className="text-xs text-green-700 mt-1">no data</div>
                  </>
                )}
              </div>

              <div className="bg-green-950/60 backdrop-blur-xl rounded-2xl p-4 border border-green-700/40">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-400">Exercises</span>
                </div>
                <div className="text-3xl font-bold text-green-400">{insights.uniqueExercises}</div>
                <div className="text-xs text-green-700 mt-1">unique exercises</div>
              </div>

              <div className="bg-green-950/50 backdrop-blur-xl rounded-2xl p-4 border border-green-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-400">Max Weight</span>
                </div>
                <div className="text-3xl font-bold text-green-400">{insights.maxWeight}</div>
                <div className="text-xs text-green-700 mt-1">kg personal best</div>
              </div>
            </div>

            <div className="bg-gray-950/80 backdrop-blur-xl rounded-2xl p-5 border border-green-900/30">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Training Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-500">Total Workouts</span>
                  <span className="text-green-400 font-semibold">{insights.totalWorkouts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-500">Avg Workouts per Week</span>
                  <span className="text-green-400 font-semibold">{insights.avgWorkoutsPerWeek.toFixed(1)}</span>
                </div>
                {insights.favoriteCategory && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-500">Favorite Category</span>
                    <span className={`${categoryColors[insights.favoriteCategory]} text-black px-3 py-1 rounded-lg text-sm font-semibold`}>
                      {insights.favoriteCategory}
                    </span>
                  </div>
                )}
                {insights.lastWorkoutDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-500">Last Workout</span>
                    <span className="text-green-400 font-semibold">{insights.lastWorkoutDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-950/80 backdrop-blur-xl rounded-2xl p-5 border border-green-900/30">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                Achievements
              </h3>
              <div className="space-y-3">
                {insights.totalWorkouts >= 10 && (
                  <div className="flex items-center gap-3 bg-green-900/20 rounded-xl p-3 border border-green-800/30">
                    <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-green-400 font-semibold">Getting Started</h4>
                      <p className="text-xs text-green-700">Logged 10+ workouts</p>
                    </div>
                  </div>
                )}
                {insights.totalWorkouts >= 50 && (
                  <div className="flex items-center gap-3 bg-green-900/30 rounded-xl p-3 border border-green-700/30">
                    <div className="w-12 h-12 rounded-full bg-green-900/40 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-green-400 font-semibold">Dedicated Trainer</h4>
                      <p className="text-xs text-green-700">Logged 50+ workouts</p>
                    </div>
                  </div>
                )}
                {insights.currentStreak >= 7 && (
                  <div className="flex items-center gap-3 bg-green-900/25 rounded-xl p-3 border border-green-800/30">
                    <div className="w-12 h-12 rounded-full bg-green-900/35 flex items-center justify-center">
                      <Flame className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-green-400 font-semibold">On Fire</h4>
                      <p className="text-xs text-green-700">7+ day streak</p>
                    </div>
                  </div>
                )}
                {insights.totalWorkouts < 10 && (
                  <div className="text-center py-8">
                    <p className="text-green-700">Keep logging workouts to unlock achievements!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-950/80 backdrop-blur-xl rounded-2xl p-8 border border-green-900/30 text-center">
            <Dumbbell className="w-16 h-16 text-green-900 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-400 mb-2">No Workout Data Yet</h3>
            <p className="text-green-700">Start logging your exercises to see your insights and achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
}
