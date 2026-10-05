import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AppFrame } from "@/components/AppFrame";
import { getAnnouncementsForPatient } from "@/lib/store";
import { PatientAnnouncementPopup } from "@/components/PatientAnnouncementPopup";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (session?.role !== "PATIENT") redirect("/login");
  return <AppFrame>{children}{session?.role === "PATIENT" && <PatientAnnouncementPopup announcements={getAnnouncementsForPatient(session.id)} />}</AppFrame>;
}
