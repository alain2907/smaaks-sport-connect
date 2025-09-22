'use client';

export default function Search() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">
              Recherche
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🔍</span>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Page de recherche
          </h2>
          <p className="text-gray-500">
            Bientôt disponible...
          </p>
        </div>
      </div>
    </div>
  );
}