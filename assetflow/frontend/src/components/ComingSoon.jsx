import { Sparkles } from "lucide-react";

export default function ComingSoon({ title, description }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="p-3 rounded-full bg-sage-900 mb-4">
        <Sparkles size={20} className="text-sage-400" />
      </div>
      <h2 className="font-display font-semibold text-ink-50 mb-1.5">{title}</h2>
      <p className="text-sm text-ink-400 max-w-md">{description}</p>
    </div>
  );
}
