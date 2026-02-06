"use client";

import { handleLogout } from "../../../lib/actions/auth-action";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onLogout = async (formData: FormData) => {
    startTransition(async () => {
      const result = await handleLogout();
      if (result.success) {
        router.push("/login");
      }
    });
  };

  return (
    <div>
      <h1>This is Dashboard page</h1>

      <form action={onLogout}>
        <button type="submit" disabled={isPending}>
          {isPending ? "Signing out..." : "Signout"}
        </button>
      </form>

      <button onClick={() => router.push("/dashboard/profile")}>Profile</button>
    </div>
  );
}
