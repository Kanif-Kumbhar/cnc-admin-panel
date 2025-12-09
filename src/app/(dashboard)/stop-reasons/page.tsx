import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-helper";
import { StopReasonsTable } from "@/components/stop-reasons/StopReasonsTable"
import { AddStopReasonDialog } from "@/components/stop-reasons/AddStopReasonDialog"

async function getStopReasons() {
  const stopReasons = await db.stopReason.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          stops: true,
        },
      },
    },
  })

  return stopReasons
}

export default async function StopReasonsPage() {
  await requireAuth(["ADMIN", "SUPERVISOR"])
  const stopReasons = await getStopReasons()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stop Reasons</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage stop reason codes and categories
          </p>
        </div>

        <AddStopReasonDialog />
      </div>

      <StopReasonsTable stopReasons={stopReasons} />
    </div>
  )
}