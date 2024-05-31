import { z } from "zod";
import { load } from "dotenv";

await load({ export: true });

export const env = z.object({
  MONGO_ATLAS_URL: z.string(),
}).parse(Deno.env.toObject());
