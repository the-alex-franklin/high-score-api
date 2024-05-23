import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

const env = await load();

const validated_env = z.object({
  MONGO_ATLAS_USERNAME: z.string(),
  MONGO_ATLAS_PASSWORD: z.string(),
})
  .transform(Object.entries)
  .parse(env);

for (const [key, value] of validated_env) {
  Deno.env.set(key, value);
}
