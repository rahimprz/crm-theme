import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Leads from '@/pages/Leads'
import Deals from '@/pages/Deals'
import Contacts from '@/pages/Contacts'
import Companies from '@/pages/Companies'
import { CompanyRecord, ContactRecord } from '@/pages/RecordPage'
import Tasks from '@/pages/Tasks'
import Calendar from '@/pages/Calendar'
import Inbox from '@/pages/Inbox'
import Reports from '@/pages/Reports'
import Workflows from '@/pages/Workflows'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'

/** Routes. Add a page here and in src/config/navigation.ts. */
export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="leads" element={<Leads />} />
        <Route path="deals" element={<Deals />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="contacts/:id" element={<ContactRecord />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies/:id" element={<CompanyRecord />} />
        <Route path="reports" element={<Reports />} />
        <Route path="workflows" element={<Workflows />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
