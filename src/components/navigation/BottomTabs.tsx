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
    id: 'messages',
    label: 'Messages',
    icon: '💬',
    href: '/messages',
    activeIcon: '💬'
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area">
      <div className="grid grid-cols-5 h-16">
        {TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-xl">
                {isActive ? tab.activeIcon || tab.icon : tab.icon}
              </span>
              <span className="text-xs font-medium">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}