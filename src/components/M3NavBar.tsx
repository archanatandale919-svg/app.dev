import React from 'react';
import { User } from 'firebase/auth';

export type NavTab = 'solver' | 'universe' | 'notebook' | 'quiz' | 'profile';

interface M3NavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: User | null;
  savedCount: number;
}

export const M3NavBar: React.FC<M3NavBarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  savedCount,
}) => {
  const navItems = [
    {
      id: 'solver' as NavTab,
      label: 'Solver',
      icon: 'calculate',
      activeIcon: 'calculate',
      badge: null,
    },
    {
      id: 'universe' as NavTab,
      label: 'Universe',
      icon: 'auto_awesome',
      activeIcon: 'auto_awesome',
      badge: 'All Grades',
    },
    {
      id: 'notebook' as NavTab,
      label: 'Notebook',
      icon: 'menu_book',
      activeIcon: 'menu_book',
      badge: savedCount > 0 ? String(savedCount) : null,
    },
    {
      id: 'quiz' as NavTab,
      label: 'Practice',
      icon: 'quiz',
      activeIcon: 'quiz',
      badge: null,
    },
    {
      id: 'profile' as NavTab,
      label: currentUser ? (currentUser.displayName?.split(' ')[0] || 'Profile') : 'Sign In',
      icon: currentUser ? 'account_circle' : 'login',
      activeIcon: currentUser ? 'account_circle' : 'login',
      badge: currentUser ? 'Cloud Synced' : null,
    },
  ];

  return (
    <>
      {/* Desktop Navigation Rail (M3 standard 80px) */}
      <aside className="hidden md:flex flex-col items-center justify-between w-20 py-4 bg-[#f3edf7] dark:bg-[#211f26] border-r border-[#cac4d0]/30 dark:border-[#49454f]/30 shrink-0 z-30 select-none">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* App Logo */}
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => onTabChange('solver')}>
            <div className="w-12 h-12 rounded-2xl bg-[#00639b] dark:bg-[#90cdff] text-white dark:text-[#003355] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <span className="material-symbols-outlined text-2xl font-bold">school</span>
            </div>
            <span className="text-[10px] font-semibold text-[#00639b] dark:text-[#90cdff] tracking-tight mt-1">OmniStudy</span>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col items-center gap-3 w-full px-2 mt-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className="flex flex-col items-center group w-full relative py-1 focus:outline-none"
                  title={item.label}
                >
                  {/* M3 Active Indicator Pill */}
                  <div
                    className={`w-14 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'bg-[#cbe6ff] dark:bg-[#004b77] text-[#001d33] dark:text-[#cbe6ff] shadow-sm'
                        : 'text-[#51606f] dark:text-[#b8c8da] hover:bg-[#cac4d0]/20 dark:hover:bg-[#49454f]/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {isActive ? item.activeIcon : item.icon}
                    </span>
                    {item.badge && (
                      <span className="absolute -top-1 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-1 font-medium transition-colors ${
                      isActive
                        ? 'text-[#001d33] dark:text-[#cbe6ff] font-semibold'
                        : 'text-[#51606f] dark:text-[#b8c8da]'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Cloud Sync Status Indicator */}
        <div className="flex flex-col items-center pb-2">
          <div
            onClick={() => onTabChange('profile')}
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              currentUser
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
            title={currentUser ? `Cloud Synced: ${currentUser.email}` : 'Local Mode - Click to Sign in with Google'}
          >
            <span className="material-symbols-outlined text-base">
              {currentUser ? 'cloud_done' : 'cloud_off'}
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Bar (M3 standard bottom bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#f3edf7] dark:bg-[#211f26] border-t border-[#cac4d0]/30 dark:border-[#49454f]/30 flex items-center justify-around px-2 z-40 shadow-lg">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 focus:outline-none relative"
            >
              <div
                className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#cbe6ff] dark:bg-[#004b77] text-[#001d33] dark:text-[#cbe6ff]'
                    : 'text-[#51606f] dark:text-[#b8c8da]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {item.icon}
                </span>
                {item.badge && (
                  <span className="absolute top-0 right-3 min-w-[14px] h-3.5 px-0.5 rounded-full bg-[#ba1a1a] text-white text-[8px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 ${
                  isActive
                    ? 'font-semibold text-[#001d33] dark:text-[#cbe6ff]'
                    : 'text-[#51606f] dark:text-[#b8c8da]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
