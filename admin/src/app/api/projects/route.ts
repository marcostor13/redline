import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { Project } from '@/lib/models/Project';

const schema = z.object({
  slug:        z.string().min(1),
  title:       z.string().min(1),
  service:     z.string().min(1),
  serviceSlug: z.string().min(1),
  location:    z.string().min(1),
  state:       z.string().min(1),
  year:        z.number().int().min(2000).max(2100),
  scope:       z.string().default(''),
  img:         z.string().url(),
  imgAlt:      z.string().default(''),
  metrics:     z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  challenge:   z.string().default(''),
  solution:    z.string().default(''),
  results:     z.string().default(''),
  tags:        z.array(z.string()).default([]),
  published:   z.boolean().default(false),
});

export async function GET(): Promise<NextResponse> {
  await connectDB();
  const projects = await Project.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(projects);
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  await connectDB();
  const project = await Project.create(parsed.data);
  return NextResponse.json(project, { status: 201 });
}
