export function Spinner({ size = 'md', color = 'primary' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const colors = { primary: 'border-primary', gold: 'border-gold', white: 'border-white' }
  return (
    <div className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full animate-spin`} />
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-dawn">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-river animate-float">
          <span className="text-white font-heading font-bold text-2xl">M</span>
        </div>
        <Spinner size="md" color="primary" />
        <p className="text-primary font-body text-sm">Loading MANNAT…</p>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="h-48 bg-gray-200 rounded-xl mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-10 bg-gray-200 rounded-lg" />
    </div>
  )
}
