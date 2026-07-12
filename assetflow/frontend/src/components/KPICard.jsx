import { motion } from "framer-motion";

export default function KPICard({ label, value, icon: Icon, accent = "sage", index = 0 }) {
  const accentClasses = {
    sage: "text-sage-400 bg-sage-900",
    maroon: "text-maroon-400 bg-maroon-900",
    ink: "text-ink-200 bg-surface-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card p-5 flex items-start justify-between"
    >
      <div>
        <p className="text-xs text-ink-400 mb-2">{label}</p>
        <p className="text-3xl font-display font-semibold text-ink-50">{value ?? "—"}</p>
      </div>
      {Icon && (
        <div className={`p-2.5 rounded-lg ${accentClasses[accent]}`}>
          <Icon size={18} />
        </div>
      )}
    </motion.div>
  );
}
