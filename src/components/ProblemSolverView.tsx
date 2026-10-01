import React, { useState } from 'react';
import { GradeLevel, StudySubject, StudyProblem, QuizQuestion } from '../lib/types';
import { GradeLevelSelector } from './GradeLevelSelector';
import { SubjectChips } from './SubjectChips';
import { MathView } from './MathView';
import { User } from 'firebase/auth';

interface ProblemSolverViewProps {
  currentGradeLevel: GradeLevel;
  onGradeLevelChange: (level: GradeLevel) => void;
  currentUser: User | null;
  onSaveProblem: (problem: StudyProblem) => Promise<void>;
  initialProblem?: StudyProblem | null;
}

const PRESET_QUESTIONS: Record<GradeLevel, string[]> = {
  elementary: [
    'Why does the moon change shape during the month?',
    'If I have 12 apples and divide them among 4 friends equally, how many does each get, and why does division work like this?',
    'How do fish breathe underwater if water isn’t air?',
  ],
  middle_school: [
    'Solve for x: 3(x - 4) + 5 = 2x - 1 and explain what the variable actually represents.',
    'Explain Newton’s Third Law with an example of jumping off a boat.',
    'Why do we have seasons on Earth, and why is it hot in summer?',
  ],
  high_school: [
    'Find the derivative of f(x) = (3x^2 + 2x) * sin(x) using the product rule step by step.',
    'Calculate the pH of a 0.05 M solution of Hydrochloric Acid (HCl) and explain what pH measures.',
    'Derive the kinetic energy equation KE = 1/2 m v^2 from work done by a constant force.',
  ],
  undergraduate: [
    'Evaluate the double integral \u222C (x^2 + y^2) dA over the unit circle using polar coordinates.',
    'Explain the mechanism of CRISPR-Cas9 gene editing and how guide RNA finds the target sequence.',
    'Derive time dilation in Special Relativity from the Lorentz transformation matrix.',
  ],
  graduate_research: [
    'Prove that any continuous mapping from a compact convex subset of \u211d^n to itself has a fixed point (Brouwer Fixed-Point Theorem outline).',
    'Explain the renormalization group flow in Quantum Field Theory and how ultraviolet cutoffs affect effective field theories.',
    'Derive the Black-Scholes PDE using Itô’s Lemma and no-arbitrage portfolio construction.',
  ],
};

