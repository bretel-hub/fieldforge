'use client'

import { ReactNode, useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Users,
  Settings,
  Menu,
  X,
  Handshake,
  Receipt
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Proposals', href: '/proposals', icon: FileText },
  { name: 'Jobs', href: '/jobs', icon: Wrench },
  { name: 'Receipts', href: '/receipts', icon: Receipt },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Partners', href: '/partners', icon: Handshake },
  { name: 'Customer Links', href: '/admin/customer-links', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const NavContent = (
    <div className="flex h-full flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[var(--shadow-soft)]">
          <span className="font-['Sora'] text-base tracking-[0.25em] text-[var(--accent)]">FF</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">FieldForge</p>
          <p className="text-lg font-['Sora'] text-[var(--text-primary)]">Operations</p>
        </div>
      </div>
      <nav className="space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all',
              pathname === item.href
                ? 'border-[var(--accent)]/30 bg-white shadow-[var(--shadow-soft)] text-[var(--accent)]'
                : 'border-transparent bg-white/80 text-[var(--text-secondary)] hover:border-[var(--border)] hover:text-[var(--text-primary)]'
            )}
          >
            <span className="flex items-center gap-3">
              <span className={cn('rounded-xl bg-[var(--surface-alt)] p-2', pathname === item.href ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]')}>
                <item.icon className="h-4 w-4" />
              </span>
              {item.name}
            </span>
            {pathname === item.href && <span className="text-xs font-semibold">●</span>}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-[var(--border)] bg-white/90 p-4 shadow-[var(--shadow-soft)]">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">Status</p>
        <p className="mt-2 text-lg font-['Sora'] text-[var(--text-primary)]">Systems nominal</p>
        <p className="text-xs text-[var(--text-secondary)]">Latency 39ms · API OK</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--page-gradient)] text-[var(--text-primary)]">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
          <div className="relative ml-auto flex h-full w-72 flex-col bg-[var(--surface)] px-6 py-8 shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto rounded-full border border-[var(--border)] p-2 text-[var(--text-secondary)]"
            >
              <X className="h-4 w-4" />
            </button>
            {NavContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:px-8 lg:py-8">
        <div className="h-full rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/90 px-6 py-8 shadow-[var(--shadow-soft)]">
          {NavContent}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-20 items-center border-b border-[var(--border)] bg-white/80 px-4 backdrop-blur-sm md:px-10">
          <button
            type="button"
            className="-m-2.5 mr-4 rounded-full border border-[var(--border)] p-2 text-[var(--text-secondary)] lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">
              Support
            </button>
            <div className="h-11 w-11 rounded-full border border-[var(--border)] bg-[var(--surface-alt)]" />
          </div>
        </div>

        <main className="px-4 py-10 md:px-10">
          <div className="mx-auto max-w-6xl space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
