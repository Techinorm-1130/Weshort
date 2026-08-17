import type { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Sign Up" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { email } = await searchParams;
  const initialEmail = typeof email === "string" ? email : "";
  return <SignupForm initialEmail={initialEmail} />;
}
