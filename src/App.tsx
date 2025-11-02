import { useState } from "react";
import { Dumbbell, TrendingUp, LogOut, User } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { Login } from "./components/Login";
import { LogExercise } from "./components/LogExercise";
import { Analytics } from "./components/Analytics";
import { Profile } from "./components/Profile";

type Tab = "logging" | "analytics" | "profile";

function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("logging");

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-600 p-4 rounded-2xl shadow-2xl animate-pulse">
              <Dumbbell className="w-10 h-10 text-black" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">OnePercent</h2>
          <p className="text-green-700 text-sm mb-6">Track Your Progress</p>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-900/30 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onSignIn={signInWithGoogle} />;
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      <header className="bg-gray-950/80 backdrop-blur-xl border-b border-green-900/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-xl shadow-lg">
            <Dumbbell className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-green-400">OnePercent</h1>
            <p className="text-xs text-green-700">Track Your Progress</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-green-400">
              {user.displayName}
            </div>
            <div className="text-xs text-green-700">{user.email}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center sm:hidden">
            <User className="w-5 h-5 text-black" />
          </div>
          <button
            onClick={signOut}
            className="p-2 rounded-xl bg-gray-900/50 hover:bg-gray-900 text-green-600 hover:text-green-400 transition-all"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden pb-20">
        {activeTab === "logging" && <LogExercise userEmail={user.email} />}
        {activeTab === "analytics" && <Analytics userEmail={user.email} />}
        {activeTab === "profile" && <Profile user={user} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-t border-green-900/30 safe-area-inset-bottom z-50">
        <div className="flex max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab("logging")}
            className={`flex-1 py-4 px-4 font-semibold transition-all ${
              activeTab === "logging" ? "text-green-400" : "text-green-800"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <Dumbbell className="w-6 h-6" />
              <span className="text-xs">Log</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 py-4 px-4 font-semibold transition-all ${
              activeTab === "analytics" ? "text-green-400" : "text-green-800"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs">Analytics</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-4 px-4 font-semibold transition-all ${
              activeTab === "profile" ? "text-green-400" : "text-green-800"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <User className="w-6 h-6" />
              <span className="text-xs">Profile</span>
            </div>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
