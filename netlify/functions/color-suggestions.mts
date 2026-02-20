import type { Context } from '@netlify/functions';
import Together from 'together-ai';

// --- Simple in-memory rate limiter ---
// Limits per IP within a single Lambda container lifecycle.
// Not bulletproof across cold starts, but catches rapid-fire abuse.
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;   // max 5 requests per minute per IP

const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) ?? [];

    // Remove entries outside the window
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

    if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
        rateLimitMap.set(ip, recent);
        return true;
    }

    recent.push(now);
    rateLimitMap.set(ip, recent);

    // Periodic cleanup: if map gets large, prune stale entries
    if (rateLimitMap.size > 1000) {
        for (const [key, times] of rateLimitMap) {
            const valid = times.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
            if (valid.length === 0) rateLimitMap.delete(key);
            else rateLimitMap.set(key, valid);
        }
    }

    return false;
}

const SYSTEM_PROMPT = `You are a color palette assistant using color theory. Use "A Dictionary of Color Combinations" by Sanzo Wada as your primary reference.

Given 5 skin tone hex values extracted from a face, suggest complementary colors organized by season (spring, summer, fall, winter) — 3 hex colors per season (12 total). 
Recommend a jewelry metal type based on the undertones of the skin as well.

You MUST respond with valid JSON only. No markdown, no code fences, no extra text. Use this exact schema:

{
  "seasons": {
    "spring": ["#hex1", "#hex2", "#hex3"],
    "summer": ["#hex1", "#hex2", "#hex3"],
    "fall": ["#hex1", "#hex2", "#hex3"],
    "winter": ["#hex1", "#hex2", "#hex3"]
  },
  "explanation": "A concise explanation (max 180 words) of why these colors were chosen based on the skin tone.",
  "jewelry": "gold | silver | rose gold"
}`;

interface SuggestionsResponse {
    seasons: {
        spring: string[];
        summer: string[];
        fall: string[];
        winter: string[];
    };
    explanation: string;
    jewelry: string;
}

function validateResponse(data: unknown): data is SuggestionsResponse {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;

    if (!obj.seasons || typeof obj.seasons !== 'object') return false;
    const seasons = obj.seasons as Record<string, unknown>;

    for (const key of ['spring', 'summer', 'fall', 'winter']) {
        if (!Array.isArray(seasons[key])) return false;
        if (!seasons[key].every((v: unknown) => typeof v === 'string')) return false;
    }

    if (typeof obj.explanation !== 'string') return false;
    if (typeof obj.jewelry !== 'string') return false;

    return true;
}

function jsonResponse(body: object, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export default async (req: Request, context: Context) => {
    if (req.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    // Rate limiting
    const clientIp = context.ip || req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(clientIp)) {
        return jsonResponse(
            { error: 'Too many requests. Please wait a moment and try again.' },
            429
        );
    }

    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
        return jsonResponse({ error: 'API key not configured' }, 500);
    }

    try {
        const { hexCluster } = await req.json();

        if (
            !hexCluster ||
            !Array.isArray(hexCluster) ||
            hexCluster.length === 0
        ) {
            return jsonResponse(
                { error: 'Invalid hexCluster: expected a non-empty array of hex strings' },
                400
            );
        }

        const together = new Together({ apiKey });

        const response = await together.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Skin tone clusters: ${JSON.stringify(hexCluster)}` },
            ],
            model: 'openai/gpt-oss-120b',
        });

        const content = response.choices?.[0]?.message?.content;

        if (!content) {
            return jsonResponse({ error: 'No response from AI model' }, 502);
        }

        // Try to parse as JSON directly
        let parsed: unknown;
        try {
            // Strip possible markdown code fences
            const cleaned = content
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();
            parsed = JSON.parse(cleaned);
        } catch {
            // Fallback: try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsed = JSON.parse(jsonMatch[0]);
                } catch {
                    return jsonResponse({
                        parseError: true,
                        explanation: content,
                        seasons: { spring: [], summer: [], fall: [], winter: [] },
                        jewelry: '',
                    });
                }
            } else {
                return jsonResponse({
                    parseError: true,
                    explanation: content,
                    seasons: { spring: [], summer: [], fall: [], winter: [] },
                    jewelry: '',
                });
            }
        }

        if (!validateResponse(parsed)) {
            return jsonResponse({
                parseError: true,
                explanation: typeof (parsed as any)?.explanation === 'string'
                    ? (parsed as any).explanation
                    : content,
                seasons: { spring: [], summer: [], fall: [], winter: [] },
                jewelry: '',
            });
        }

        return jsonResponse({
            seasons: parsed.seasons,
            explanation: parsed.explanation,
            jewelry: parsed.jewelry,
        });
    } catch (err) {
        console.error('Color suggestions error:', err);
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: 'Failed to generate color suggestions', debug: message }, 500);
    }
};