export const ProblemSolverView: React.FC<ProblemSolverViewProps> = ({
  currentGradeLevel,
  onGradeLevelChange,
  currentUser,
  onSaveProblem,
  initialProblem,
}) => {
  const [question, setQuestion] = useState(initialProblem ? initialProblem.question : '');
  const [subject, setSubject] = useState<StudySubject>(
    (initialProblem?.subject as StudySubject) || 'Mathematics'
  );
  const [highPrecision, setHighPrecision] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [currentResult, setCurrentResult] = useState<StudyProblem | null>(initialProblem || null);
  const [activeTab, setActiveTab] = useState<'both' | 'simple' | 'rigorous' | 'steps' | 'practice'>('both');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizExplanation, setShowQuizExplanation] = useState<Record<number, boolean>>({});

  // Handle image upload (camera / homework scanner)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
  };

  // Solve problem API call
  const handleSolve = async () => {
    if (!question.trim() && !imagePreview) return;

    setIsLoading(true);
    setLoadingStep('Analyzing question structure & grade-level context...');

    try {
      setTimeout(() => setLoadingStep('Deriving mathematical & conceptual proof...'), 1000);
      setTimeout(() => setLoadingStep('Synthesizing intuitive analogies & step verification...'), 2400);

      const response = await fetch('/api/solve-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim() || 'Analyze and solve the problem presented in the attached image.',
          gradeLevel: currentGradeLevel,
          subject,
          highPrecisionMode: highPrecision,
          imageBase64: imagePreview || undefined,
          imageMimeType: imagePreview ? imageMimeType : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to solve problem: ${response.statusText}`);
      }

      const data = await response.json();

      const newProblem: StudyProblem = {
        id: 'prob_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: currentUser ? currentUser.uid : 'guest_user',
        title: data.title || question.slice(0, 50) + '...',
        question: question.trim() || 'Homework Image Problem',
        subject: data.subject || subject,
        gradeLevel: currentGradeLevel,
        simplifiedExplanation: data.simplifiedExplanation || '',
        rigorousSolution: data.rigorousSolution || '',
        steps: data.steps || [],
        formulasUsed: data.formulasUsed || [],
        keyTakeaways: data.keyTakeaways || [],
        practiceQuestions: data.practiceQuestions || [],
        status: 'solved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCurrentResult(newProblem);
      setQuizAnswers({});
      setShowQuizExplanation({});

      // Auto-save to cloud/local
      await onSaveProblem(newProblem);
    } catch (err: any) {
      console.error(err);
      alert('Error solving problem: ' + (err.message || 'Please try again.'));
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleManualSave = async () => {
    if (!currentResult) return;
    await onSaveProblem(currentResult);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#f3edf7] dark:bg-[#211f26] border border-[#cac4d0]/30 dark:border-[#49454f]/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cbe6ff] dark:bg-[#004b77] text-[#001d33] dark:text-[#cbe6ff] text-xs font-semibold mb-2">
            <span className="material-symbols-outlined text-sm">verified</span>
            High-Precision Dual Explainer
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1c1e] dark:text-[#e6e0e9]">
            Universal Academic Problem Solver
          </h1>
          <p className="text-sm text-[#51606f] dark:text-[#b8c8da] mt-1 max-w-2xl">
            Understands academic problems across all grade levels. Delivers intuitive simple-language analogies side-by-side with mathematically rigorous derivations.
          </p>
        </div>

        {/* Cloud Status Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-[#141218] border border-[#cac4d0]/40 dark:border-[#49454f]/40 shadow-xs self-start md:self-center">
          <span className={`material-symbols-outlined text-base ${currentUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {currentUser ? 'cloud_done' : 'offline_pin'}
          </span>
          <div className="text-xs">
            <p className="font-semibold text-[#1a1c1e] dark:text-[#e6e0e9]">
              {currentUser ? 'Secure Cloud Storage' : 'Local Storage Mode'}
            </p>
            <p className="text-[10px] text-[#51606f] dark:text-[#b8c8da]">
              {currentUser ? `${currentUser.displayName || currentUser.email}` : 'Sign in to sync across devices'}
            </p>
          </div>
        </div>
      </div>

      {/* Input Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1d1b20] border border-[#cac4d0]/40 dark:border-[#49454f]/40 shadow-sm space-y-5">
        {/* Grade Level Selector */}
        <GradeLevelSelector
          value={currentGradeLevel}
          onChange={onGradeLevelChange}
        />

        {/* Subject Chips */}
        <div>
          <label className="text-xs font-semibold tracking-wide uppercase text-[#51606f] dark:text-[#b8c8da] block mb-2">
            Subject Discipline
          </label>
          <SubjectChips
            selectedSubject={subject}
            onSelect={(s) => setSubject(s)}
          />
        </div>

        {/* Problem Statement Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wide uppercase text-[#51606f] dark:text-[#b8c8da] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">edit_note</span>
              Academic Problem or Concept Question
            </label>
            <span className="text-xs text-[#51606f] dark:text-[#b8c8da]">
              LaTeX formulas ($x^2$) & images supported
            </span>
          </div>

          <div className="relative rounded-2xl border border-[#cac4d0] dark:border-[#49454f] focus-within:border-[#00639b] dark:focus-within:border-[#90cdff] focus-within:ring-2 focus-within:ring-[#00639b]/20 dark:focus-within:ring-[#90cdff]/20 transition-all bg-[#fdfcff] dark:bg-[#141218]">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question or homework problem here... e.g. 'Solve \int x e^x dx', 'Explain why the sky turns red at sunset', or 'What is the role of mitochondria in ATP synthesis?'"
              rows={4}
              className="w-full p-4 rounded-2xl bg-transparent resize-y text-sm focus:outline-none placeholder:text-[#79747e] text-[#1a1c1e] dark:text-[#e6e0e9]"
            />

            {/* Image Preview inside textarea container */}
            {imagePreview && (
              <div className="px-4 pb-4">
                <div className="relative inline-block border border-[#cac4d0] dark:border-[#49454f] rounded-xl overflow-hidden shadow-xs bg-[#f3edf7] dark:bg-[#2b2930]">
                  <img
                    src={imagePreview}
                    alt="Homework preview"
                    className="max-h-36 max-w-xs object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                    title="Remove image"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px]">
                    Homework Scanned
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Presets for current grade level */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-[#51606f] dark:text-[#b8c8da]">
            Try a sample problem for {currentGradeLevel.replace('_', ' ')}:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUESTIONS[currentGradeLevel]?.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuestion(preset)}
                className="text-left text-xs px-3 py-1.5 rounded-xl bg-[#f7f2fa] dark:bg-[#2b2930] text-[#1a1c1e] dark:text-[#e6e0e9] border border-[#cac4d0]/30 hover:border-[#00639b] dark:hover:border-[#90cdff] transition-all line-clamp-1 max-w-sm"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#cac4d0]/30 dark:border-[#49454f]/30">
          {/* Homework Scanner Button & High Precision Toggle */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Camera / Image Upload */}
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#cac4d0] dark:border-[#49454f] bg-[#f7f2fa] dark:bg-[#1d1b20] hover:bg-[#ece6f0] dark:hover:bg-[#2b2930] text-xs font-medium text-[#1a1c1e] dark:text-[#e6e0e9] cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-base text-[#00639b] dark:text-[#90cdff]">
                photo_camera
              </span>
              <span>{imagePreview ? 'Change Photo' : 'Scan Homework / Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* High Precision Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highPrecision}
                onChange={(e) => setHighPrecision(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#cac4d0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#00639b] relative"></div>
              <span className="text-xs font-medium text-[#1a1c1e] dark:text-[#e6e0e9] flex items-center gap-1">
                <span>High Precision Rigor</span>
                <span className="material-symbols-outlined text-xs text-[#51606f]" title="Includes step sanity checks, edge-case analysis, and mathematical proofs">
                  help
                </span>
              </span>
            </label>
          </div>

          {/* Primary Action Button (M3 Filled Button) */}
          <button
            type="button"
            disabled={isLoading || (!question.trim() && !imagePreview)}
            onClick={handleSolve}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
              isLoading || (!question.trim() && !imagePreview)
                ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-[#00639b] dark:bg-[#90cdff] text-white dark:text-[#003355] hover:shadow-md hover:brightness-105 active:scale-98'
            }`}
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                <span>Solving Universally...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">auto_fix_high</span>
                <span>Solve & Explain</span>
              </>
            )}
          </button>
        </div>

        {/* Loading Progress State */}
        {isLoading && (
          <div className="p-4 rounded-2xl bg-[#cbe6ff]/30 dark:bg-[#004b77]/30 border border-[#00639b]/30 dark:border-[#90cdff]/30 flex items-center gap-3 animate-pulse">
            <span className="material-symbols-outlined text-[#00639b] dark:text-[#90cdff] text-2xl animate-spin">
              hourglass_top
            </span>
            <div>
              <p className="text-xs font-semibold text-[#001d33] dark:text-[#cbe6ff]">
                OmniStudy AI Reasoning in Progress
              </p>
              <p className="text-xs text-[#51606f] dark:text-[#b8c8da]">
                {loadingStep}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Results View */}
      {currentResult && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1d1b20] border border-[#cac4d0]/40 dark:border-[#49454f]/40 shadow-sm space-y-6">
          {/* Header of Solution */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#cac4d0]/30 dark:border-[#49454f]/30">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#d4e4f6] dark:bg-[#3a4857] text-[#0d1d2a] dark:text-[#d4e4f6]">
                  {currentResult.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#ece6f0] dark:bg-[#2b2930] text-[#51606f] dark:text-[#b8c8da]">
                  {currentResult.gradeLevel.replace('_', ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Precision Verified
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1a1c1e] dark:text-[#e6e0e9]">
                {currentResult.title}
              </h2>
            </div>

            {/* Solution Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#cac4d0] dark:border-[#49454f] text-xs font-medium text-[#1a1c1e] dark:text-[#e6e0e9] hover:bg-[#ece6f0] dark:hover:bg-[#2b2930] transition-colors"
                title="Save to Cloud Firestore"
              >
                <span className="material-symbols-outlined text-base text-[#00639b] dark:text-[#90cdff]">
                  {saveSuccess ? 'cloud_done' : 'bookmark_add'}
                </span>
                <span>{saveSuccess ? 'Saved to Cloud' : 'Save to Notebook'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `# ${currentResult.title}\n\n## Intuitive Explanation\n${currentResult.simplifiedExplanation}\n\n## Rigorous Solution\n${currentResult.rigorousSolution}`
                  );
                  alert('Solution copied to clipboard!');
                }}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-[#cac4d0] dark:border-[#49454f] text-[#51606f] dark:text-[#b8c8da] hover:bg-[#ece6f0] dark:hover:bg-[#2b2930] transition-colors"
                title="Copy Solution"
              >
                <span className="material-symbols-outlined text-base">content_copy</span>
              </button>
            </div>
          </div>

          {/* M3 Tabs */}
          <div className="flex items-center gap-2 border-b border-[#cac4d0]/30 dark:border-[#49454f]/30 overflow-x-auto pb-1">
            {[
              { id: 'both', label: 'Dual View (Side-by-Side)', icon: 'view_column' },
              { id: 'simple', label: 'Simple Language & Analogy', icon: 'lightbulb' },
              { id: 'rigorous', label: 'Rigorous Math & Proof', icon: 'science' },
              { id: 'steps', label: `Step Breakdown (${currentResult.steps.length})`, icon: 'checklist' },
              { id: 'practice', label: `Practice Questions (${currentResult.practiceQuestions?.length || 0})`, icon: 'quiz' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-[#00639b] dark:border-[#90cdff] text-[#00639b] dark:text-[#90cdff]'
                      : 'border-transparent text-[#51606f] dark:text-[#b8c8da] hover:text-[#1a1c1e] dark:hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dual View: Simple Language + Rigorous Solution */}
          {(activeTab === 'both' || activeTab === 'simple' || activeTab === 'rigorous') && (
            <div className={`grid gap-6 ${activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Layer 1: Simple Language & Analogy */}
              {(activeTab === 'both' || activeTab === 'simple') && (
                <div className="p-5 rounded-2xl bg-[#eedcff]/20 dark:bg-[#4e4061]/20 border border-[#eedcff] dark:border-[#4e4061]/40 space-y-3">
                  <div className="flex items-center gap-2 text-[#67587a] dark:text-[#d2bfe6] font-semibold text-sm">
                    <span className="material-symbols-outlined text-lg">lightbulb</span>
                    <span>Intuitive Simple-Language Explanation</span>
                  </div>
                  <div className="text-sm text-[#1a1c1e] dark:text-[#e6e0e9] leading-relaxed">
                    <MathView content={currentResult.simplifiedExplanation} />
                  </div>
                </div>
              )}

              {/* Layer 2: Rigorous Mathematical Solution */}
              {(activeTab === 'both' || activeTab === 'rigorous') && (
                <div className="p-5 rounded-2xl bg-[#cbe6ff]/20 dark:bg-[#004b77]/20 border border-[#cbe6ff] dark:border-[#004b77]/40 space-y-3">
                  <div className="flex items-center gap-2 text-[#00639b] dark:text-[#90cdff] font-semibold text-sm">
                    <span className="material-symbols-outlined text-lg">functions</span>
                    <span>High-Precision Academic Solution & Proof</span>
                  </div>
                  <div className="text-sm text-[#1a1c1e] dark:text-[#e6e0e9] leading-relaxed">
                    <MathView content={currentResult.rigorousSolution} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step-by-Step Breakdown Cards */}
          {(activeTab === 'both' || activeTab === 'steps') && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#51606f] dark:text-[#b8c8da] flex items-center gap-2">
                <span className="material-symbols-outlined text-base">checklist</span>
                Step-by-Step Mathematical & Logical Breakdown
              </h3>

              <div className="space-y-3">
                {currentResult.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#f7f2fa] dark:bg-[#211f26] border border-[#cac4d0]/30 dark:border-[#49454f]/30 flex flex-col md:flex-row md:items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#00639b] dark:bg-[#90cdff] text-white dark:text-[#003355] font-bold text-xs flex items-center justify-center shrink-0">
                      {step.stepNumber || idx + 1}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <h4 className="text-sm font-semibold text-[#1a1c1e] dark:text-[#e6e0e9]">
                        {step.title}
                      </h4>
                      <p className="text-xs text-[#51606f] dark:text-[#b8c8da] leading-relaxed">
                        <MathView content={step.explanation} />
                      </p>

                      {step.mathFormula && (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-[#141218] border border-[#cac4d0]/40 dark:border-[#49454f]/40 text-xs">
                          <MathView content={step.mathFormula} />
                        </div>
                      )}

                      {step.sanityCheck && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200 dark:border-emerald-800/40">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          <span>Sanity Check: {step.sanityCheck}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas and Key Takeaways */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Formulas used */}
            {currentResult.formulasUsed?.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#f7f2fa] dark:bg-[#211f26] border border-[#cac4d0]/30 dark:border-[#49454f]/30 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#51606f] dark:text-[#b8c8da] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">square_foot</span>
                  Key Theorems & Formulas
                </h4>
                <div className="space-y-1.5">
                  {currentResult.formulasUsed.map((formula, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-white dark:bg-[#141218] border border-[#cac4d0]/30 dark:border-[#49454f]/30 text-xs"
                    >
                      <MathView content={formula} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Takeaways */}
            {currentResult.keyTakeaways?.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#f7f2fa] dark:bg-[#211f26] border border-[#cac4d0]/30 dark:border-[#49454f]/30 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#51606f] dark:text-[#b8c8da] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">flag</span>
                  Core Takeaways
                </h4>
                <ul className="space-y-1.5">
                  {currentResult.keyTakeaways.map((takeaway, i) => (
                    <li
                      key={i}
                      className="text-xs text-[#1a1c1e] dark:text-[#e6e0e9] flex items-start gap-2"
                    >
                      <span className="material-symbols-outlined text-xs text-[#00639b] dark:text-[#90cdff] shrink-0 mt-0.5">
                        arrow_forward
                      </span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Practice Questions Section */}
          {(activeTab === 'both' || activeTab === 'practice') && currentResult.practiceQuestions && currentResult.practiceQuestions.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#cac4d0]/30 dark:border-[#49454f]/30">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#51606f] dark:text-[#b8c8da] flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">psychology</span>
                  Test Your Mastery: Practice Check
                </h3>
                <span className="text-xs text-[#00639b] dark:text-[#90cdff]">
                  Immediate feedback
                </span>
              </div>

              <div className="space-y-4">
                {currentResult.practiceQuestions.map((quiz, qIdx) => {
                  const selectedAnswer = quizAnswers[qIdx];
                  const hasAnswered = selectedAnswer !== undefined;
                  const isCorrect = selectedAnswer === quiz.correctIndex;
                  const showExp = showQuizExplanation[qIdx];

                  return (
                    <div
                      key={qIdx}
                      className="p-5 rounded-2xl bg-[#f7f2fa] dark:bg-[#211f26] border border-[#cac4d0]/30 dark:border-[#49454f]/30 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-[#1a1c1e] dark:text-[#e6e0e9]">
                          Q{qIdx + 1}: {quiz.question}
                        </span>
                        {quiz.hint && (
                          <button
                            type="button"
                            onClick={() => alert(`Hint: ${quiz.hint}`)}
                            className="text-[11px] text-[#00639b] dark:text-[#90cdff] underline shrink-0"
                          >
                            Hint
                          </button>
                        )}
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quiz.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedAnswer === optIdx;
                          const isOptionCorrect = optIdx === quiz.correctIndex;

                          let btnStyle = 'bg-white dark:bg-[#141218] border-[#cac4d0]/40 dark:border-[#49454f]/40 hover:bg-[#ece6f0]';
                          if (hasAnswered) {
                            if (isOptionCorrect) {
                              btnStyle = 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
                            } else if (isOptionSelected) {
                              btnStyle = 'bg-red-100 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200';
                            } else {
                              btnStyle = 'opacity-50 border-transparent';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={hasAnswered}
                              onClick={() => {
                                setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                                setShowQuizExplanation(prev => ({ ...prev, [qIdx]: true }));
                              }}
                              className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {hasAnswered && isOptionCorrect && (
                                <span className="material-symbols-outlined text-sm text-emerald-600">check</span>
                              )}
                              {hasAnswered && isOptionSelected && !isOptionCorrect && (
                                <span className="material-symbols-outlined text-sm text-red-600">close</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Reveal */}
                      {showExp && (
                        <div className={`p-3 rounded-xl text-xs space-y-1 ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/40' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/40'}`}>
                          <div className="font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">{isCorrect ? 'celebration' : 'info'}</span>
                            <span>{isCorrect ? 'Correct! High-precision understanding verified.' : 'Not quite. Here is the reason:'}</span>
                          </div>
                          <p>{quiz.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
