import { useNavigate } from 'react-router-dom'
import { Handshake, ArrowRight } from 'lucide-react'
import { useCrm, memberById } from '@/store/crm'
import { useUI } from '@/store/ui'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { Avatar } from '@/components/ui/Avatar'
import { Ring } from '@/components/ui/Progress'
import { StageBadge } from '@/components/crm/meta'
import { money, shortDate } from '@/lib/format'

export function RecentDeals() {
  const deals = useCrm((s) => s.deals)
  const companies = useCrm((s) => s.companies)
  const openDrawer = useUI((s) => s.openDrawer)
  const navigate = useNavigate()
  const rows = [...deals].sort((a, b) => b.value - a.value).filter((d) => d.stage !== 'lost').slice(0, 6)

  return (
    <Card className="flex flex-col overflow-hidden" data-reveal>
      <CardHeader
        icon={<Handshake />}
        title="Top deals"
        subtitle="Largest open and recently won"
        action={
          <Button variant="ghost" size="sm" iconRight={<ArrowRight />} onClick={() => navigate('/deals')}>
            View all
          </Button>
        }
      />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="border-y border-line text-[11.5px] text-faint">
              <th className="px-5 py-2.5 font-medium">Deal</th>
              <th className="px-3 py-2.5 font-medium">Stage</th>
              <th className="px-3 py-2.5 text-right font-medium">Value</th>
              <th className="px-3 py-2.5 font-medium">Close</th>
              <th className="px-3 py-2.5 font-medium">Owner</th>
              <th className="px-5 py-2.5 text-right font-medium">Win</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => {
              const co = companies.find((c) => c.id === d.companyId)
              const owner = memberById(d.ownerId)
              return (
                <tr key={d.id} onClick={() => openDrawer({ type: 'deal', id: d.id })} className="group cursor-pointer border-b border-line/60 transition-colors last:border-0 hover:bg-surface-2">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {co && <CompanyLogo shape={co.logo} color={co.color} size="sm" />}
                      <div className="min-w-0">
                        <div className="truncate font-medium text-fg transition-colors group-hover:text-primary">{d.name}</div>
                        <div className="truncate text-[12px] text-faint">{co?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <StageBadge stage={d.stage} />
                  </td>
                  <td className="tabular px-3 py-3 text-right font-semibold text-fg">{money(d.value)}</td>
                  <td className="tabular px-3 py-3 text-muted">{shortDate(d.closeDate)}</td>
                  <td className="px-3 py-3">
                    {owner && (
                      <span className="flex items-center gap-2 text-muted">
                        <Avatar name={owner.name} hue={owner.hue} size="xs" />
                        {owner.name.split(' ')[0]}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <Ring value={d.probability} size={30} stroke={3} color={d.stage === 'won' ? 'var(--success)' : undefined}>
                        <span className="tabular text-[9px] font-semibold text-muted">{d.probability}</span>
                      </Ring>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
