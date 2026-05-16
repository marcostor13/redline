import { connectDB } from '@/lib/mongodb';
import { Lead } from '@/lib/models/Lead';
import { Project } from '@/lib/models/Project';
import Link from 'next/link';

async function getStats() {
  await connectDB();
  const [totalLeads, newLeads, recentLeads, totalProjects] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ status: 'new' }),
    Lead.find().sort({ createdAt: -1 }).limit(5).lean(),
    Project.countDocuments(),
  ]);
  return { totalLeads, newLeads, recentLeads, totalProjects };
}

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  quoted:    'bg-purple-50 text-purple-700 border-purple-200',
  won:       'bg-green-50 text-green-700 border-green-200',
  lost:      'bg-[#fff5f5] text-[#ba0013] border-[#fecaca]',
};

export default async function DashboardPage() {
  const { totalLeads, newLeads, recentLeads, totalProjects } = await getStats();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold font-display text-[#0a0e13] mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Leads',   value: totalLeads,   href: '/leads' },
          { label: 'New Leads',     value: newLeads,     href: '/leads?status=new' },
          { label: 'Projects',      value: totalProjects, href: '/projects' },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white border border-[#e5e7ea] p-6 hover:border-[#ba0013] transition-colors"
          >
            <p className="text-3xl font-bold font-display text-[#ba0013]">{s.value}</p>
            <p className="text-sm text-[#6b7280] mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent leads */}
      <div className="bg-white border border-[#e5e7ea]">
        <div className="px-6 py-4 border-b border-[#e5e7ea] flex items-center justify-between">
          <h2 className="font-semibold font-display text-[#0a0e13]">Recent Leads</h2>
          <Link href="/leads" className="text-xs text-[#ba0013] hover:underline">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#f7f8f9] text-[#6b7280] text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Name</th>
              <th className="px-6 py-3 text-left font-medium">Service</th>
              <th className="px-6 py-3 text-left font-medium">Location</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7ea]">
            {recentLeads.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[#9ca3af]">No leads yet.</td>
              </tr>
            )}
            {recentLeads.map((lead) => (
              <tr key={String(lead._id)} className="hover:bg-[#f7f8f9]">
                <td className="px-6 py-4">
                  <Link href={`/leads/${lead._id}`} className="font-medium text-[#0a0e13] hover:text-[#ba0013]">
                    {lead.name}
                  </Link>
                  <p className="text-xs text-[#9ca3af]">{lead.email}</p>
                </td>
                <td className="px-6 py-4 text-[#374151]">{lead.service}</td>
                <td className="px-6 py-4 text-[#374151]">{lead.city}, {lead.state}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block border px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[lead.status] ?? ''}`}>
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
