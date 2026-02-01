import { cookies } from "next/headers";

export async function getAuthTokenServer() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value || null;
}