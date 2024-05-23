import { z } from 'zod';
import { load } from 'dotenv';

await load({ export: true });

export const env = z.object({
  MONGO_ATLAS_USERNAME: z.string(),
  MONGO_ATLAS_PASSWORD: z.string(),
}).parse(Deno.env.toObject());
