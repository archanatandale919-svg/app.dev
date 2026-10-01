import React from 'react';
import { StudySubject } from '../lib/types';

interface SubjectChipsProps {
  selectedSubject: string;
  onSelect: (subject: StudySubject) => void;
  allowAll?: boolean;
}

export const SUBJECT_METADATA: Record<StudySubject, { icon: string; color: string }> = {
  Mathematics: { icon: 'functions', color: '#00639b' },
  Physics: { icon: 'scatter_plot', color: '#7b1fa2' },
  Chemistry: { icon: 'science', color: '#00796b' },
  Biology: { icon: 'biotech', color: '#2e7d32' },
  'Computer Science': { icon: 'terminal', color: '#c2185b' },
  Engineering: { icon: 'precision_manufacturing', color: '#e65100' },
  Literature: { icon: 'auto_stories', color: '#5d4037' },
  History: { icon: 'history_edu', color: '#f57f17' },
  Philosophy: { icon: 'psychology_alt', color: '#455a64' },
  Economics: { icon: 'trending_up', color: '#388e3c' },
  'General Science': { icon: 'flare', color: '#1976d2' },
};

export const SubjectChips: React.FC<SubjectChipsProps> = ({
  selectedSubject,
  onSelect,
  allowAll = false,
}) => {
  const subjects: StudySubject[] = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Engineering',
    'Literature',
    'History',
    'Philosophy',
    'Economics',
    'General Science',
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none max-w-full">
      {allowAll && (
        <button
          type="button"
          onClick={() => onSelect('General Science')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border shrink-0 transition-all ${
            selectedSubject === 'All' || selectedSubject === 'General Science'
              ? 'bg-[#cbe6ff] dark:bg-[#004b77] text-[#001d33] dark:text-[#cbe6ff] border-[#00639b]'
              : 'bg-[#f7f2fa] dark:bg-[#1d1b20] text-[#51606f] dark:text-[#b8c8da] border-[#cac4d0]/40 hover:bg-[#ece6f0]'
          }`}
        >
          <span className="material-symbols-outlined text-sm">interests</span>
          <span>All Disciplines</span>
        </button>
      )}

      {subjects.map((subj) => {
        const isSelected = selectedSubject === subj;
        const meta = SUBJECT_METADATA[subj];
        return (
          <button
            key={subj}
            type="button"
            onClick={() => onSelect(subj)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border shrink-0 transition-all ${
              isSelected
                ? 'bg-[#cbe6ff] dark:bg-[#004b77] text-[#001d33] dark:text-[#cbe6ff] border-[#00639b] dark:border-[#90cdff] shadow-xs'
                : 'bg-[#f7f2fa] dark:bg-[#1d1b20] text-[#51606f] dark:text-[#b8c8da] border-[#cac4d0]/40 dark:border-[#49454f]/40 hover:bg-[#ece6f0] dark:hover:bg-[#2b2930]'
            }`}
          >
            <span
              className="material-symbols-outlined text-sm"
              style={{ color: isSelected ? undefined : meta.color }}
            >
              {meta.icon}
            </span>
            <span>{subj}</span>
          </button>
        );
      })}
    </div>
  );
};
