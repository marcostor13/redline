'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { IProject } from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); });
  }, []);

  async function togglePublished(id: string, published: boolean) {
    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    });
    setProjects((prev) => prev.map((p) => p._id === id ? { ...p, published: !published } : p));
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-display text-[#0a0e13]">Projects</h1>
        <Link
          href="/projects/new"
          className="bg-[#ba0013] text-white px-4 py-2 text-sm font-semibold hover:bg-[#93000d] transition-colors"
        >
          + New Project
        </Link>
      </div>

      <div className="bg-white border border-[#e5e7ea]">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f8f9] text-[#6b7280] text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Project</th>
              <th className="px-6 py-3 text-left font-medium">Service</th>
              <th className="px-6 py-3 text-left font-medium">Location</th>
              <th className="px-6 py-3 text-left font-medium">Year</th>
              <th className="px-6 py-3 text-left font-medium">Published</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7ea]">
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#9ca3af]">Loading...</td>
              </tr>
            )}
            {!loading && projects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#9ca3af]">No projects yet.</td>
              </tr>
            )}
            {projects.map((project) => (
              <tr key={project._id} className="hover:bg-[#f7f8f9]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {project.img && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.img} alt={project.imgAlt} className="w-10 h-10 object-cover border border-[#e5e7ea]" />
                    )}
                    <div>
                      <p className="font-medium text-[#0a0e13]">{project.title}</p>
                      <p className="text-xs text-[#9ca3af]">{project.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#374151]">{project.service}</td>
                <td className="px-6 py-4 text-[#374151]">{project.location}, {project.state}</td>
                <td className="px-6 py-4 text-[#374151]">{project.year}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => togglePublished(project._id, project.published)}
                    className={`relative inline-flex h-5 w-9 items-center transition-colors ${project.published ? 'bg-green-500' : 'bg-[#e5e7ea]'}`}
                  >
                    <span className={`inline-block h-4 w-4 bg-white transition-transform ${project.published ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/projects/${project._id}`} className="text-xs text-[#ba0013] hover:underline font-medium">Edit</Link>
                    <button onClick={() => deleteProject(project._id)} className="text-xs text-[#9ca3af] hover:text-[#ba0013]">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
