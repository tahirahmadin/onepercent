import { useState, useMemo } from "react";
import { Plus, ArrowLeft, Check, Trash2, Calendar, Trophy } from "lucide-react";
import { ExerciseCategory } from "../types/exercise";
import { predefinedExercises } from "../lib/exercises";
import { useExerciseLogs } from "../hooks/useExerciseLogs";

interface LogExerciseProps {
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
  Chest: "bg-green-900/30 text-green-400 border-green-700/50",
  Back: "bg-green-900/40 text-green-300 border-green-600/50",
  Shoulder: "bg-green-800/30 text-green-400 border-green-600/50",
  Triceps: "bg-green-800/40 text-green-300 border-green-600/50",
  Legs: "bg-green-900/40 text-green-400 border-green-700/50",
};

export function LogExercise({ userEmail }: LogExerciseProps) {
  const { logs, loading, addLog, deleteLog } = useExerciseLogs(userEmail);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [selectedExercise, setSelectedExercise] = useState<{
    name: string;
    category: ExerciseCategory;
  } | null>(null);
  const [weight, setWeight] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ExerciseCategory | "All"
  >("All");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleExerciseSelect = (name: string, category: ExerciseCategory) => {
    setSelectedExercise({ name, category });
    setFormStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise || !weight) return;

    await addLog(
      selectedExercise.name,
      selectedExercise.category,
      parseFloat(weight),
      undefined,
      undefined,
      undefined,
      selectedDate
    );

    setShowForm(false);
    setFormStep(1);
    setSelectedExercise(null);
    setWeight("");
    setSelectedDate(new Date());
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormStep(1);
    setSelectedExercise(null);
    setWeight("");
    setSelectedDate(new Date());
  };

  const handleBack = () => {
    setFormStep(1);
    setSelectedExercise(null);
    setWeight("");
  };

  const handleDelete = async (logId: string) => {
    if (confirm("Are you sure you want to delete this log?")) {
      await deleteLog(logId);
    }
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const filteredExercises = predefinedExercises.filter((ex) => {
    return selectedCategory === "All" || ex.category === selectedCategory;
  });

  // Filter logs to only show last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const recentLogs = logs.filter((log) => log.date >= fourteenDaysAgo);

  const groupedLogs = recentLogs.reduce((acc, log) => {
    const dateKey = log.date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {} as Record<string, typeof logs>);

  // Calculate previous high weight for selected exercise
  const previousHighWeight = useMemo(() => {
    if (!selectedExercise) return null;

    const exerciseLogs = logs.filter(
      (log) => log.exerciseName === selectedExercise.name
    );

    if (exerciseLogs.length === 0) return null;

    const maxWeight = Math.max(...exerciseLogs.map((log) => log.weight));
    return maxWeight;
  }, [logs, selectedExercise]);

  if (showForm) {
    return (
      <div className="h-full flex flex-col bg-black">
        <div className="bg-gray-950/80 backdrop-blur-xl border-b border-green-900/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={formStep === 1 ? handleCancel : handleBack}
              className="text-green-700 hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-green-400">
              {formStep === 1 ? "Select Exercise" : "Enter Weight"}
            </h2>
            <div className="w-6"></div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex-1 h-1 rounded-full transition-all ${
                formStep >= 1 ? "bg-green-600" : "bg-gray-900"
              }`}
            ></div>
            <div
              className={`flex-1 h-1 rounded-full transition-all ${
                formStep >= 2 ? "bg-green-600" : "bg-gray-900"
              }`}
            ></div>
          </div>
        </div>

        {formStep === 1 ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 pb-24">
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
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

              <div className="grid grid-cols-2 gap-3">
                {filteredExercises.map((exercise) => (
                  <button
                    key={exercise.name}
                    onClick={() =>
                      handleExerciseSelect(exercise.name, exercise.category)
                    }
                    className="bg-gray-950/80 hover:bg-gray-900 backdrop-blur-xl rounded-xl p-3 border border-green-900/30 hover:border-green-600/50 transition-all text-left group"
                  >
                    <div className="aspect-square rounded-lg mb-2 overflow-hidden">
                      <img
                        src={exercise.imageUrl}
                        alt={exercise.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-green-400 font-semibold text-sm mb-1 line-clamp-2">
                      {exercise.name}
                    </h4>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-md border ${
                        categoryColors[exercise.category]
                      }`}
                    >
                      {exercise.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 pb-24">
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="bg-gray-950/80 backdrop-blur-xl rounded-2xl p-6 border border-green-900/30 mb-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-green-400 mb-2">
                    {selectedExercise?.name}
                  </h3>
                  <span
                    className={`inline-block text-xs px-3 py-1 rounded-md border ${
                      categoryColors[selectedExercise?.category || "Back"]
                    }`}
                  >
                    {selectedExercise?.category}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-500 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-700 pointer-events-none z-10" />
                      <input
                        type="date"
                        value={formatDateForInput(selectedDate)}
                        onChange={(e) =>
                          setSelectedDate(new Date(e.target.value))
                        }
                        max={formatDateForInput(new Date())}
                        className="w-full bg-black text-green-400 pl-11 pr-4 py-3.5 rounded-xl border border-green-900/50 focus:border-green-600/50 focus:outline-none focus:ring-2 focus:ring-green-600/20 text-base min-h-[48px] touch-manipulation"
                        style={{
                          fontSize: "16px", // Prevents zoom on iOS
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-500 mb-2">
                      End Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-black text-green-400 text-center text-3xl px-4 py-6 rounded-xl border border-green-900/50 focus:border-green-600/50 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                      placeholder="0"
                      autoFocus
                      required
                    />
                  </div>
                </div>
              </div>

              {previousHighWeight !== null && (
                <div className="bg-green-950/40 backdrop-blur-xl rounded-2xl p-4 border border-green-800/30 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-900/50 p-2 rounded-lg">
                      <Trophy className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-green-700 mb-0.5">
                        Previous High Weight
                      </div>
                      <div className="text-xl font-bold text-green-400">
                        {previousHighWeight} kg
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-black font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Save Log
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 bg-gray-950/50">
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-green-600 hover:bg-green-500 text-black font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Exercise Log
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-green-600"></div>
            <p className="text-green-700 mt-3 text-sm">Loading logs...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedLogs)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dayLogs]) => (
                <div key={date}>
                  <h3 className="text-xs font-semibold text-green-700 mb-1.5 sticky top-0 bg-black/90 backdrop-blur py-1.5 rounded-lg px-2">
                    {date}
                  </h3>
                  <div className="space-y-1.5">
                    {dayLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-gray-950/80 backdrop-blur-xl rounded-lg p-2 border border-green-900/30"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <h4 className="text-green-400 font-semibold text-sm truncate">
                                {log.exerciseName}
                              </h4>
                              <span
                                className={`inline-block text-xs px-1.5 py-0.5 rounded border ${
                                  categoryColors[log.category]
                                } flex-shrink-0`}
                              >
                                {log.category}
                              </span>
                            </div>
                            <span className="text-base font-bold text-green-500 flex-shrink-0">
                              {log.weight} kg
                            </span>
                          </div>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="p-1 text-green-700 hover:text-red-400 hover:bg-red-500/10 rounded transition-all flex-shrink-0"
                            title="Delete log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {recentLogs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-green-700 text-sm">
                  No logs in the last 14 days. Start tracking your progress!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
