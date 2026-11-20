import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    category: z.enum([
      'introduction',
      'core-concepts',
      'guides',
      'examples',
      'integrations',
      'community',
      'reference',
    ]),
    source: z.string(),
    summary: z.array(z.string()).default([]),
  }),
});

export const collections = { docs };
