import OpenAI from "openai";

export const META_BASE_URL =
  process.env.META_BASE_URL ?? "https://api.meta.ai/v1";

export const MUSE_MODEL = process.env.MUSE_MODEL ?? "muse-spark-1.3";

export const SAM_MODEL = process.env.SAM_MODEL ?? "sam-3.1";

let cached: OpenAI | null = null;

export function hasMetaKey(): boolean {
  return Boolean(process.env.MODEL_API_KEY);
}

export function metaClient(): OpenAI {
  const apiKey = process.env.MODEL_API_KEY;
  if (!apiKey) {
    throw new Error("MODEL_API_KEY is not set");
  }
  if (!cached) {
    cached = new OpenAI({
      apiKey,
      baseURL: META_BASE_URL,
      timeout: 50_000,
      maxRetries: 1,
    });
  }
  return cached;
}
