import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // If not authenticated, redirect to sign-in page
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Check if user has completed onboarding
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { goals: true },
  });

  // If user hasn't set goals yet, redirect to onboarding
  if (!user?.goals) {
    redirect("/onboarding");
  }

  // User is authenticated and has completed onboarding
  redirect("/dashboard");
}

