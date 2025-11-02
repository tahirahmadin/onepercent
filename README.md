# 💪 OnePercent - Fitness Progress Tracker

<div align="center">

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.5-FFCA28?logo=firebase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)

**A modern, full-stack Progressive Web App for tracking workout progress with real-time analytics and insights.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Project Highlights](#-project-highlights)

</div>

---

## 📱 Overview

**OnePercent** is a beautifully designed fitness tracking application that helps users log exercises, visualize progress, and stay motivated through comprehensive analytics and achievement systems. Built with modern web technologies and best practices, this PWA delivers a seamless user experience across all devices.

### Why OnePercent?

The name "OnePercent" reflects the philosophy of continuous improvement - getting better by just 1% each day. This app empowers users to track their fitness journey, identify trends, and celebrate milestones along the way.

---

## ✨ Features

### 🏋️ Exercise Logging
- **20+ Predefined Exercises** across 6 categories (Chest, Back, Shoulder, Core, Triceps, Legs)
- **Intuitive Multi-Step Form** with category filtering and exercise selection
- **Date Selection** for logging past workouts
- **Quick Entry** - log weight, reps, sets, and notes in seconds
- **Real-time Updates** with Firebase Firestore listeners

### 📊 Advanced Analytics
- **Progress Visualization** - Beautiful SVG charts showing weight progression over time
- **Exercise-Specific Trends** - Track individual exercise performance with trend indicators (↑ ↓ ↔)
- **Category Breakdowns** - Analyze workout distribution across muscle groups
- **30-Day Overview** - Quick stats for recent activity
- **Progress Percentage** - Automatic calculation of weight changes over time

### 👤 Profile & Insights
- **Personal Statistics** - Total workouts, unique exercises, favorite categories
- **Achievement System** - Unlock badges for milestones:
  - 🎯 Getting Started (10+ workouts)
  - 📈 Dedicated Trainer (50+ workouts)
  - 🔥 On Fire (7+ day streak)
- **Streak Tracking** - Maintain workout consistency
- **Training Analytics** - Average workouts per week, first/last workout dates
- **Personal Records** - Maximum weight achievements

### 🎨 User Experience
- **Dark Theme** - Eye-friendly dark UI with green accent colors
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **PWA Ready** - Installable as a native app
- **Smooth Animations** - Polished transitions and micro-interactions
- **Real-time Sync** - Instant updates across all devices

---

## 🛠 Tech Stack

### Frontend
- **React 18.3** - Modern UI library with hooks
- **TypeScript 5.5** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### Backend & Services
- **Firebase Authentication** - Google OAuth integration
- **Cloud Firestore** - Real-time NoSQL database
- **Firebase Analytics** - User behavior tracking

### Development Tools
- **ESLint** - Code quality and linting
- **PostCSS** - CSS processing
- **TypeScript ESLint** - Type-aware linting

---

## 🏗 Architecture

### Project Structure
```
src/
├── components/          # React components
│   ├── Analytics.tsx    # Progress visualization & trends
│   ├── LogExercise.tsx  # Exercise logging interface
│   ├── Login.tsx        # Authentication UI
│   └── Profile.tsx      # User profile & statistics
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx      # Authentication state management
│   └── useExerciseLogs.tsx # Exercise data operations
├── lib/                 # Utilities & configurations
│   ├── exercises.ts     # Exercise definitions
│   └── firebase.ts      # Firebase initialization
├── types/               # TypeScript type definitions
│   └── exercise.ts      # Exercise-related types
└── App.tsx              # Main application component
```

### Key Architectural Decisions

#### 🔐 Authentication Architecture
- **Google OAuth** for secure, passwordless authentication
- **Auth State Persistence** using Firebase Auth state listeners
- **Mock Admin Mode** for development and testing
- **Seamless Session Management** with automatic token refresh

#### 💾 Data Architecture
- **Firestore Subcollection Pattern** - User email as document ID with logs in subcollection
  ```
  exerciseLogs/
    {userEmail}/
      logs/
        {logId}/
  ```
- **Real-time Listeners** - `onSnapshot` for instant UI updates
- **Optimized Queries** - Indexed queries with `orderBy` for performance
- **Type Safety** - Full TypeScript coverage for data models

#### 🎣 Custom Hooks Pattern
- **`useAuth`** - Centralized authentication logic
- **`useExerciseLogs`** - CRUD operations with reactive state
- **Separation of Concerns** - Business logic separated from UI components

#### 📱 Component Design
- **Functional Components** - Modern React with hooks
- **Prop Drilling Avoidance** - Context or direct prop passing where appropriate
- **Memoization** - `useMemo` for expensive calculations (analytics, filtering)
- **Conditional Rendering** - Smart loading and empty states

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Firebase Account** (for authentication and database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OnePercent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Google Provider)
   - Create a Firestore database
   - **Set up Firestore Security Rules** (IMPORTANT):
     1. Go to Firestore Database → Rules in Firebase Console
     2. Copy the rules from `firestore.rules` file in this project
     3. Paste and publish the rules
     4. Rules ensure users can only access their own data (identified by email)
   - Copy your Firebase config to `src/lib/firebase.ts`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Type check without emitting

---

## 💡 Project Highlights

### 🎯 Technical Excellence

#### Performance Optimizations
- **Code Splitting** - Lazy loading and dynamic imports ready
- **Memoization** - Expensive calculations cached with `useMemo`
- **Optimized Queries** - Firestore queries use indexes and `orderBy`
- **Efficient Re-renders** - Component-level state management

#### Code Quality
- **TypeScript** - 100% type coverage
- **ESLint** - Consistent code style
- **Modular Architecture** - Reusable components and hooks
- **Clean Code Principles** - Single responsibility, DRY, SOLID

#### User Experience
- **Progressive Enhancement** - Works without JavaScript (graceful degradation)
- **Accessibility** - Semantic HTML, ARIA labels
- **Error Handling** - Comprehensive error boundaries and user feedback
- **Loading States** - Smooth loading indicators

### 🔥 Firebase Integration

- **Real-time Database** - Live data synchronization
- **Secure Authentication** - Google OAuth with token management
- **Optimized Data Structure** - Email-based document IDs for efficient queries
- **Scalable Architecture** - Subcollections for better performance
- **Security Rules** - Comprehensive Firestore rules ensuring users can only access their own data

### 🎨 UI/UX Design

- **Modern Design System** - Consistent color palette and typography
- **Responsive Layout** - Mobile-first approach
- **Smooth Animations** - CSS transitions and transforms
- **Visual Feedback** - Clear success/error states

---

## 📈 Future Enhancements

Potential features for future iterations:
- [ ] Social features - Share progress with friends
- [ ] Workout templates and programs
- [ ] Nutrition tracking integration
- [ ] Export data (CSV/PDF reports)
- [ ] Dark/Light theme toggle
- [ ] Push notifications for workout reminders
- [ ] Multi-language support
- [ ] Advanced filtering and search

---

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Tahir**

- Portfolio: [Add your portfolio link]
- LinkedIn: [Add your LinkedIn]
- Email: tahir@sayy.ai

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Firebase**

⭐ Star this repo if you find it helpful!

</div>
