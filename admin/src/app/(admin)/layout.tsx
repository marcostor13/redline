'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/',          label: 'Dashboard',  icon: '▦' },
  { href: '/leads',     label: 'Leads',      icon: '◎' },
  { href: '/projects',  label: 'Projects',   icon: '◈' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0a0e13] flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#ba0013] mb-1">Redline</p>
          <p className="text-white font-semibold text-sm font-display">Admin</p>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  active
                    ? 'text-white bg-white/10 border-l-2 border-[#ba0013]'
                    : 'text-[#9ca3af] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="text-xs text-[#9ca3af] hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
