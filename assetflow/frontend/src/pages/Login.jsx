import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await login(values.email, values.password);
      toast.success("Welcome back");
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-sage-500 flex items-center justify-center text-surface-950 font-display font-bold mb-3">
            AF
          </div>
          <h1 className="font-display font-semibold text-xl text-ink-50">AssetFlow — Log in</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          {serverError && (
            <div className="text-sm bg-maroon-900 text-maroon-400 rounded-lg px-3 py-2">{serverError}</div>
          )}

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              placeholder="name@company.com"
              className="input"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-xs text-maroon-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Password</label>
              <Link to="/forgot-password" className="text-xs text-sage-400 hover:underline">
                Forgot password
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••••"
              className="input"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="text-xs text-maroon-400 mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>

          <p className="text-center text-sm text-ink-400 pt-2 border-t border-surface-700">
            New here?{" "}
            <Link to="/signup" className="text-sage-400 hover:underline">
              Sign up
            </Link>{" "}
            — creates an employee account, admin roles assigned later.
          </p>
        </form>

        <p className="text-center text-xs text-ink-600 mt-6">
          Demo: admin@assetflow.com / admin123
        </p>
      </motion.div>
    </div>
  );
}
