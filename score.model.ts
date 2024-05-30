import { model, Schema } from "mongoose";

const scoreSchema = new Schema({
  username: { type: String, required: true, unique: true },
  score: { type: Number, required: true },
}, {
  versionKey: false,
});

export const Score = model("Score", scoreSchema);
