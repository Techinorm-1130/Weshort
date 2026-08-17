import AuthBackground from "@/components/auth/AuthBackground";
import AuthHeader from "@/components/auth/AuthHeader";

/**
 * Shared shell for /login, /signup and /forgot-password.
 * Full-bleed poster background + logo header. No footer.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <AuthBackground />
      <AuthHeader />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        {children}
      </main>
    </div>
  );
}
