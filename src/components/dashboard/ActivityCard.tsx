import { Activity as ActivityIcon } from 'lucide-react'
import { useCrm } from '@/store/crm'
import { Card, CardHeader } from '@/components/ui/Card'
import { ActivityTimeline } from '@/components/crm/ActivityTimeline'

export function ActivityCard() {
  const activities = useCrm((s) => s.activities)
  return (
    <Card className="flex flex-col" data-reveal>
      <CardHeader
        icon={<ActivityIcon />}
        title="Team activity"
        subtitle="Live across your workspace"
        action={
          <span className="flex items-center gap-1.5 text-[11.5px] text-success">
            <span className="pulse-dot size-1.5 rounded-full bg-success text-success" />
            Live
          </span>
        }
      />
      <div className="max-h-[460px] overflow-y-auto p-5">
        <ActivityTimeline items={activities.slice(0, 8)} />
      </div>
    </Card>
  )
}
