import mongoose, { Schema, type Document } from 'mongoose';

export interface ProjectDoc extends Document {
  slug: string;
  title: string;
  service: string;
  serviceSlug: string;
  location: string;
  state: string;
  year: number;
  scope: string;
  img: string;
  imgAlt: string;
  metrics: { label: string; value: string }[];
  challenge: string;
  solution: string;
  results: string;
  tags: string[];
  published: boolean;
}

const ProjectSchema = new Schema<ProjectDoc>(
  {
    slug:        { type: String, required: true, unique: true },
    title:       { type: String, required: true },
    service:     { type: String, required: true },
    serviceSlug: { type: String, required: true },
    location:    { type: String, required: true },
    state:       { type: String, required: true },
    year:        { type: Number, required: true },
    scope:       { type: String, default: '' },
    img:         { type: String, required: true },
    imgAlt:      { type: String, default: '' },
    metrics:     [{ label: String, value: String }],
    challenge:   { type: String, default: '' },
    solution:    { type: String, default: '' },
    results:     { type: String, default: '' },
    tags:        [String],
    published:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Project = mongoose.models.Project ?? mongoose.model<ProjectDoc>('Project', ProjectSchema);
