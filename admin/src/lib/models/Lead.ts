import mongoose, { Schema, type Document } from 'mongoose';

export interface LeadDoc extends Document {
  service: string;
  city: string;
  state: string;
  size: string;
  timeline: string;
  budget: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  adminNotes: string;
}

const LeadSchema = new Schema<LeadDoc>(
  {
    service:    { type: String, required: true },
    city:       { type: String, required: true },
    state:      { type: String, required: true },
    size:       { type: String, default: '' },
    timeline:   { type: String, default: '' },
    budget:     { type: String, default: '' },
    name:       { type: String, required: true },
    company:    { type: String, default: '' },
    email:      { type: String, required: true },
    phone:      { type: String, default: '' },
    notes:      { type: String, default: '' },
    status:     { type: String, enum: ['new','contacted','quoted','won','lost'], default: 'new' },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Lead = mongoose.models.Lead ?? mongoose.model<LeadDoc>('Lead', LeadSchema);
