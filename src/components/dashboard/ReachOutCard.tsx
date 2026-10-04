import { Clock3 } from 'lucide-react'
import { getReplyHeatmap } from '@/data/analytics'
import { Card, CardHeader } from '@/components/ui/Card'
import { Heatmap } from '@/components/charts/Heatmap'

export function ReachOutCard() {
  const { days, hours, cells } = getReplyHeatmap()
  return (
    <Card className="flex flex-col" data-reveal>
      <CardHeader icon={<Clock3 />} title="Best time to reach out" subtitle="Email reply rate by weekday and hour, last 90 days" />
      <div className="p-5">
        <Heatmap rows={days} cols={hours} cells={cells} />
      </div>
    </Card>
  )
}
