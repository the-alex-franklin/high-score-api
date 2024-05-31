import { Hono } from "hono/mod.ts";
import { cors } from "hono/middleware.ts";
import { connect } from "mongoose";
import { Score } from "./score.model.ts";
import { env } from "./env.ts";
import { z } from "zod";
import { Try } from "fp-try";
import { flow } from "fp-ts/function.ts";

const app = new Hono();
app.use(cors());

connect(`${env.MONGO_ATLAS_URL}/high-score`)
  .then(() => console.log("Connected to MongoDB"))
  .catch(console.error);

app.get("/", (c) => (
  c.text(
    JSON.stringify({ status: "up", timestamp: new Date().toString() }, null, 2),
  )
));

app.post("/new-high-score", async (c) => {
  const body = await c.req.json<unknown>();

  const result = Try(() => (
    z.object({
      username: z.string().min(1).transform(flow(
        (x) => x.trim().toLowerCase(),
        (x) => x.charAt(0).toUpperCase() + x.slice(1),
      )),
      score: z.coerce.number().min(1),
    }).parse(body)
  ));

  if (result.failure) return c.json({ message: "Invalid request body" }, 400);
  const { username, score } = result.data;

  const new_high_score = await Score.findOneAndUpdate(
    { username: { $regex: new RegExp(`^${username}$`, "i") } },
    { username, $max: { score } },
    { upsert: true, new: true },
  ).exec();

  if (new_high_score.score !== score) {
    return c.json({ message: "User already has a higher score" }, 200);
  }

  return c.json({ message: "success" });
});

app.get("/all-scores", async (c) => {
  const scores = await Score.find().sort({ score: "desc" }).exec();

  return c.json({ scores });
});

Deno.serve({ port: 3000 }, app.fetch);
