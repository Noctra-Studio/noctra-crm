import { useTranslations } from "next-intl";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthCodeError() {
  const t = useTranslations("Auth");

  return (
    <div className="mobile-safe-x min-h-dvh bg-neutral-950 flex items-center justify-center py-4">
      <div className="max-w-md w-full min-w-0 bg-neutral-900 border border-neutral-800 rounded-xl p-6 sm:p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">
            Authentication Error
          </h1>
          <p className="text-neutral-400">
            There was a problem verifying your login link. It may have expired
            or already been used.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-block bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-neutral-200 transition-colors">
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
