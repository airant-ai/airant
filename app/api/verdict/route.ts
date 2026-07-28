import { env } from "cloudflare:workers";
import { generateResponse, type ResponseStyle } from "../../../lib/response-generator";

const validStyles = new Set<ResponseStyle>(["apologetic", "roast", "therapist", "hr"]);
const validProviders = new Set(["chatgpt", "claude", "gemini", "copilot", "other"]);

function extractText(payload: { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }) {
  return payload.output
    ?.flatMap((item) => item.content || [])
    .find((item) => item.type === "output_text")
    ?.text?.trim();
}

async function hashVisitor(value: unknown) {
  const clean = typeof value === "string" ? value.replace(/[^a-f0-9-]/gi, "").slice(0, 48) : "anonymous";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(clean));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function saveConsentedRant(input: { rant: string; response: string; provider: string; style: string; visitorId: unknown }) {
  const db = (env as unknown as { DB?: D1Database }).DB;
  if (!db) return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS consented_rants (
    id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, visitor_hash TEXT NOT NULL,
    provider TEXT NOT NULL, style TEXT NOT NULL, rant TEXT NOT NULL, response TEXT NOT NULL,
    consent_version TEXT NOT NULL, moderation_status TEXT NOT NULL DEFAULT 'pending', published_at TEXT
  )`).run();
  await db.prepare(`INSERT INTO consented_rants
    (created_at, visitor_hash, provider, style, rant, response, consent_version, moderation_status)
    VALUES (?, ?, ?, ?, ?, ?, '2026-07-28', 'pending')`)
    .bind(new Date().toISOString(), await hashVisitor(input.visitorId), input.provider, input.style, input.rant, input.response)
    .run();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rant?: unknown; style?: unknown; provider?: unknown; visitorId?: unknown; socialConsent?: unknown };
    const rant = typeof body.rant === "string" ? body.rant.trim().slice(0, 1200) : "";
    const style = validStyles.has(body.style as ResponseStyle) ? body.style as ResponseStyle : "roast";
    const provider = validProviders.has(body.provider as string) ? body.provider as string : "other";
    if (rant.length < 12) return Response.json({ error: "Tell us a little more first." }, { status: 400 });

    const runtime = env as unknown as { OPENAI_API_KEY?: string; OPENAI_MODEL?: string };
    if (!runtime.OPENAI_API_KEY) {
      const response = generateResponse(rant, style);
      if (body.socialConsent === true) await saveConsentedRant({ rant, response, provider, style, visitorId: body.visitorId });
      return Response.json({ response, generatedBy: "fallback" });
    }

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
        model: runtime.OPENAI_MODEL || "gpt-5.6-luna",
        reasoning: { effort: "none" },
        text: { verbosity: "low" },
        max_output_tokens: 140,
        safety_identifier: `airant_${String(body.visitorId || "anonymous").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48)}`,
        instructions: `You write AIRant verdicts: compact, original comic closure after a frustrating AI interaction. ${tone[style]} Use British English. Write 2–3 sentences, under 70 words. Mention the incident specifically without repeating private details. No headings, markdown, hashtags, profanity, therapy claims, legal claims, or advice.`,
        input: `AI provider: ${provider}\nUser's account of the incident: ${rant}`,
      }),
    });

    if (!apiResponse.ok) throw new Error("OpenAI request failed");
    const response = extractText(await apiResponse.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> });
    if (!response) throw new Error("OpenAI returned no text");
    if (body.socialConsent === true) await saveConsentedRant({ rant, response, provider, style, visitorId: body.visitorId });
    return Response.json({ response, generatedBy: "openai" });
  } catch {
    return Response.json({ error: "The verdict desk is briefly overwhelmed. Please try again." }, { status: 502 });
  }
}
