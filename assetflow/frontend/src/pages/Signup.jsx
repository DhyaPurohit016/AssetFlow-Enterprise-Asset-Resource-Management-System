import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export default function Signup() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const signup = useAuthStore((s) => s.signup);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await signup(values.name, values.email, values.password);
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('../assets/office-bg.svg')] bg-cover bg-center opacity-15" />
      <div className="absolute inset-0 bg-gradient-to-br from-surface-950/95 via-surface-950/80 to-surface-950/95" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-sage-500 flex items-center justify-center text-surface-950 font-display font-bold mb-3">
            AF
          </div>
          <h1 className="font-display font-semibold text-xl text-ink-50">Create your account</h1>
          <p className="text-xs text-ink-400 mt-1">Signup creates an Employee account. Admins assign roles later.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-4">
          {serverError && (
            <div className="text-sm bg-maroon-900 text-maroon-400 rounded-lg px-3 py-2">{serverError}</div>
          )}

          <div>
            <label className="label">Full name</label>
            <input className="input" placeholder="Priya Shah" {...register("name", { required: "Name is required" })} />
            {errors.name && <p className="text-xs text-maroon-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="name@company.com" {...register("email", { required: "Email is required" })} />
            {errors.email && <p className="text-xs text-maroon-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="At least 6 characters"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
            />
            {errors.password && <p className="text-xs text-maroon-400 mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-ink-400 pt-2 border-t border-surface-700">
            Already have an account?{" "}
            <Link to="/login" className="text-sage-400 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
