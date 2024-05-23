import { load } from "dotenv";
import { z } from 'zod';

const env = await load();

const validated_env = z.object({
  MONGO_ATLAS_USERNAME: z.string(),
  MONGO_ATLAS_PASSWORD: z.string(),
}).transform(Object.entries)
.parse(env);

for (const [key, value] of validated_env) {
  Deno.env.set(key, value);
}
