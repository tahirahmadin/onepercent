import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Dumbbell,
  Target,
} from "lucide-react";
import { useExerciseLogs } from "../hooks/useExerciseLogs";
import { ExerciseCategory } from "../types/exercise";

interface AnalyticsProps {
  userEmail: string | null;
}

const categories: ExerciseCategory[] = [
  "Chest",
  "Back",
  "Shoulder",
  "Triceps",
  "Legs",
];

const categoryColors: Record<ExerciseCategory, string> = {
  Chest: "bg-green-700",
  Back: "bg-green-600",
  Shoulder: "bg-green-800",
  Triceps: "bg-green-700",
  Legs: "bg-green-800",
};

const categoryBorderColors: Record<ExerciseCategory, string> = {
  Chest: "border-green-700",
  Back: "border-green-600",
  Shoulder: "border-green-800",
  Triceps: "border-green-700",
  Legs: "border-green-800",
};

export function Analytics({ userEmail }: AnalyticsProps) {
  const { logs, loading } = useExerciseLogs(userEmail);
  const [selectedCategory, setSelectedCategory] = useState<
    ExerciseCategory | "All"
  >("All");

  const analytics = useMemo(() => {
    const exerciseStats = new Map<
      string,
      {
        name: string;
        category: ExerciseCategory;
        logs: typeof logs;
        maxWeight: number;
        avgWeight: number;
        totalSets: number;
        lastLog: (typeof logs)[0];
        trend: "up" | "down" | "stable";
        trendPercentage: number;
      }
    >();

    logs.forEach((log) => {
      const existing = exerciseStats.get(log.exerciseName);
      if (existing) {
        existing.logs.push(log);
        existing.maxWeight = Math.max(existing.maxWeight, log.weight);
        existing.totalSets += log.sets || 1;
        if (log.date > existing.lastLog.date) {
          existing.lastLog = log;
        }
      } else {
        exerciseStats.set(log.exerciseName, {
          name: log.exerciseName,
          category: log.category,
          logs: [log],
          maxWeight: log.weight,
          avgWeight: log.weight,
          totalSets: log.sets || 1,
          lastLog: log,
          trend: "stable",
          trendPercentage: 0,
        });
      }
    });

    exerciseStats.forEach((stats) => {
      const totalWeight = stats.logs.reduce((sum, log) => sum + log.weight, 0);
      stats.avgWeight = totalWeight / stats.logs.length;

      const sortedLogs = [...stats.logs].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );
      if (sortedLogs.length >= 2) {
        const firstWeight = sortedLogs[0].weight;
        const lastWeight = sortedLogs[sortedLogs.length - 1].weight;
        const percentageChange =
          ((lastWeight - firstWeight) / firstWeight) * 100;

        stats.trendPercentage = Math.abs(percentageChange);

        if (percentageChange > 5) {
          stats.trend = "up";
        } else if (percentageChange < -5) {
          stats.trend = "down";
        } else {
          stats.trend = "stable";
        }
      }
    });

    return Array.from(exerciseStats.values()).sort(
      (a, b) => b.logs.length - a.logs.length
    );
  }, [logs]);

  const overallWeightByDate = useMemo(() => {
    const dateMap = new Map<
      string,
      { totalWeight: number; count: number; date: Date }
    >();

    logs.forEach((log) => {
      const dateKey = log.date.toLocaleDateString();
      const existing = dateMap.get(dateKey);
      if (existing) {
        existing.totalWeight += log.weight;
        existing.count += 1;
      } else {
        dateMap.set(dateKey, {
          totalWeight: log.weight,
          count: 1,
          date: log.date,
        });
      }
    });

    const dateStats = Array.from(dateMap.values())
      .map(({ totalWeight, count, date }) => ({
        date,
        avgWeight: totalWeight / count,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-30);

    return dateStats;
  }, [logs]);

  const filteredAnalytics = useMemo(() => {
    if (selectedCategory === "All") return analytics;
    return analytics.filter((ex) => ex.category === selectedCategory);
  }, [analytics, selectedCategory]);

  const categoryStats = useMemo(() => {
    const stats = new Map<ExerciseCategory, number>();
    logs.forEach((log) => {
      stats.set(log.category, (stats.get(log.category) || 0) + 1);
    });
    return Array.from(stats.entries()).sort((a, b) => b[1] - a[1]);
  }, [logs]);

  const recentProgress = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    return logs.filter((log) => log.date >= last30Days).length;
  }, [logs]);

  const progressPercentage = useMemo(() => {
    if (logs.length === 0) return 0;

    const sortedLogs = [...logs].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    const firstHalfEnd = Math.floor(sortedLogs.length / 2);
    const firstHalf = sortedLogs.slice(0, firstHalfEnd);
    const secondHalf = sortedLogs.slice(firstHalfEnd);

    if (firstHalf.length === 0 || secondHalf.length === 0) return 0;

    const avgFirstHalf =
      firstHalf.reduce((sum, log) => sum + log.weight, 0) / firstHalf.length;
    const avgSecondHalf =
      secondHalf.reduce((sum, log) => sum + log.weight, 0) / secondHalf.length;

    return ((avgSecondHalf - avgFirstHalf) / avgFirstHalf) * 100;
  }, [logs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-green-600"></div>
          <p className="text-green-700 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <Dumbbell className="w-16 h-16 text-green-900 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-400 mb-2">
            No Data Yet
          </h3>
          <p className="text-green-700">
            Start logging exercises to see your analytics
          </p>
        </div>
      </div>
    );
  }

  const maxOverallWeight = Math.max(
    ...overallWeightByDate.map((d) => d.avgWeight)
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 pb-24 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-950/40 backdrop-blur-xl rounded-2xl p-4 border border-green-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-400">Last 30 Days</span>
            </div>
            <div className="text-3xl font-bold text-green-400">
              {recentProgress}
            </div>
            <div className="text-xs text-green-700 mt-1">total exercises</div>
          </div>

          <div className="bg-green-950/50 backdrop-blur-xl rounded-2xl p-4 border border-green-700/30">
            <div className="flex items-center gap-2 mb-2">
              {progressPercentage >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm text-green-400">Progress</span>
            </div>
            <div
              className={`text-3xl font-bold ${
                progressPercentage >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {progressPercentage >= 0 ? "+" : ""}
              {progressPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-green-700 mt-1">avg weight change</div>
          </div>
        </div>

        <div className="bg-gray-950/80 backdrop-blur-xl rounded-2xl p-5 border border-green-900/30">
          <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Weight Progress
          </h3>
          <div className="relative h-48 bg-black rounded-lg p-4 pl-12">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="25"
                x2="100"
                y2="25"
                stroke="#0a3d0a"
                strokeWidth="0.3"
              />
              <line
                x1="0"
                y1="50"
                x2="100"
                y2="50"
                stroke="#0a3d0a"
                strokeWidth="0.3"
              />
              <line
                x1="0"
                y1="75"
                x2="100"
                y2="75"
                stroke="#0a3d0a"
                strokeWidth="0.3"
              />

              <polyline
                fill="none"
                stroke="#22c55e"
                strokeWidth="1"
                points={overallWeightByDate
                  .map((data, idx, arr) => {
                    const x = (idx / (arr.length - 1 || 1)) * 100;
                    const y =
                      100 - ((data.avgWeight / maxOverallWeight) * 80 + 10);
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />

              {overallWeightByDate.map((data, idx, arr) => {
                const x = (idx / (arr.length - 1 || 1)) * 100;
                const y = 100 - ((data.avgWeight / maxOverallWeight) * 80 + 10);
                return (
                  <circle key={idx} cx={x} cy={y} r="1.5" fill="#22c55e" />
                );
              })}
            </svg>

            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-green-800 -ml-2">
              <span>{maxOverallWeight.toFixed(0)}kg</span>
              <span>{(maxOverallWeight * 0.5).toFixed(0)}kg</span>
              <span>0kg</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-950/80 backdrop-blur-xl rounded-2xl p-5 border border-green-900/30">
          <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Exercise Progress by Category
          </h3>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === "All"
                  ? "bg-green-600 text-black shadow-lg"
                  : "bg-gray-900/50 text-green-600"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-green-600 text-black shadow-lg"
                    : "bg-gray-900/50 text-green-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredAnalytics.map((exercise) => {
              const sortedLogs = [...exercise.logs].sort(
                (a, b) => a.date.getTime() - b.date.getTime()
              );
              return (
                <div
                  key={exercise.name}
                  className="bg-black rounded-xl p-4 border border-green-900/30"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="text-green-400 font-semibold">
                        {exercise.name}
                      </h4>
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-md mt-1 ${
                          categoryColors[exercise.category]
                        } text-black`}
                      >
                        {exercise.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {exercise.trend === "up" && (
                          <div className="flex items-center gap-1 bg-green-900/40 px-2 py-1 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-500 font-semibold">
                              +{exercise.trendPercentage.toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {exercise.trend === "down" && (
                          <div className="flex items-center gap-1 bg-red-900/20 px-2 py-1 rounded-lg">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-red-400 font-semibold">
                              -{exercise.trendPercentage.toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {exercise.trend === "stable" && (
                          <div className="flex items-center gap-1 bg-gray-900/40 px-2 py-1 rounded-lg">
                            <Minus className="w-4 h-4 text-green-700" />
                            <span className="text-xs text-green-700 font-semibold">
                              Stable
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">
                          {exercise.maxWeight}kg
                        </div>
                        <div className="text-xs text-green-800">max weight</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-32 bg-gray-950 rounded-lg p-4 pl-12">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <line
                        x1="0"
                        y1="25"
                        x2="100"
                        y2="25"
                        stroke="#0a3d0a"
                        strokeWidth="0.3"
                      />
                      <line
                        x1="0"
                        y1="50"
                        x2="100"
                        y2="50"
                        stroke="#0a3d0a"
                        strokeWidth="0.3"
                      />
                      <line
                        x1="0"
                        y1="75"
                        x2="100"
                        y2="75"
                        stroke="#0a3d0a"
                        strokeWidth="0.3"
                      />

                      <polyline
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="1"
                        points={sortedLogs
                          .map((log, idx, arr) => {
                            const x = (idx / (arr.length - 1 || 1)) * 100;
                            const y =
                              100 -
                              ((log.weight / exercise.maxWeight) * 80 + 10);
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />

                      {sortedLogs.map((log, idx, arr) => {
                        const x = (idx / (arr.length - 1 || 1)) * 100;
                        const y =
                          100 - ((log.weight / exercise.maxWeight) * 80 + 10);
                        return (
                          <circle
                            key={idx}
                            cx={x}
                            cy={y}
                            r="1.5"
                            fill="#22c55e"
                          />
                        );
                      })}
                    </svg>

                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-green-800 -ml-2">
                      <span>{exercise.maxWeight}kg</span>
                      <span>{(exercise.maxWeight * 0.5).toFixed(0)}kg</span>
                      <span>0kg</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-green-900/30">
                    <div className="text-center">
                      <div className="text-green-700 text-xs mb-1">
                        Avg Weight
                      </div>
                      <div className="text-green-400 font-semibold">
                        {exercise.avgWeight.toFixed(1)}kg
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-700 text-xs mb-1">
                        Total Logs
                      </div>
                      <div className="text-green-400 font-semibold">
                        {exercise.logs.length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-700 text-xs mb-1">
                        Last Logged
                      </div>
                      <div className="text-green-400 font-semibold text-xs">
                        {exercise.lastLog.date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
