import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [sent, setSent] = useState(false);

  const onSubmit = async (values) => {
    try {
      await api.post("/auth/forgot-password", values);
      setSent(true);
    } catch (err) {
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4">
      <div className="w-full max-w-sm card p-6">
        <h1 className="font-display font-semibold text-lg text-ink-50 mb-1">Reset your password</h1>
        <p className="text-sm text-ink-400 mb-5">We'll send a reset link to your email.</p>

        {sent ? (
          <div className="text-sm bg-sage-900 text-sage-400 rounded-lg px-3 py-2">
            If that account exists, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="email" className="input" placeholder="name@company.com" {...register("email", { required: true })} />
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-ink-400 mt-5">
          <Link to="/login" className="text-sage-400 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
