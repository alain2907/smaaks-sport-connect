'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">
              Mon Profil
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.displayName || user?.email?.split('@')[0] || 'Joueur'}
                </h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-500">Matchs joués</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">-</div>
                <div className="text-sm text-gray-500">Note moyenne</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🚧</span>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Profil complet en développement
          </h2>
          <p className="text-gray-500">
            Bientôt disponible...
          </p>
        </div>
      </div>
    </div>
  );
}