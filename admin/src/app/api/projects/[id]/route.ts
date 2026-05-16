import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { Project } from '@/lib/models/Project';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx): Promise<NextResponse> {
  const { id } = await ctx.params;
  await connectDB();
  const project = await Project.findById(id).lean();
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(project);
}

const updateSchema = z.object({
  slug:        z.string().optional(),
  title:       z.string().optional(),
  service:     z.string().optional(),
  serviceSlug: z.string().optional(),
  location:    z.string().optional(),
  state:       z.string().optional(),
  year:        z.number().int().optional(),
  scope:       z.string().optional(),
  img:         z.string().url().optional(),
  imgAlt:      z.string().optional(),
  metrics:     z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  challenge:   z.string().optional(),
  solution:    z.string().optional(),
  results:     z.string().optional(),
  tags:        z.array(z.string()).optional(),
  published:   z.boolean().optional(),
});

export async function PUT(req: Request, ctx: Ctx): Promise<NextResponse> {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  await connectDB();
  const project = await Project.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(project);
}

export async function DELETE(_req: Request, ctx: Ctx): Promise<NextResponse> {
  const { id } = await ctx.params;
  await connectDB();
  await Project.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
