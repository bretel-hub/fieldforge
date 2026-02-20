'use client'

import { ReactNode, useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Settings,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Command Deck', label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Proposals', label: 'Sales Intelligence', href: '/proposals', icon: FileText },
  { name: 'Jobs', label: 'Live Operations', href: '/jobs', icon: ClipboardList },
  { name: 'Customers', label: 'Accounts', href: '/customers', icon: Users },
  { name: 'Customer Links', label: 'Share Portals', href: '/admin/customer-links', icon: Users },
  { name: 'Settings', label: 'System', href: '/settings', icon: Settings },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const NavContent = (
    <>
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#f34aff] to-[#51f4ff] shadow-[0_10px_30px_rgba(81,244,255,0.35)] flex items-center justify-center">
          <span className="text-black font-[Chakra Petch] tracking-[0.3em] text-xs">FF</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">FieldForge</p>
          <p className="text-lg font-semibold text-white">Command Surface</p>
        </div>
      </div>
      <nav className="mt-10 space-y-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group block rounded-2xl border border-white/5 px-4 py-3 transition-all duration-300',
              pathname === item.href
                ? 'bg-white/15 text-white shadow-[0_20px_40px_rgba(0,0,0,0.45)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-white/10 p-2 text-white">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-wide">{item.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">{item.label}</p>
                </div>
              </div>
              {pathname === item.href && (
                <span className="text-[10px] tracking-[0.5em] text-[#51f4ff]">LIVE</span>
              )}
            </div>
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">System Health</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-semibold text-white">All services nominal</p>
          <span className="h-2 w-2 rounded-full bg-[#51f4ff] animate-pulse" />
        </div>
        <p className="mt-2 text-[11px] text-white/50">Latency 42ms · Voice uplink stable</p>
      </div>
    </>
  )

  return (
    <div className="relative min-h-screen bg-transparent">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-[#0d111c] px-6 py-6 shadow-[30px_0_60px_rgba(0,0,0,0.65)]">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto rounded-full border border-white/10 p-2 text-white/70"
            >
              <X className="h-4 w-4" />
            </button>
            {NavContent}
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex h-full flex-col gap-10 bg-gradient-to-b from-[#07090f] to-[#0f1524] px-8 py-10 shadow-[20px_0_80px_rgba(0,0,0,0.65)] border-r border-white/5">
          {NavContent}
        </div>
      </div>

      <div className="lg:pl-80">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-white/10 bg-[#05070d]/80 px-4 backdrop-blur md:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-white/70 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/60">
              AI Voice Grid · Synced
            </div>
            <div className="h-10 w-10 rounded-full border border-white/15 bg-white/5" />
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
