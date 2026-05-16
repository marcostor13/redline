import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { Lead } from '@/lib/models/Lead';
import { sendClientConfirmation, sendAdminNotification } from '@/lib/email';

const ORIGIN = process.env.ALLOWED_ORIGIN ?? '';

function cors(res: NextResponse): NextResponse {
  res.headers.set('Access-Control-Allow-Origin', ORIGIN);
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return res;
}

export async function OPTIONS(): Promise<NextResponse> {
  return cors(new NextResponse(null, { status: 204 }));
}

const schema = z.object({
  service:  z.string().min(1),
  city:     z.string().min(1),
  state:    z.string().min(1),
  size:     z.string().default(''),
  timeline: z.string().default(''),
  budget:   z.string().default(''),
  name:     z.string().min(1),
  company:  z.string().default(''),
  email:    z.string().email(),
  phone:    z.string().default(''),
  notes:    z.string().default(''),
});

export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return cors(NextResponse.json({ error: parsed.error.flatten() }, { status: 422 }));
  }

  await connectDB();
  const lead = await Lead.create(parsed.data);

  await Promise.allSettled([
    sendClientConfirmation(parsed.data),
    sendAdminNotification(parsed.data),
  ]);

  return cors(NextResponse.json({ id: lead._id }, { status: 201 }));
}

export async function GET(): Promise<NextResponse> {
  await connectDB();
  const leads = await Lead.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(leads);
}
