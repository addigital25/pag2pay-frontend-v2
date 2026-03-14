import PlatformLayout from './PlatformLayout'

/**
 * Componente de Loading específico para Platform Admin
 * Mantém o layout escuro do Platform Admin com sidebar
 */
export default function PlatformPageLoader() {
  return (
    <PlatformLayout>
      <div className="animate-pulse p-6">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-6">
              <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="space-y-4">
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700 rounded w-4/6"></div>
          </div>

          <div className="mt-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b border-slate-700">
                <div className="h-10 w-10 bg-slate-700 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                </div>
                <div className="h-8 w-20 bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PlatformLayout>
  )
}
