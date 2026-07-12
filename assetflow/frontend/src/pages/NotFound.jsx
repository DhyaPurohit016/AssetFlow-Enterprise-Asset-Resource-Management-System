import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-950 text-center px-4">
      <p className="font-display text-5xl font-semibold text-sage-400 mb-2">404</p>
      <p className="text-ink-400 mb-6">This page doesn't exist.</p>
      <Link to="/" className="btn-primary">Back to Dashboard</Link>
    </div>
  );
}
