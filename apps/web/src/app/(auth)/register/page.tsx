"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput, UserRole } from "@rentora/shared";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: UserRole.TENANT },
  });

  async function onSubmit(values: RegisterInput) {
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
      });
      router.push("/login?registered=1");
    } catch (e) {
      setError("root", {
        message: e instanceof Error ? e.message : "Registration failed",
      });
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Join as a tenant to discover homes or as an owner to list properties.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-slate-700">I am a</span>
          <select
            className="h-11 w-full rounded-lg border border-slate-200 px-3"
            {...register("role")}
          >
            <option value={UserRole.TENANT}>Tenant</option>
            <option value={UserRole.OWNER}>Property owner</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">First name</span>
            <input className="h-11 w-full rounded-lg border border-slate-200 px-3" {...register("firstName")} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Last name</span>
            <input className="h-11 w-full rounded-lg border border-slate-200 px-3" {...register("lastName")} />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-700">Email</span>
          <input type="email" className="h-11 w-full rounded-lg border border-slate-200 px-3" {...register("email")} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-700">Password</span>
          <input type="password" className="h-11 w-full rounded-lg border border-slate-200 px-3" {...register("password")} />
          {errors.password && (
            <span className="mt-1 text-xs text-red-600">{errors.password.message}</span>
          )}
        </label>
        {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
