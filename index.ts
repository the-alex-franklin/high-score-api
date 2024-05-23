import './env.ts';
import { Hono } from 'https://deno.land/x/hono@v4.3.10/mod.ts';
import { connect } from 'mongoose';
import { Score } from "./score.model.ts";

const app = new Hono();

const mongo_atlas_username = Deno.env.get('MONGO_ATLAS_USERNAME');
const mongo_atlas_password = Deno.env.get('MONGO_ATLAS_PASSWORD');

if (!mongo_atlas_username) throw new Error('MONGO_ATLAS_USERNAME is required');
if (!mongo_atlas_password) throw new Error('MONGO_ATLAS_PASSWORD is required');

connect(`mongodb+srv://${mongo_atlas_username}:${mongo_atlas_password}@cluster0.ycjf2yc.mongodb.net/high-score`)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));

app.get("/", (c) => c.text("Hello from backend!"));

app.post('/new-high-score', async (c) => {
  const { username, score } = await c.req.json();
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
  const scores = await Score.find().exec();

  return c.json({ scores });
})

app.get('/top-three', async (c) => {
  const top_three = await Score.find().sort({ score: 'desc' }).limit(3).exec();

  return c.json({ top_three });
})

Deno.serve({ port: 3000 }, app.fetch);
