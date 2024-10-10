import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  return <main>{session.user.email}</main>;
}
