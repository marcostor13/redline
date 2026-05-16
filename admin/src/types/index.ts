export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';

export interface ILead {
  _id: string;
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
  status: LeadStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMetric {
  label: string;
  value: string;
}

export interface IProject {
  _id: string;
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
  metrics: IMetric[];
  challenge: string;
  solution: string;
  results: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
