import React from 'react';
import { GradeLevel } from '../lib/types';

interface GradeLevelSelectorProps {
  value: GradeLevel;
  onChange: (level: GradeLevel) => void;
  compact?: boolean;
}

export const gradeLevelLabels: Record<GradeLevel, { title: string; subtitle: string; icon: string }> = {
  elementary: {
    title: 'Elementary',
    subtitle: 'Grades 1–5 • Visual & fun stories',
    icon: 'child_care',
  },
  middle_school: {
    title: 'Middle School',
    subtitle: 'Grades 6–8 • Real-world examples',
    icon: 'emoji_people',
  },
  high_school: {
    title: 'High School',
    subtitle: 'Grades 9–12 • AP / Honors rigor',
    icon: 'menu_book',
  },
  undergraduate: {
    title: 'College / Undergrad',
    subtitle: 'University • Formal proofs & theory',
    icon: 'account_balance',
  },
  graduate_research: {
    title: 'Graduate / Research',
    subtitle: 'Masters & PhD • Cutting-edge depth',
    icon: 'psychology',
  },
};

export const GradeLevelSelector: React.FC<GradeLevelSelectorProps> = ({
  value,
  onChange,
  compact = false,
}) => {
  const levels: GradeLevel[] = [
    'elementary',
    'middle_school',
    'high_school',
    'undergraduate',
    'graduate_research',
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-1 bg-[#ece6f0] dark:bg-[#2b2930] rounded-full overflow-x-auto max-w-full">
        {levels.map((level) => {
          const isSelected = value === level;
          const info = gradeLevelLabels[level];
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isSelected
                  ? 'bg-[#00639b] dark:bg-[#90cdff] text-white dark:text-[#003355] shadow-sm'
                  : 'text-[#51606f] dark:text-[#b8c8da] hover:bg-[#cac4d0]/30 dark:hover:bg-[#49454f]/30'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{info.icon}</span>
              <span>{info.title}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold tracking-wide uppercase text-[#51606f] dark:text-[#b8c8da] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base">school</span>
          Academic Grade Level
        </label>
        <span className="text-xs text-[#00639b] dark:text-[#90cdff] font-medium">
          {gradeLevelLabels[value].title} Target
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {levels.map((level) => {
          const isSelected = value === level;
          const info = gradeLevelLabels[level];
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-150 relative overflow-hidden ${
                isSelected
                  ? 'bg-[#cbe6ff]/40 dark:bg-[#004b77]/40 border-[#00639b] dark:border-[#90cdff] ring-1 ring-[#00639b] dark:ring-[#90cdff]'
                  : 'bg-[#f7f2fa] dark:bg-[#1d1b20] border-[#cac4d0]/50 dark:border-[#49454f]/50 hover:bg-[#ece6f0] dark:hover:bg-[#2b2930]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#00639b] text-white dark:bg-[#90cdff] dark:text-[#003355]'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{info.icon}</span>
                </div>
                {isSelected && (
                  <span className="material-symbols-outlined text-[#00639b] dark:text-[#90cdff] text-base font-bold">
                    check_circle
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-[#1a1c1e] dark:text-[#e6e0e9]">
                {info.title}
              </span>
              <span className="text-[10px] text-[#51606f] dark:text-[#b8c8da] mt-0.5 line-clamp-1">
                {info.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
