import { Resend } from 'resend';
import type { ILead } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = 'Redline Installers <noreply@redlineinstallers.com>';
const ADMIN = process.env.ADMIN_EMAIL!;

export async function sendClientConfirmation(lead: Partial<ILead>): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: lead.email!,
    subject: 'Your Quote Request — Redline Installers',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#0a0e13">
        <div style="background:#ba0013;height:4px"></div>
        <div style="padding:40px 32px">
          <h1 style="font-size:24px;margin:0 0 8px">Thanks, ${lead.name}!</h1>
          <p style="color:#4b5563;margin:0 0 24px">
            We received your quote request for <strong>${lead.service}</strong> in ${lead.city}, ${lead.state}.
            A member of our team will reach out within 4 business hours.
          </p>
          <div style="background:#f7f8f9;border:1px solid #e5e7ea;padding:24px;margin-bottom:24px">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Your request summary</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:6px 0;color:#6b7280">Service</td><td style="padding:6px 0"><strong>${lead.service}</strong></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280">Location</td><td style="padding:6px 0">${lead.city}, ${lead.state}</td></tr>
              ${lead.budget ? `<tr><td style="padding:6px 0;color:#6b7280">Budget range</td><td style="padding:6px 0">${lead.budget}</td></tr>` : ''}
              ${lead.timeline ? `<tr><td style="padding:6px 0;color:#6b7280">Timeline</td><td style="padding:6px 0">${lead.timeline}</td></tr>` : ''}
            </table>
          </div>
          <p style="font-size:14px;color:#6b7280">
            Questions? Reply to this email or call <a href="tel:6303637251" style="color:#ba0013">630-363-7251</a>.
          </p>
        </div>
        <div style="background:#0a0e13;padding:20px 32px;font-size:12px;color:#6b7280">
          Redline Installers LLC &bull; 980 N Michigan Ave Ste 1090, Chicago IL 60611
        </div>
      </div>
    `,
  });
}

export async function sendAdminNotification(lead: Partial<ILead>): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: ADMIN,
    subject: `New Lead: ${lead.name} — ${lead.service}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#0a0e13">
        <div style="background:#ba0013;height:4px"></div>
        <div style="padding:40px 32px">
          <h1 style="font-size:20px;margin:0 0 4px">New quote request</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7ea;color:#6b7280;width:40%">Name</td><td style="padding:8px 0;border-bottom:1px solid #e5e7ea"><strong>${lead.name}</strong></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7ea;color:#6b7280">Company</td><td style="padding:8px 0;border-bottom:1px solid #e5e7ea">${lead.company || '—'}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7ea;color:#6b7280">Email</td><td style="padding:8px 0;border-bottom:1px solid #e5e7ea"><a href="mailto:${lead.email}" style="color:#ba0013">${lead.email}</a></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7ea;color:#6b7280">Phone</td><td style="padding:8px 0;border-bottom:1px solid #e5e7ea">${lead.phone || '—'}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7ea;color:#6b7280">Service</td><td style="padding:8px 0;border-bottom:1px solid #e5e7ea">${lead.service}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7ea;color:#6b7280">Location</td><td style="padding:8px 0;border-bottom:1px solid #e5e7ea">${lead.city}, ${lead.state}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7ea;color:#6b7280">Facility size</td><td style="padding:8px 0;border-bottom:1px solid #e5e7ea">${lead.size || '—'}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7ea;color:#6b7280">Timeline</td><td style="padding:8px 0;border-bottom:1px solid #e5e7ea">${lead.timeline || '—'}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7ea;color:#6b7280">Budget</td><td style="padding:8px 0;border-bottom:1px solid #e5e7ea">${lead.budget || '—'}</td></tr>
            ${lead.notes ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top">Notes</td><td style="padding:8px 0">${lead.notes}</td></tr>` : ''}
          </table>
        </div>
      </div>
    `,
  });
}
