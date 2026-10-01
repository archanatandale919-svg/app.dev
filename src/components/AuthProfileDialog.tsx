import React, { useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { GradeLevel, ExplanationStyle, UserProfile } from '../lib/types';
import { GradeLevelSelector } from './GradeLevelSelector';

interface AuthProfileDialogProps {
  currentUser: User | null;
  currentGradeLevel: GradeLevel;
  onGradeLevelChange: (level: GradeLevel) => void;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => Promise<void>;
  savedProblemsCount: number;
  savedConceptsCount: number;
}

export const AuthProfileDialog: React.FC<AuthProfileDialogProps> = ({
  currentUser,
  currentGradeLevel,
  onGradeLevelChange,
  onClose,
  onSaveProfile,
  savedProblemsCount,
  savedConceptsCount,
}) => {
  const [preferredTone, setPreferredTone] = useState<ExplanationStyle>('conversational');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const profile: UserProfile = {
          userId: result.user.uid,
          displayName: result.user.displayName || 'Student',
          email: result.user.email || '',
          photoURL: result.user.photoURL || undefined,
          gradeLevel: currentGradeLevel,
          preferredTone,
          favoriteSubjects: ['Mathematics', 'Physics'],
          updatedAt: new Date().toISOString(),
        };
        await onSaveProfile(profile);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMsg(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="max-w-md w-full bg-white dark:bg-[#1d1b20] rounded-3xl p-6 border border-[#cac4d0]/40 dark:border-[#49454f]/40 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#cac4d0]/30 dark:border-[#49454f]/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#00639b] dark:text-[#90cdff]">
              account_circle
            </span>
            <h2 className="text-lg font-bold text-[#1a1c1e] dark:text-[#e6e0e9]">
              Student Account & Cloud Sync
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center hover:bg-neutral-200"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* User Card */}
        {currentUser ? (
          <div className="p-4 rounded-2xl bg-[#cbe6ff]/30 dark:bg-[#004b77]/30 border border-[#00639b]/20 dark:border-[#90cdff]/20 space-y-3">
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-12 h-12 rounded-full border-2 border-[#00639b]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#00639b] text-white flex items-center justify-center font-bold text-lg">
                  {currentUser.displayName ? currentUser.displayName[0] : 'S'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[#001d33] dark:text-[#cbe6ff] truncate">
                  {currentUser.displayName || 'Student Scholar'}
                </h3>
                <p className="text-xs text-[#51606f] dark:text-[#b8c8da] truncate">
                  {currentUser.email}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">cloud_done</span>
                  <span>Google Cloud Firestore Connected</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#00639b]/10 text-center">
              <div className="p-2 rounded-xl bg-white/70 dark:bg-[#141218]/60">
                <span className="text-xs font-bold text-[#00639b] dark:text-[#90cdff] block">
                  {savedProblemsCount}
                </span>
                <span className="text-[10px] text-[#51606f] dark:text-[#b8c8da]">
                  Solved Problems
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-[#141218]/60">
                <span className="text-xs font-bold text-[#67587a] dark:text-[#d2bfe6] block">
                  {savedConceptsCount}
                </span>
                <span className="text-[10px] text-[#51606f] dark:text-[#b8c8da]">
                  Concept Notes
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2 rounded-full border border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#f7f2fa] dark:bg-[#211f26] border border-[#cac4d0]/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#cbe6ff] dark:bg-[#004b77] text-[#001d33] dark:text-[#cbe6ff] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">lock_person</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1a1c1e] dark:text-[#e6e0e9]">
                Sign In to Save Your Learning Data
              </h3>
              <p className="text-xs text-[#51606f] dark:text-[#b8c8da] mt-1 max-w-xs mx-auto">
                Securely store your solved problems, step proofs, and flashcards across all devices with Google Firebase.
              </p>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2 rounded-xl">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              disabled={isSigningIn}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#00639b] dark:bg-[#90cdff] text-white dark:text-[#003355] text-xs font-bold hover:brightness-105 shadow-sm transition-all"
            >
              {isSigningIn ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Sign In with Google</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Academic Settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#51606f] dark:text-[#b8c8da]">
            Academic Preferences
          </h3>

          <GradeLevelSelector
            value={currentGradeLevel}
            onChange={onGradeLevelChange}
          />

          <div>
            <label className="text-xs font-semibold text-[#51606f] dark:text-[#b8c8da] block mb-1.5">
              Default Explanation Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'eli5', label: 'ELI5 / Simple Analogies' },
                { id: 'conversational', label: 'Conversational Friendly' },
                { id: 'structured_academic', label: 'Structured Academic' },
                { id: 'rigorous_proof', label: 'Rigorous Formal Proof' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPreferredTone(item.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                    preferredTone === item.id
                      ? 'bg-[#cbe6ff] dark:bg-[#004b77] border-[#00639b] text-[#001d33] dark:text-[#cbe6ff]'
                      : 'bg-[#f7f2fa] dark:bg-[#211f26] border-[#cac4d0]/40 text-[#51606f] dark:text-[#b8c8da]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-full bg-[#f3edf7] dark:bg-[#2b2930] text-[#1a1c1e] dark:text-[#e6e0e9] text-xs font-semibold hover:bg-[#ece6f0] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
