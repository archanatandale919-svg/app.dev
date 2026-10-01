import React, { useState } from 'react';
import { StudyProblem, GradeLevel, QuizQuestion, StudySubject } from '../lib/types';
import { SubjectChips } from './SubjectChips';
import { MathView } from './MathView';

interface PracticeQuizViewProps {
  problems: StudyProblem[];
  currentGradeLevel: GradeLevel;
}

export const PracticeQuizView: React.FC<PracticeQuizViewProps> = ({
  problems,
  currentGradeLevel,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<StudySubject>('Mathematics');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Extract practice questions from saved problems or generate static curated high-precision questions
  const availableQuestions: QuizQuestion[] = React.useMemo(() => {
    const extracted: QuizQuestion[] = [];
    problems.forEach((p) => {
      if (p.practiceQuestions) {
        extracted.push(...p.practiceQuestions);
      }
    });

    if (extracted.length > 0) {
      return extracted;
    }

    // Default curated precision questions for the current grade level
    return [
      {
        question: 'In calculus, what does the derivative of position with respect to time represent physically?',
        options: ['Acceleration', 'Instantaneous Velocity', 'Total Displacement', 'Jerk'],
        correctIndex: 1,
        explanation: 'The first derivative of position $s(t)$ with respect to time $t$, $v(t) = \\frac{ds}{dt}$, is the instantaneous velocity.',
        hint: 'Think about rate of change of distance over time.',
      },
      {
        question: 'Which of the following describes why ice floats on liquid water?',
        options: [
          'Ice has higher kinetic energy than liquid water',
          'Hydrogen bonds form an open hexagonal lattice crystal structure upon freezing, lowering density',
          'Dissolved oxygen forms bubbles inside the solid state',
          'Surface tension repels the solid lattice upward',
        ],
        correctIndex: 1,
        explanation: 'As water cools below $4^\\circ\\text{C}$, hydrogen bonds stabilize into a hexagonal lattice with large voids, making solid ice less dense than liquid water.',
        hint: 'Consider the geometric arrangement of hydrogen bonds.',
      },
      {
        question: 'What is the sum of the roots of the quadratic equation $2x^2 - 8x + 6 = 0$?',
        options: ['-4', '3', '4', '8'],
        correctIndex: 2,
        explanation: 'By Vieta’s formulas, for $ax^2 + bx + c = 0$, the sum of roots is $-\\frac{b}{a} = -\\frac{-8}{2} = 4$.',
        hint: 'Use Vieta’s formulas: sum = -b/a.',
      },
    ];
  }, [problems, currentGradeLevel]);

  const currentQ = availableQuestions[activeQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [activeQuestionIndex]: idx }));
  };

  const calculateScore = () => {
    let correct = 0;
    availableQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) correct++;
    });
    return correct;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#f3edf7] dark:bg-[#211f26] border border-[#cac4d0]/30 dark:border-[#49454f]/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cbe6ff] dark:bg-[#004b77] text-[#001d33] dark:text-[#cbe6ff] text-xs font-semibold mb-2">
          <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
          High-Precision Knowledge Verification
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a1c1e] dark:text-[#e6e0e9]">
          Mastery & Practice Assessment
        </h1>
        <p className="text-sm text-[#51606f] dark:text-[#b8c8da] mt-1">
          Challenge your understanding with precision practice questions derived from your study topics and academic level.
        </p>
      </div>

      {/* Subject Filter */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#1d1b20] border border-[#cac4d0]/40 dark:border-[#49454f]/40">
        <SubjectChips
          selectedSubject={selectedSubject}
          onSelect={(s) => setSelectedSubject(s)}
        />
      </div>

      {/* Quiz Card */}
      {currentQ && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1d1b20] border border-[#cac4d0]/40 dark:border-[#49454f]/40 shadow-sm space-y-6">
          {/* Progress Bar & Question Counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#51606f] dark:text-[#b8c8da]">
              <span>
                Question {activeQuestionIndex + 1} of {availableQuestions.length}
              </span>
              <span>
                {Math.round(((activeQuestionIndex + 1) / availableQuestions.length) * 100)}% Completed
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#ece6f0] dark:bg-[#2b2930] overflow-hidden">
              <div
                className="h-full bg-[#00639b] dark:bg-[#90cdff] transition-all duration-300"
                style={{
                  width: `${((activeQuestionIndex + 1) / availableQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="p-5 rounded-2xl bg-[#f7f2fa] dark:bg-[#211f26] border border-[#cac4d0]/30 dark:border-[#49454f]/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00639b] dark:text-[#90cdff] block mb-1">
              Assessment Prompt
            </span>
            <div className="text-base font-semibold text-[#1a1c1e] dark:text-[#e6e0e9] leading-relaxed">
              <MathView content={currentQ.question} />
            </div>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = userAnswers[activeQuestionIndex] === optIdx;
              const isCorrect = optIdx === currentQ.correctIndex;

              let cardStyle =
                'bg-white dark:bg-[#141218] border-[#cac4d0]/40 dark:border-[#49454f]/40 hover:bg-[#ece6f0] dark:hover:bg-[#2b2930]';

              if (isSubmitted) {
                if (isCorrect) {
                  cardStyle =
                    'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500';
                } else if (isSelected) {
                  cardStyle =
                    'bg-red-50 dark:bg-red-950/50 border-red-500 text-red-900 dark:text-red-200';
                } else {
                  cardStyle = 'opacity-40 border-transparent';
                }
              } else if (isSelected) {
                cardStyle =
                  'bg-[#cbe6ff]/40 dark:bg-[#004b77]/40 border-[#00639b] dark:border-[#90cdff] text-[#001d33] dark:text-[#cbe6ff] font-semibold ring-1 ring-[#00639b]';
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-2xl border text-sm text-left transition-all flex items-center justify-between gap-3 ${cardStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#f3edf7] dark:bg-[#2b2930] text-[11px] font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <MathView content={option} inline />
                  </div>
                  {isSubmitted && isCorrect && (
                    <span className="material-symbols-outlined text-emerald-600 text-xl shrink-0">
                      check_circle
                    </span>
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <span className="material-symbols-outlined text-red-600 text-xl shrink-0">
                      cancel
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation when submitted */}
          {isSubmitted && (
            <div className="p-4 rounded-2xl bg-[#cbe6ff]/20 dark:bg-[#004b77]/20 border border-[#cbe6ff] dark:border-[#004b77]/40 space-y-1.5 animate-fadeIn">
              <h4 className="text-xs font-bold text-[#00639b] dark:text-[#90cdff] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">verified</span>
                High-Precision Academic Rationale
              </h4>
              <p className="text-xs text-[#1a1c1e] dark:text-[#e6e0e9] leading-relaxed">
                <MathView content={currentQ.explanation} />
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#cac4d0]/30 dark:border-[#49454f]/30">
            <button
              type="button"
              disabled={activeQuestionIndex === 0}
              onClick={() => {
                setActiveQuestionIndex((prev) => Math.max(0, prev - 1));
                setIsSubmitted(false);
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-full border border-[#cac4d0] dark:border-[#49454f] text-xs font-semibold text-[#51606f] dark:text-[#b8c8da] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#ece6f0]"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Previous</span>
            </button>

            {!isSubmitted ? (
              <button
                type="button"
                disabled={userAnswers[activeQuestionIndex] === undefined}
                onClick={() => setIsSubmitted(true)}
                className="px-6 py-2 rounded-full bg-[#00639b] dark:bg-[#90cdff] text-white dark:text-[#003355] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 shadow-xs"
              >
                Check Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (activeQuestionIndex < availableQuestions.length - 1) {
                    setActiveQuestionIndex((prev) => prev + 1);
                    setIsSubmitted(false);
                  } else {
                    alert(`Practice Complete! You scored ${calculateScore()} out of ${availableQuestions.length}!`);
                  }
                }}
                className="flex items-center gap-1 px-6 py-2 rounded-full bg-[#00639b] dark:bg-[#90cdff] text-white dark:text-[#003355] text-xs font-bold hover:brightness-105 shadow-xs"
              >
                <span>{activeQuestionIndex < availableQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
