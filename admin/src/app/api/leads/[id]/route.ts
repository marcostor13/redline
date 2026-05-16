import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { Lead } from '@/lib/models/Lead';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx): Promise<NextResponse> {
  const { id } = await ctx.params;
  await connectDB();
  const lead = await Lead.findById(id).lean();
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(lead);
}

const updateSchema = z.object({
  status:     z.enum(['new','contacted','quoted','won','lost']).optional(),
  adminNotes: z.string().optional(),
  service:    z.string().optional(),
  city:       z.string().optional(),
  state:      z.string().optional(),
  name:       z.string().optional(),
  company:    z.string().optional(),
  email:      z.string().email().optional(),
  phone:      z.string().optional(),
  budget:     z.string().optional(),
  timeline:   z.string().optional(),
  notes:      z.string().optional(),
});

export async function PUT(req: Request, ctx: Ctx): Promise<NextResponse> {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  await connectDB();
  const lead = await Lead.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(lead);
}

export async function DELETE(_req: Request, ctx: Ctx): Promise<NextResponse> {
  const { id } = await ctx.params;
  await connectDB();
  await Lead.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
