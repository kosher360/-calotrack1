import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type AnalyzeRequest = { food: string };

type Nutrients = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type AIResponse = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

function toNutrients(obj: AIResponse): Nutrients {
  return {
    calories: Number(obj.calories ?? 0),
    protein: Number(obj.protein ?? 0),
    carbs: Number(obj.carbs ?? 0),
    fat: Number(obj.fat ?? 0),
  };
}

export async function POST(req: Request) {
  // Parse & validate body
  let body: AnalyzeRequest;
  try {
    body = (await req.json()) as AnalyzeRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }
  if (!body?.food || typeof body.food !== "string") {
    return NextResponse.json(
      { ok: false, error: "Missing 'food' (string)." },
      { status: 400 }
    );
  }

  // API key required
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "OPENAI_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = [
      "Estimate nutrition for the following food. Return ONLY valid JSON with keys: calories, protein, carbs, fat (all numbers in grams, except calories).",
      `Food: ${body.food}`,
      "Example output: {\"calories\": 250, \"protein\": 12, \"carbs\": 30, \"fat\": 8}",
    ].join("\n");

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const text: string =
      chat.choices[0]?.message?.content?.trim() ??
      "{\"calories\":0,\"protein\":0,\"carbs\":0,\"fat\":0}";

    // Parse model output as JSON
    let parsed: AIResponse;
    try {
      parsed = JSON.parse(text) as AIResponse;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Model did not return valid JSON.", raw: text },
        { status: 502 }
      );
    }

    const result: Nutrients = toNutrients(parsed);
    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Server error while analyzing." },
      { status: 500 }
    );
  }
}
