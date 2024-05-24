import { Hono } from 'hono/mod.ts';
import { cors } from 'hono/middleware.ts'
import { connect } from 'mongoose';
import { Score } from "./score.model.ts";
import { env } from "./env.ts";
import { z } from 'zod';
import { Try } from './try.ts';

const app = new Hono();
app.use(cors());

connect(`mongodb+srv://${env.MONGO_ATLAS_USERNAME}:${env.MONGO_ATLAS_PASSWORD}@cluster0.ycjf2yc.mongodb.net/high-score`)
  .then(() => console.log('Connected to MongoDB'))
  .catch(console.error);

app.get("/", (c) => c.text("Hello from backend!"));

app.post('/new-high-score', async (c) => {
  const body = await c.req.json();
  console.log(body)

  const result = Try(() => z.object({
    username: z.string().min(1),
    score: z.coerce.number().min(1)
  }).parse(body))

  if (result.failure) return c.json({ message: 'Invalid request body' }, 400);
  const { username, score } = result.data;

  const existing_user = await Score.findOne({ username }).exec();
  if (existing_user?.score && existing_user.score > score) return c.json({ message: 'User already has a higher score' });

  const new_high_score = await Score.findOneAndUpdate(
    { username },
    { score },
    { upsert: true, new: true }
  ).exec();

  return c.json(new_high_score);
})

app.get('/all-scores', async (c) => {
  const scores = await Score.find().sort({ score: 'desc' }).exec();

  return c.json({ scores });
})

app.get('/top-three', async (c) => {
  const top_three = await Score.find().sort({ score: 'desc' }).limit(3).exec();

  return c.json({ top_three });
})

Deno.serve({ port: 3000 }, app.fetch);
