import React, { useState } from 'react';
import { StudyProblem, ConceptNote } from '../lib/types';
import { MathView } from './MathView';
import { User } from 'firebase/auth';

interface CloudNotebookViewProps {
  problems: StudyProblem[];
  concepts: ConceptNote[];
  currentUser: User | null;
  onSelectProblem: (problem: StudyProblem) => void;
  onDeleteProblem: (problemId: string) => Promise<void>;
  onDeleteConcept: (conceptId: string) => Promise<void>;
  onOpenSignIn: () => void;
}

export const CloudNotebookView: React.FC<CloudNotebookViewProps> = ({
  problems,
  concepts,
  currentUser,
  onSelectProblem,
  onDeleteProblem,
  onDeleteConcept,
  onOpenSignIn,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'problems' | 'concepts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<{ type: 'problem'; data: StudyProblem } | { type: 'concept'; data: ConceptNote } | null>(null);

  const filteredProblems = problems.filter((p) => {
    if (activeFilter === 'concepts') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.question.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q)
    );
  });

  const filteredConcepts = concepts.filter((c) => {
    if (activeFilter === 'problems') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      c.simpleAnalogy.toLowerCase().includes(q)
    );
  });

  const totalCount = filteredProblems.length + filteredConcepts.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#f3edf7] dark:bg-[#211f26] border border-[#cac4d0]/30 dark:border-[#49454f]/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4e4f6] dark:bg-[#3a4857] text-[#0d1d2a] dark:text-[#d4e4f6] text-xs font-semibold mb-2">
            <span className="material-symbols-outlined text-sm">cloud_sync</span>
            Secure Firestore Cloud Storage
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1c1e] dark:text-[#e6e0e9]">
            My Academic Notebook
          </h1>
          <p className="text-sm text-[#51606f] dark:text-[#b8c8da] mt-1">
            All your solved problems, step derivations, and universal concepts saved securely.
          </p>
        </div>

        {/* Auth / Cloud Status Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#141218] border border-[#cac4d0]/40 dark:border-[#49454f]/40">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentUser ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'}`}>
            <span className="material-symbols-outlined text-xl">
              {currentUser ? 'cloud_done' : 'cloud_off'}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1a1c1e] dark:text-[#e6e0e9]">
              {currentUser ? 'Cloud Synced via Google' : 'Local Storage Mode'}
            </p>
            <p className="text-[11px] text-[#51606f] dark:text-[#b8c8da]">
              {currentUser ? currentUser.email : 'Sign in to access your notes anywhere'}
            </p>
          </div>
          {!currentUser && (
            <button
              type="button"
              onClick={onOpenSignIn}
              className="ml-2 px-3 py-1.5 rounded-full bg-[#00639b] dark:bg-[#90cdff] text-white dark:text-[#003355] text-xs font-semibold hover:brightness-105"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#1d1b20] border border-[#cac4d0]/40 dark:border-[#49454f]/40 shadow-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f7f2fa] dark:bg-[#2b2930] rounded-full w-full sm:w-auto">
          {[
            { id: 'all', label: `All Items (${problems.length + concepts.length})` },
            { id: 'problems', label: `Solved Problems (${problems.length})` },
            { id: 'concepts', label: `Concepts (${concepts.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeFilter === tab.id
                  ? 'bg-[#00639b] dark:bg-[#90cdff] text-white dark:text-[#003355] shadow-xs'
                  : 'text-[#51606f] dark:text-[#b8c8da] hover:bg-[#cac4d0]/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#79747e]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notebook..."
            className="w-full pl-9 pr-3 py-1.5 rounded-full border border-[#cac4d0] dark:border-[#49454f] text-xs bg-[#fdfcff] dark:bg-[#141218] text-[#1a1c1e] dark:text-[#e6e0e9] focus:outline-none focus:border-[#00639b]"
          />
        </div>
      </div>

      {/* Content Grid or Empty State */}
      {totalCount === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1d1b20] border border-[#cac4d0]/40 dark:border-[#49454f]/40 space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#f3edf7] dark:bg-[#211f26] text-[#51606f] dark:text-[#b8c8da] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">menu_book</span>
          </div>
          <h3 className="text-base font-bold text-[#1a1c1e] dark:text-[#e6e0e9]">
            Your Notebook is Ready
          </h3>
          <p className="text-xs text-[#51606f] dark:text-[#b8c8da] max-w-sm mx-auto">
            When you solve problems in the Solver or explore concepts in the Universe tab, save them to access your high-precision notes anytime!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Solved Problems */}
          {filteredProblems.map((prob) => (
            <div
              key={prob.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#1d1b20] border border-[#cac4d0]/40 dark:border-[#49454f]/40 hover:border-[#00639b] dark:hover:border-[#90cdff] hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#cbe6ff] dark:bg-[#004b77] text-[#001d33] dark:text-[#cbe6ff]">
                      {prob.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f3edf7] dark:bg-[#2b2930] text-[#51606f] dark:text-[#b8c8da]">
                      {prob.gradeLevel.replace('_', ' ')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this problem from your notebook?')) {
                        onDeleteProblem(prob.id);
                      }
                    }}
                    className="text-[#79747e] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Delete problem"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>

                <h3 className="text-sm font-bold text-[#1a1c1e] dark:text-[#e6e0e9] group-hover:text-[#00639b] dark:group-hover:text-[#90cdff] transition-colors">
                  {prob.title}
                </h3>
                <p className="text-xs text-[#51606f] dark:text-[#b8c8da] mt-1 line-clamp-2">
                  {prob.question}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#cac4d0]/20 flex items-center justify-between">
                <span className="text-[11px] text-[#79747e]">
                  {new Date(prob.createdAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectProblem(prob)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#00639b] dark:text-[#90cdff] hover:underline"
                >
                  <span>Open Solution</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}

          {/* Saved Concept Notes */}
          {filteredConcepts.map((concept) => (
            <div
              key={concept.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#1d1b20] border border-[#cac4d0]/40 dark:border-[#49454f]/40 hover:border-[#67587a] dark:hover:border-[#d2bfe6] hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eedcff] dark:bg-[#4e4061] text-[#221533] dark:text-[#eedcff]">
                      {concept.domain}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f3edf7] dark:bg-[#2b2930] text-[#51606f] dark:text-[#b8c8da]">
                      {concept.gradeLevel.replace('_', ' ')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this concept from your notebook?')) {
                        onDeleteConcept(concept.id);
                      }
                    }}
                    className="text-[#79747e] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Delete concept"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>

                <h3 className="text-sm font-bold text-[#1a1c1e] dark:text-[#e6e0e9] group-hover:text-[#67587a] dark:group-hover:text-[#d2bfe6] transition-colors">
                  {concept.title}
                </h3>
                <p className="text-xs text-[#51606f] dark:text-[#b8c8da] mt-1 line-clamp-2">
                  {concept.simpleAnalogy}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#cac4d0]/20 flex items-center justify-between">
                <span className="text-[11px] text-[#79747e]">
                  {new Date(concept.createdAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedItem({ type: 'concept', data: concept })}
                  className="flex items-center gap-1 text-xs font-semibold text-[#67587a] dark:text-[#d2bfe6] hover:underline"
                >
                  <span>View Concept Note</span>
                  <span className="material-symbols-outlined text-sm">visibility</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing saved concept note */}
      {selectedItem && selectedItem.type === 'concept' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-[#1d1b20] rounded-3xl p-6 border border-[#cac4d0]/40 dark:border-[#49454f]/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eedcff] dark:bg-[#4e4061] text-[#221533] dark:text-[#eedcff]">
                  {selectedItem.data.domain} • {selectedItem.data.gradeLevel.replace('_', ' ')}
                </span>
                <h3 className="text-xl font-bold text-[#1a1c1e] dark:text-[#e6e0e9] mt-1">
                  {selectedItem.data.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#eedcff]/20 dark:bg-[#4e4061]/20 border border-[#eedcff] dark:border-[#4e4061]/40 space-y-1">
              <h4 className="text-xs font-bold text-[#67587a] dark:text-[#d2bfe6]">
                Intuitive Simple Analogy
              </h4>
              <p className="text-xs text-[#1a1c1e] dark:text-[#e6e0e9] leading-relaxed">
                <MathView content={selectedItem.data.simpleAnalogy} />
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#cbe6ff]/20 dark:bg-[#004b77]/20 border border-[#cbe6ff] dark:border-[#004b77]/40 space-y-2">
              <h4 className="text-xs font-bold text-[#00639b] dark:text-[#90cdff]">
                High-Precision Deep Dive
              </h4>
              <div className="text-xs text-[#1a1c1e] dark:text-[#e6e0e9] leading-relaxed">
                <MathView content={selectedItem.data.deepDive} />
              </div>
            </div>

            {selectedItem.data.keyFormulas && selectedItem.data.keyFormulas.length > 0 && (
              <div className="p-3 rounded-2xl bg-[#f7f2fa] dark:bg-[#211f26] space-y-1">
                <h4 className="text-[11px] font-bold uppercase text-[#51606f]">Key Formulas</h4>
                <div className="space-y-1">
                  {selectedItem.data.keyFormulas.map((f, i) => (
                    <div key={i} className="text-xs p-2 rounded-lg bg-white dark:bg-[#141218]">
                      <MathView content={f} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
