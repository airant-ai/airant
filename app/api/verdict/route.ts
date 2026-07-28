import { env } from "cloudflare:workers";
import { generateResponse, type ResponseStyle } from "../../../lib/response-generator";

const validStyles = new Set<ResponseStyle>(["apologetic", "roast", "therapist", "hr"]);
const validProviders = new Set(["chatgpt", "claude", "gemini", "copilot", "other"]);
const RATE_LIMIT = 15;

function extractText(payload: { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }) {
  return payload.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text?.trim();
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function redactForReview(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email removed]")
    .replace(/(?:\+?44\s?\d{4}|0\d{4})\s?\d{3}\s?\d{3}/g, "[phone removed]")
    .replace(/https?:\/\/\S+/gi, "[link removed]")
    .replace(/@[a-z0-9_.-]{2,}/gi, "[handle removed]");
}

async function initialise(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS verdict_rate_limits (
      bucket TEXT NOT NULL, visitor_hash TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (bucket, visitor_hash)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS consented_rants (
      id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, visitor_hash TEXT NOT NULL,
      submission_id TEXT UNIQUE, provider TEXT NOT NULL, style TEXT NOT NULL, rant TEXT NOT NULL,
      response TEXT NOT NULL, consent_version TEXT NOT NULL,
      moderation_status TEXT NOT NULL DEFAULT 'pending', published_at TEXT
    )`),
  ]);
}

async function enforceRateLimit(db: D1Database, request: Request, visitorId: unknown) {
  const runtime = env as unknown as { RATE_LIMIT_SALT?: string };
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const visitor = typeof visitorId === "string" ? visitorId.slice(0, 64) : "anonymous";
  const visitorHash = await sha256(`${runtime.RATE_LIMIT_SALT || "airant"}:${ip}:${visitor}`);
  const bucket = new Date().toISOString().slice(0, 13);
  await db.prepare(`INSERT INTO verdict_rate_limits (bucket, visitor_hash, count) VALUES (?, ?, 1)
    ON CONFLICT(bucket, visitor_hash) DO UPDATE SET count = count + 1`).bind(bucket, visitorHash).run();
  const row = await db.prepare("SELECT count FROM verdict_rate_limits WHERE bucket = ? AND visitor_hash = ?")
    .bind(bucket, visitorHash).first<{ count: number }>();
  return { allowed: (row?.count || 0) <= RATE_LIMIT, visitorHash };
}

async function saveConsentedRant(db: D1Database, input: {
  rant: string; response: string; provider: string; style: string; visitorHash: string; submissionId: string;
}) {
  await db.prepare(`INSERT INTO consented_rants
    (created_at, visitor_hash, submission_id, provider, style, rant, response, consent_version, moderation_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, '2026-07-28', 'pending')
    ON CONFLICT(submission_id) DO NOTHING`)
    .bind(new Date().toISOString(), input.visitorHash, input.submissionId, input.provider, input.style,
      redactForReview(input.rant), redactForReview(input.response))
    .run();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const rant = typeof body.rant === "string" ? body.rant.trim().slice(0, 1200) : "";
    const style = validStyles.has(body.style as ResponseStyle) ? body.style as ResponseStyle : "roast";
    const provider = validProviders.has(body.provider as string) ? body.provider as string : "other";
    const submissionId = typeof body.submissionId === "string" && /^[a-f0-9-]{20,48}$/i.test(body.submissionId)
      ? body.submissionId : crypto.randomUUID();
    if (rant.length < 12) return Response.json({ error: "Tell us a little more first." }, { status: 400 });

    const runtime = env as unknown as { DB?: D1Database; OPENAI_API_KEY?: string; OPENAI_MODEL?: string };
    let visitorHash = await sha256(String(body.visitorId || "anonymous"));
    if (runtime.DB) {
      await initialise(runtime.DB);
      await runtime.DB.prepare("DELETE FROM consented_rants WHERE published_at IS NULL AND created_at < datetime('now', '-90 days')").run();
      await runtime.DB.prepare("DELETE FROM verdict_rate_limits WHERE bucket < strftime('%Y-%m-%dT%H', 'now', '-2 hours')").run();
      const rate = await enforceRateLimit(runtime.DB, request, body.visitorId);
      visitorHash = rate.visitorHash;
      if (!rate.allowed) return Response.json({ error: "The complaint desk needs a breather. Try again next hour." }, { status: 429 });
    }

    let response: string;
    let generatedBy = "fallback";
    if (!runtime.OPENAI_API_KEY) {
      response = generateResponse(rant, style);
    } else {
      const tone: Record<ResponseStyle, string> = {
        apologetic: "Give a sincere but funny apology on behalf of the AI, accepting responsibility.",
        roast: "Roast the AI's performance sharply but playfully. Never insult the user.",
        therapist: "Validate the user's frustration like a warm, witty therapist without offering medical advice.",
        hr: "Write an absurdly formal AI HR incident finding with a funny corrective action.",
      };
      const apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { authorization: `Bearer ${runtime.OPENAI_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          model: runtime.OPENAI_MODEL || "gpt-5.6-luna", reasoning: { effort: "none" },
          text: { verbosity: "low" }, max_output_tokens: 140,
          safety_identifier: `airant_${visitorHash.slice(0, 48)}`,
          instructions: `You write AIRant verdicts: compact, original comic closure after a frustrating AI interaction. ${tone[style]} Use British English. Write 2–3 sentences, under 70 words. Mention the incident specifically without repeating private details. No headings, markdown, hashtags, profanity, therapy claims, legal claims, or advice.`,
          input: `AI provider: ${provider}\nUser's account of the incident: ${rant}`,
        }),
      });
      if (!apiResponse.ok) throw new Error("OpenAI request failed");
      response = extractText(await apiResponse.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }) || "";
      if (!response) throw new Error("OpenAI returned no text");
      generatedBy = "openai";
    }

    if (body.socialConsent === true && runtime.DB) {
      await saveConsentedRant(runtime.DB, { rant, response, provider, style, visitorHash, submissionId });
    }
    return Response.json({ response, generatedBy, submissionId });
  } catch {
    return Response.json({ error: "The verdict desk is briefly overwhelmed. Please try again." }, { status: 502 });
  }
}
