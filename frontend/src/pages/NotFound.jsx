import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 rounded-full bg-godavari-gradient flex items-center justify-center mb-6 animate-float">
        <span className="text-white font-heading text-4xl font-bold">404</span>
      </div>
      <h1 className="font-heading text-3xl text-primary-dark font-bold mb-2">Page Not Found</h1>
      <p className="font-body text-gray-500 mb-6">The river flows on, but this page doesn't exist.</p>
      <Link to="/" className="btn-primary">← Return Home</Link>
    </main>
  )
}
