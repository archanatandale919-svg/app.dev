/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import {
  GradeLevel,
  StudyProblem,
  ConceptNote,
  UserProfile,
} from './lib/types';
import {
  getLocalProblems,
  saveLocalProblem,
  deleteLocalProblem,
  getLocalConcepts,
  saveLocalConcept,
  deleteLocalConcept,
  saveStudyProblemToCloud,
  loadUserStudyProblemsFromCloud,
  deleteStudyProblemFromCloud,
  saveConceptNoteToCloud,
  loadUserConceptsFromCloud,
  deleteConceptNoteFromCloud,
  saveUserProfileToCloud,
  loadUserProfileFromCloud,
} from './lib/storage';
import { M3NavBar, NavTab } from './components/M3NavBar';
import { ProblemSolverView } from './components/ProblemSolverView';
import { UniverseExplorerView } from './components/UniverseExplorerView';
import { CloudNotebookView } from './components/CloudNotebookView';
import { PracticeQuizView } from './components/PracticeQuizView';
import { AuthProfileDialog } from './components/AuthProfileDialog';
import { gradeLevelLabels } from './components/GradeLevelSelector';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('solver');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('high_school');
  const [problems, setProblems] = useState<StudyProblem[]>([]);
  const [concepts, setConcepts] = useState<ConceptNote[]>([]);
  const [selectedProblemForSolver, setSelectedProblemForSolver] = useState<StudyProblem | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load initial local data
  useEffect(() => {
    setProblems(getLocalProblems());
    setConcepts(getLocalConcepts());
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Load user profile if exists
          const profile = await loadUserProfileFromCloud(user.uid);
          if (profile?.gradeLevel) {
            setGradeLevel(profile.gradeLevel);
          }

          // Load cloud problems and concepts
          const cloudProblems = await loadUserStudyProblemsFromCloud(user.uid);
          const cloudConcepts = await loadUserConceptsFromCloud(user.uid);

          // Merge local offline items with cloud if any
          const localProbs = getLocalProblems();
          for (const lp of localProbs) {
            if (!cloudProblems.some((cp) => cp.id === lp.id)) {
              await saveStudyProblemToCloud({ ...lp, userId: user.uid });
              cloudProblems.unshift({ ...lp, userId: user.uid });
            }
          }

          setProblems(cloudProblems);
          setConcepts(cloudConcepts);
        } catch (err) {
          console.warn('Could not sync cloud data immediately, using local cache:', err);
          setProblems(getLocalProblems());
          setConcepts(getLocalConcepts());
        }
      } else {
        // Fallback to local items
        setProblems(getLocalProblems());
        setConcepts(getLocalConcepts());
      }
    });

    return () => unsubscribe();
  }, []);

  // Handlers for saving problems and concepts
  const handleSaveProblem = async (problem: StudyProblem) => {
    const updated = [problem, ...problems.filter((p) => p.id !== problem.id)];
    setProblems(updated);

    if (currentUser) {
      try {
        await saveStudyProblemToCloud({ ...problem, userId: currentUser.uid });
      } catch (err) {
        console.error('Error saving to Firestore, saved locally:', err);
        saveLocalProblem(problem);
      }
    } else {
      saveLocalProblem(problem);
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== problemId));
    if (currentUser) {
      try {
        await deleteStudyProblemFromCloud(problemId);
      } catch {
        deleteLocalProblem(problemId);
      }
    } else {
      deleteLocalProblem(problemId);
    }
  };

  const handleSaveConcept = async (concept: ConceptNote) => {
    const updated = [concept, ...concepts.filter((c) => c.id !== concept.id)];
    setConcepts(updated);

    if (currentUser) {
      try {
        await saveConceptNoteToCloud({ ...concept, userId: currentUser.uid });
      } catch (err) {
        console.error('Error saving concept note to Firestore, saved locally:', err);
        saveLocalConcept(concept);
      }
    } else {
      saveLocalConcept(concept);
    }
  };

  const handleDeleteConcept = async (conceptId: string) => {
    setConcepts((prev) => prev.filter((c) => c.id !== conceptId));
    if (currentUser) {
      try {
        await deleteConceptNoteFromCloud(conceptId);
      } catch {
        deleteLocalConcept(conceptId);
      }
    } else {
      deleteLocalConcept(conceptId);
    }
  };

  const handleSaveProfile = async (profile: UserProfile) => {
    if (currentUser) {
      await saveUserProfileToCloud(profile);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfcff] dark:bg-[#141218] text-[#1a1c1e] dark:text-[#e6e0e9] font-sans antialiased">
      {/* Material 3 Responsive Navigation Rail / Bar */}
      <M3NavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'profile') {
            setIsAuthModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        currentUser={currentUser}
        savedCount={problems.length + concepts.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top App Bar */}
        <header className="sticky top-0 z-20 h-16 px-4 md:px-8 bg-[#fdfcff]/80 dark:bg-[#141218]/80 backdrop-blur-md border-b border-[#cac4d0]/30 dark:border-[#49454f]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00639b] dark:text-[#90cdff] text-2xl font-bold">
                school
              </span>
              <span className="font-bold text-base md:text-lg tracking-tight text-[#1a1c1e] dark:text-[#e6e0e9]">
                OmniStudy <span className="text-[#00639b] dark:text-[#90cdff]">AI</span>
              </span>
            </div>

            {/* Current Academic Grade Pill */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3edf7] dark:bg-[#2b2930] hover:bg-[#ece6f0] text-xs font-semibold text-[#51606f] dark:text-[#b8c8da] border border-[#cac4d0]/40 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                {gradeLevelLabels[gradeLevel].icon}
              </span>
              <span>{gradeLevelLabels[gradeLevel].title}</span>
              <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-9 h-9 rounded-full bg-[#f3edf7] dark:bg-[#2b2930] text-[#51606f] dark:text-[#b8c8da] hover:bg-[#ece6f0] flex items-center justify-center transition-colors"
              title="Toggle theme"
            >
              <span className="material-symbols-outlined text-lg">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* User Profile / Sign In Button */}
            {currentUser ? (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[#cbe6ff] dark:bg-[#004b77] text-[#001d33] dark:text-[#cbe6ff] text-xs font-semibold hover:shadow-xs transition-all"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <span className="material-symbols-outlined text-base">account_circle</span>
                )}
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#00639b] dark:bg-[#90cdff] text-white dark:text-[#003355] text-xs font-semibold hover:brightness-105 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-base">login</span>
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 p-4 md:p-8">
          {activeTab === 'solver' && (
            <ProblemSolverView
              currentGradeLevel={gradeLevel}
              onGradeLevelChange={setGradeLevel}
              currentUser={currentUser}
              onSaveProblem={handleSaveProblem}
              initialProblem={selectedProblemForSolver}
            />
          )}

          {activeTab === 'universe' && (
            <UniverseExplorerView
              currentGradeLevel={gradeLevel}
              currentUser={currentUser}
              onSaveConcept={handleSaveConcept}
            />
          )}

          {activeTab === 'notebook' && (
            <CloudNotebookView
              problems={problems}
              concepts={concepts}
              currentUser={currentUser}
              onSelectProblem={(prob) => {
                setSelectedProblemForSolver(prob);
                setActiveTab('solver');
              }}
              onDeleteProblem={handleDeleteProblem}
              onDeleteConcept={handleDeleteConcept}
              onOpenSignIn={() => setIsAuthModalOpen(true)}
            />
          )}

          {activeTab === 'quiz' && (
            <PracticeQuizView
              problems={problems}
              currentGradeLevel={gradeLevel}
            />
          )}
        </main>
      </div>

      {/* Auth & Settings Modal */}
      {isAuthModalOpen && (
        <AuthProfileDialog
          currentUser={currentUser}
          currentGradeLevel={gradeLevel}
          onGradeLevelChange={setGradeLevel}
          onClose={() => setIsAuthModalOpen(false)}
          onSaveProfile={handleSaveProfile}
          savedProblemsCount={problems.length}
          savedConceptsCount={concepts.length}
        />
      )}
    </div>
  );
}
