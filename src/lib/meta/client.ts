export const META_BASE_URL =
  process.env.META_BASE_URL ?? "https://api.meta.ai/v1";

export const MUSE_MODEL = process.env.MUSE_MODEL ?? "muse-spark-1.3";

export const SAM_MODEL = process.env.SAM_MODEL ?? "sam-3.1";

export type ResponseInputContent =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string; detail?: "low" | "high" | "auto" };

export type ResponseInputMessage = {
  role: "system" | "user" | "assistant";
  content: ResponseInputContent[];
};

export type JsonSchemaFormat = {
  type: "json_schema";
  name: string;
  schema: Record<string, unknown>;
  strict: boolean;
};

export type ResponseRequest = {
  model: string;
  input: ResponseInputMessage[] | string;
  max_output_tokens?: number;
  reasoning?: {
    effort: "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
  };
  text?: { format: JsonSchemaFormat };
  metadata?: Record<string, string>;
};

export type ResponseOutputContent = {
  type: string;
  text?: string;
};

export type ResponseOutputItem = {
  type: string;
  content?: ResponseOutputContent[];
};

export type ResponseResult = {
  id?: string;
  status?: string;
  incomplete_details?: { reason?: string } | null;
  output?: ResponseOutputItem[];
  output_text?: string;
  usage?: unknown;
};

export class MetaApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(`Meta Model API ${status}: ${message}`);
    this.name = "MetaApiError";
    this.status = status;
  }
}

export function hasMetaKey(): boolean {
  return Boolean(process.env.MODEL_API_KEY);
}

export function readOutputText(result: ResponseResult): string {
  if (typeof result.output_text === "string" && result.output_text.length > 0) {
    return result.output_text;
  }
  const parts: string[] = [];
  for (const item of result.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }
  return parts.join("");
}

export async function metaRequest(
  path: string,
  body: unknown,
  timeoutMs = 45_000
): Promise<ResponseResult> {
  const apiKey = process.env.MODEL_API_KEY;
  if (!apiKey) {
    throw new Error("MODEL_API_KEY is not set");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${META_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await response.text();

    if (!response.ok) {
      let detail = text.slice(0, 400) || response.statusText;
      try {
        const parsed = JSON.parse(text) as {
          error?: { message?: string; code?: string };
        };
        detail = parsed.error?.message ?? parsed.error?.code ?? detail;
      } catch {
        // keep the raw text
      }
      throw new MetaApiError(detail, response.status);
    }

    return JSON.parse(text) as ResponseResult;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Meta Model API timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
