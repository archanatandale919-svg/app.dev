import React, { useState } from 'react';
import { GradeLevel, ConceptNote } from '../lib/types';
import { GradeLevelSelector } from './GradeLevelSelector';
import { MathView } from './MathView';
import { User } from 'firebase/auth';

interface UniverseExplorerViewProps {
  currentGradeLevel: GradeLevel;
  currentUser: User | null;
  onSaveConcept: (concept: ConceptNote) => Promise<void>;
}

const UNIVERSAL_CONCEPTS = [
  {
    title: 'Quantum Entanglement & Superposition',
    domain: 'Quantum Physics',
    tag: 'Fundamental Cosmos',
    icon: 'grain',
    description: 'How two distant particles can be inextricably linked regardless of the distance between them.',
  },
  {
    title: 'General Relativity & Curved Spacetime',
    domain: 'Astrophysics & Gravitation',
    tag: 'Cosmology',
    icon: 'public',
    description: 'Why gravity is not a traditional force, but the curvature of space and time by mass-energy.',
  },
  {
    title: 'DNA Replication & CRISPR Gene Editing',
    domain: 'Molecular Biology & Genetics',
    tag: 'Life Sciences',
    icon: 'biotech',
    description: 'The code of life, how polymerases duplicate base pairs, and how molecular scissors cut sequences.',
  },
  {
    title: 'The Fundamental Theorem of Calculus',
    domain: 'Pure & Applied Mathematics',
    tag: 'Mathematics',
    icon: 'functions',
    description: 'The surprising bridge connecting the slope of tangents (derivatives) with the accumulation of area (integrals).',
  },
  {
    title: 'Entropy and the Second Law of Thermodynamics',
    domain: 'Thermodynamics & Statistical Mechanics',
    tag: 'Arrow of Time',
    icon: 'local_fire_department',
    description: 'Why time only moves forward and why isolated systems inevitably evolve toward maximum disorder.',
  },
  {
    title: 'Neural Networks & Attention Mechanisms',
    domain: 'Computer Science & AI',
    tag: 'Information Theory',
    icon: 'memory',
    description: 'How matrix multiplications, backpropagation, and self-attention enable artificial cognition.',
  },
  {
    title: 'Plate Tectonics & Continental Drift',
    domain: 'Earth & Planetary Sciences',
    tag: 'Geology',
    icon: 'terrain',
    description: 'The convective mantle currents driving mountain formation, earthquakes, and oceanic trenches.',
  },
  {
    title: 'Kantian Deontology & Moral Philosophy',
    domain: 'Philosophy & Ethics',
    tag: 'Humanities',
    icon: 'psychology',
    description: 'The Categorical Imperative: why moral duty exists independently of consequences.',
  },
];

