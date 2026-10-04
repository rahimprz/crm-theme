import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="card mt-10">
      <EmptyState
        icon={<Compass />}
        title="This page doesn’t exist"
        description="The link may be old, or the record was deleted. Head back to the dashboard or press ⌘K to search."
        action={<Button variant="primary" onClick={() => navigate('/')}>Back to dashboard</Button>}
      />
    </div>
  )
}
