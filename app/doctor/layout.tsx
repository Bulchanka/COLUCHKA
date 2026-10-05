import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AppFrame } from "@/components/AppFrame";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (session?.role !== "DOCTOR") redirect("/login");
  return <AppFrame doctor>{children}</AppFrame>;
}
