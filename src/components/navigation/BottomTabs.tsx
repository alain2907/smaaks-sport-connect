'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface TabItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  activeIcon?: string;
}

const TABS: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Accueil',
    icon: '🏠',
    href: '/dashboard',
    activeIcon: '🏠'
  },
  {
    id: 'search',
    label: 'Recherche',
    icon: '🔍',
    href: '/search',
    activeIcon: '🔍'
  },
  {
    id: 'create',
    label: 'Créer',
    icon: '➕',
    href: '/create',
    activeIcon: '➕'
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: '👤',
    href: '/profile',
    activeIcon: '👤'
  }
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white to-purple-50/50 backdrop-blur-lg border-t-2 border-gradient-to-r from-purple-200 via-pink-200 to-blue-200 safe-area shadow-2xl">
      <div className="grid grid-cols-4 h-20">
        {TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 relative group ${
                isActive
                  ? 'text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text transform scale-110'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-t-2xl -z-10 animate-pulse" />
              )}
              <span className={`text-2xl transition-transform duration-300 ${
                isActive ? 'transform -translate-y-1' : 'group-hover:scale-125'
              }`}>
                {isActive ? tab.activeIcon || tab.icon : tab.icon}
              </span>
              <span className={`text-xs font-bold ${
                isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' : ''
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}