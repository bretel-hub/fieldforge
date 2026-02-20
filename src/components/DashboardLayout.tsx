'use client'

import { ReactNode, useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Settings,
  Menu,
  X,
  Receipt
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', desc: 'Command center', href: '/', icon: LayoutDashboard },
  { name: 'Proposals', desc: 'Sales pipeline', href: '/proposals', icon: FileText },
  { name: 'Jobs', desc: 'Live operations', href: '/jobs', icon: ClipboardList },
  { name: 'Receipts', desc: 'Capture expenses', href: '/receipts', icon: Receipt },
  { name: 'Customers', desc: 'Accounts', href: '/customers', icon: Users },
  { name: 'Customer Links', desc: 'Share portals', href: '/admin/customer-links', icon: Users },
  { name: 'Settings', desc: 'System', href: '/settings', icon: Settings },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const Nav = (
    <>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,15,10,0.08)] flex items-center justify-center">
          <span className="font-[Manrope] text-base tracking-[0.2em] text-[#0c6cf2]">FF</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#7a7a71]">FieldForge</p>
          <p className="text-lg font-[Manrope] text-[#1f1f1a]">Operations OS</p>
        </div>
      </div>
      <nav className="mt-8 space-y-3">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'block rounded-2xl border px-4 py-3 transition-all',
              pathname === item.href
                ? 'border-[#0c6cf2]/20 bg-white shadow-[0_12px_30px_rgba(12,108,242,0.1)]'
                : 'border-transparent hover:border-[#0c6cf2]/15 hover:bg-white'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[#f3f1ed] p-2 text-[#0c6cf2]">
                <item.icon className="h-4 w-4" />
              </span>
              <div>
                <p className={cn('text-sm font-semibold', pathname === item.href ? 'text-[#0c6cf2]' : 'text-[#1f1f1a]')}>{item.name}</p>
                <p className="text-xs text-[#7a7a71]">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-[rgba(15,15,10,0.08)] bg-white p-4 shadow-[0_15px_40px_rgba(15,15,10,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-[#7a7a71]">Status</p>
        <p className="mt-2 text-lg font-[Manrope] text-[#1f1f1a]">Systems nominal</p>
        <p className="text-xs text-[#7a7a71]">Latency 39ms · API OK</p>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[var(--page)]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative ml-auto flex h-full w-72 flex-col gap-8 bg-[var(--surface)] px-6 py-8 shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto rounded-full border border-[var(--border)] p-2 text-[#7a7a71]"
            >
              <X className="h-4 w-4" />
            </button>
            {Nav}
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col lg:gap-8 lg:bg-transparent lg:px-8 lg:py-8">
        {Nav}
      </div>

      <div className="lg:pl-80">
        <header className="sticky top-0 z-40 flex h-20 items-center border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 backdrop-blur md:px-10">
          <button
            type="button"
            className="-m-2.5 mr-4 rounded-full border border-[var(--border)] p-2 text-[#7a7a71] lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[#1f1f1a]">
              Support
            </button>
            <div className="h-11 w-11 rounded-full bg-[#f3f1ed]" />
          </div>
        </header>

        <main className="px-4 py-10 md:px-10">
          <div className="mx-auto max-w-6xl space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
