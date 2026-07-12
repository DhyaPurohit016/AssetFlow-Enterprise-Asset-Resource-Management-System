import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Boxes, ArrowLeftRight, Wrench } from "lucide-react";

const features = [
    {
        icon: Building2,
        title: "Organize departments",
        description: "Keep your teams, departments, and asset responsibilities aligned in one place.",
    },
    {
        icon: Boxes,
        title: "Track inventory",
        description: "Register and manage asset details, lifecycle status, and location with a polished dashboard.",
    },
    {
        icon: ArrowLeftRight,
        title: "Allocate quickly",
        description: "Assign equipment and resources to employees with clear allocation flow and status updates.",
    },
    {
        icon: Wrench,
        title: "Manage maintenance",
        description: "Raise maintenance requests, track progress, and keep assets service-ready.",
    },
];

export default function Home() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('../assets/office-bg.svg')] bg-cover bg-center opacity-25" />
            <div className="absolute inset-0 bg-surface-950/90 backdrop-blur-sm" />
            <div className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <div className="inline-flex items-center gap-2 rounded-full border border-surface-700 bg-surface-900/80 px-4 py-2 text-sm text-sage-300 mb-6">
                                Professional asset, allocation and service management
                            </div>
                            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-ink-50 tracking-tight mb-6">
                                AssetFlow
                                <span className="text-sage-300"> Enterprise Asset Management</span>
                            </h1>
                            <p className="max-w-2xl text-lg text-ink-300 leading-8 mb-8">
                                Streamline asset lifecycle, allocations, maintenance, and team structure with a secure dashboard built for modern operations.
                                Login or sign up to start managing your equipment and service workflows faster.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/login" className="btn-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-lg shadow-sage-500/10">
                                    Login
                                </Link>
                                <Link to="/signup" className="btn-secondary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold">
                                    Sign up
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {features.map((feature) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div key={feature.title} className="card border-surface-700 bg-surface-900/90 p-5 shadow-xl shadow-black/10">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sage-500/10 text-sage-300 shadow-[0_16px_46px_-30px_rgba(74,222,128,0.8)] mb-4">
                                                <Icon size={22} />
                                            </div>
                                            <h2 className="text-lg font-semibold text-ink-50 mb-2">{feature.title}</h2>
                                            <p className="text-sm text-ink-400 leading-6">{feature.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
