import { z } from "zod";
import { load } from "dotenv";

await load({ export: true });

export const env = Deno.env.toObject();
