import Link from "next/link";
import { getAdminSession, getTeamSession } from "@/lib/auth";

export async function RulesPageFooter() {
  const [teamSession, adminSession] = await Promise.all([getTeamSession(), getAdminSession()]);

  return (
    <div className="mt-10 flex flex-col gap-3">
      {teamSession && (
        <Link href="/team" className="btn-primary rounded-xl py-3 text-center text-sm font-semibold">
          Back to team board
        </Link>
      )}
      {adminSession && (
        <Link href="/admin" className="btn-primary rounded-xl py-3 text-center text-sm font-semibold">
          Back to manager console
        </Link>
      )}
      <Link
        href="/"
        className={
          teamSession || adminSession
            ? "btn-secondary rounded-xl py-3 text-center text-sm font-semibold"
            : "text-center text-sm font-medium text-cloudera-gray underline"
        }
      >
        Back to home
      </Link>
      {!teamSession && (
        <Link
          href="/team/login"
          className="btn-primary rounded-xl py-3 text-center text-sm font-semibold"
        >
          Team login
        </Link>
      )}
      {!adminSession && (
        <Link
          href="/admin/login"
          className="btn-secondary rounded-xl py-3 text-center text-sm font-semibold"
        >
          Manager login
        </Link>
      )}
    </div>
  );
}