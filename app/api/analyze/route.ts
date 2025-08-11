import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // make sure this runs on Node, not Edge

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // must be in .env.local
});

export async function POST(req: Request) {
  try {
    const { food } = await req.json();

    if (!food || typeof food !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing 'food' (string) in body." },
        { status: 400 }
      );
    }

    const prompt = `
Estimate the calories, protein (g), carbs (g), and fat (g) for: "${food}".
Respond ONLY with JSON of the shape:
{"calories": number, "protein": number, "carbs": number, "fat": number}
No extra text, no markdown.
`.trim();

    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      temperature: 0,
    });

    // SDK v4: easiest way to get text:
    const text = resp.output_text;

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text }; // if the model deviates, you’ll still see what it said
    }

    return NextResponse.json({ ok: true, result: parsed });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