export const UniverseExplorerView: React.FC<UniverseExplorerViewProps> = ({
  currentGradeLevel,
  currentUser,
  onSaveConcept,
}) => {
  const [selectedConcept, setSelectedConcept] = useState<string>('');
  const [customConcept, setCustomConcept] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(currentGradeLevel);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ConceptNote | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleExplore = async (conceptName: string) => {
    if (!conceptName.trim()) return;

    setIsLoading(true);
    setSelectedConcept(conceptName);

    try {
      const response = await fetch('/api/explain-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: conceptName.trim(),
          gradeLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch concept explanation');
      }

      const data = await response.json();

      const newNote: ConceptNote = {
        id: 'cncpt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: currentUser ? currentUser.uid : 'guest_user',
        title: data.title || conceptName,
        domain: data.domain || 'Universal Science',
        gradeLevel,
        simpleAnalogy: data.simpleAnalogy || '',
        deepDive: data.deepDive || '',
        keyFormulas: data.keyFormulas || [],
        tags: data.tags || [],
        masteryLevel: 'learning',
        quiz: data.quiz || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setResult(newNote);
      await onSaveConcept(newNote);
    } catch (err: any) {
      console.error(err);
      alert('Error exploring concept: ' + (err.message || 'Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSave = async () => {
    if (!result) return;
    await onSaveConcept(result);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#eedcff]/30 dark:bg-[#4e4061]/20 border border-[#eedcff] dark:border-[#4e4061]/40">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#67587a] dark:bg-[#d2bfe6] text-white dark:text-[#372a49] text-xs font-semibold mb-2">
          <span className="material-symbols-outlined text-sm">all_inclusive</span>
          Universal Knowledge Engine
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1c1e] dark:text-[#e6e0e9]">
          Explore Any Concept in the Universe
        </h1>
        <p className="text-sm text-[#51606f] dark:text-[#b8c8da] mt-1 max-w-2xl">
          From quantum physics to ancient philosophy, learn any idea at your academic grade level. Shift from elementary analogies to advanced research proofs instantly.
        </p>
      </div>

      {/* Grade Level Selector */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1d1b20] border border-[#cac4d0]/40 dark:border-[#49454f]/40 shadow-sm space-y-4">
        <GradeLevelSelector
          value={gradeLevel}
          onChange={(newLevel) => {
            setGradeLevel(newLevel);
            if (result) {
              handleExplore(result.title);
            }
          }}
        />

        {/* Custom Search Input */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="flex-1 relative rounded-full border border-[#cac4d0] dark:border-[#49454f] focus-within:border-[#00639b] dark:focus-within:border-[#90cdff] bg-[#fdfcff] dark:bg-[#141218]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#79747e] text-xl">
              search
            </span>
            <input
              type="text"
              value={customConcept}
              onChange={(e) => setCustomConcept(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExplore(customConcept);
              }}
              placeholder="Search or enter any concept in the universe (e.g. 'Photosynthesis', 'Dark Matter', 'Riemann Hypothesis')..."
              className="w-full pl-12 pr-4 py-3 rounded-full text-sm bg-transparent focus:outline-none text-[#1a1c1e] dark:text-[#e6e0e9] placeholder:text-[#79747e]"
            />
          </div>

          <button
            type="button"
            disabled={isLoading || !customConcept.trim()}
            onClick={() => handleExplore(customConcept)}
            className={`px-6 py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              isLoading || !customConcept.trim()
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-[#00639b] dark:bg-[#90cdff] text-white dark:text-[#003355] hover:brightness-105 active:scale-98 shadow-sm'
            }`}
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">travel_explore</span>
                <span>Explore Concept</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Explored Result View */}
      {result && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1d1b20] border border-[#cac4d0]/40 dark:border-[#49454f]/40 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#cac4d0]/30 dark:border-[#49454f]/30">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#eedcff] dark:bg-[#4e4061] text-[#221533] dark:text-[#eedcff]">
                  {result.domain}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#cbe6ff] dark:bg-[#004b77] text-[#001d33] dark:text-[#cbe6ff]">
                  {result.gradeLevel.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#1a1c1e] dark:text-[#e6e0e9]">
                {result.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleManualSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#cac4d0] dark:border-[#49454f] text-xs font-semibold text-[#1a1c1e] dark:text-[#e6e0e9] hover:bg-[#ece6f0] dark:hover:bg-[#2b2930] transition-colors self-start md:self-center"
            >
              <span className="material-symbols-outlined text-base text-[#00639b] dark:text-[#90cdff]">
                {saveSuccess ? 'cloud_done' : 'bookmark_add'}
              </span>
              <span>{saveSuccess ? 'Saved to Cloud' : 'Save to Study Notes'}</span>
            </button>
          </div>

          {/* Simple Analogy Layer */}
          <div className="p-5 rounded-2xl bg-[#eedcff]/20 dark:bg-[#4e4061]/20 border border-[#eedcff] dark:border-[#4e4061]/40 space-y-2">
            <h3 className="text-sm font-bold text-[#67587a] dark:text-[#d2bfe6] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">lightbulb</span>
              Intuitive Real-World Analogy (Simple Language)
            </h3>
            <p className="text-sm text-[#1a1c1e] dark:text-[#e6e0e9] leading-relaxed">
              <MathView content={result.simpleAnalogy} />
            </p>
          </div>

          {/* High Precision Deep Dive */}
          <div className="p-5 rounded-2xl bg-[#cbe6ff]/20 dark:bg-[#004b77]/20 border border-[#cbe6ff] dark:border-[#004b77]/40 space-y-3">
            <h3 className="text-sm font-bold text-[#00639b] dark:text-[#90cdff] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">psychology</span>
              High-Precision Deep Dive ({result.gradeLevel.replace('_', ' ')} Rigor)
            </h3>
            <div className="text-sm text-[#1a1c1e] dark:text-[#e6e0e9] leading-relaxed">
              <MathView content={result.deepDive} />
            </div>
          </div>

          {/* Key Formulas or Formal Statements */}
          {result.keyFormulas && result.keyFormulas.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#f7f2fa] dark:bg-[#211f26] border border-[#cac4d0]/30 dark:border-[#49454f]/30 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#51606f] dark:text-[#b8c8da] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">functions</span>
                Governing Equations & Laws
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {result.keyFormulas.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-[#141218] border border-[#cac4d0]/30 text-xs">
                    <MathView content={f} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Tags */}
          {result.tags && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#51606f] dark:text-[#b8c8da] font-medium">Related Concepts:</span>
              {result.tags.map((tag, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleExplore(tag)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#f7f2fa] dark:bg-[#2b2930] text-[#1a1c1e] dark:text-[#e6e0e9] border border-[#cac4d0]/30 hover:border-[#00639b] transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Curated Universal Concepts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1a1c1e] dark:text-[#e6e0e9] flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-[#00639b] dark:text-[#90cdff]">
              auto_awesome
            </span>
            Curated Fundamental Concepts of the Cosmos
          </h2>
          <span className="text-xs text-[#51606f] dark:text-[#b8c8da]">
            Click any to explore at {gradeLevel.replace('_', ' ')} level
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {UNIVERSAL_CONCEPTS.map((concept, idx) => (
            <div
              key={idx}
              onClick={() => handleExplore(concept.title)}
              className="p-4 rounded-2xl bg-white dark:bg-[#1d1b20] border border-[#cac4d0]/40 dark:border-[#49454f]/40 hover:border-[#00639b] dark:hover:border-[#90cdff] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#cbe6ff] dark:bg-[#004b77] text-[#001d33] dark:text-[#cbe6ff] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-lg">{concept.icon}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f3edf7] dark:bg-[#2b2930] text-[#51606f] dark:text-[#b8c8da]">
                    {concept.tag}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#1a1c1e] dark:text-[#e6e0e9] group-hover:text-[#00639b] dark:group-hover:text-[#90cdff] transition-colors">
                  {concept.title}
                </h3>
                <p className="text-[11px] text-[#51606f] dark:text-[#b8c8da] mt-1 line-clamp-2">
                  {concept.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#cac4d0]/20 flex items-center justify-between text-[10px] font-medium text-[#00639b] dark:text-[#90cdff]">
                <span>{concept.domain}</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
