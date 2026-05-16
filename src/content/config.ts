import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const faqItem = z.object({
  question: z.string(),
  answer: z.string(),
});

const contentSchema = z.object({
  title: z.string(),
  shortDesc: z.string(),
  description: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  icon: z.string(),
  order: z.number(),
  keywords: z.array(z.string()),
  faq: z.array(faqItem),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: contentSchema,
});

const industries = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/industries' }),
  schema: contentSchema,
});

export const collections = { services, industries };
