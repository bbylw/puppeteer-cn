import { defineConfig, defineDocs, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: frontmatterSchema.extend({
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
  },
});

export default defineConfig();