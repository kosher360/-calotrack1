"use client";

import { useState } from "react";

type Nutrients = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type AnalyzeResponse =
  | { ok: true; result: Nutrients }
  | { ok: false; error: string; raw?: string };

export default function Home() {
  const [food, setFood] = useState<string>("200g rice");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<Nutrients | null>(null);

  async function handleAnalyze(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food }),
      });

      const data = (await res.json()) as AnalyzeResponse;

      if (!res.ok || data.ok === false) {
        setError(data.ok === false ? data.error : "Request failed.");
        return;
      }

      setResult(data.result);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Calorie / Macro Analyzer</h1>

      <form onSubmit={handleAnalyze} className="space-y-3">
        <label className="block">
          <span className="text-sm text-gray-600">Describe your food</span>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            placeholder="e.g. 2 eggs and 1 slice of toast"
          />
        </label>

        <button
          type="submit"
          disabled={loading || !food.trim()}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 rounded border p-4">
          <h2 className="mb-2 font-medium">Results</h2>
          <div className="grid grid-cols-2 gap-y-1 text-sm">
            <span className="text-gray-600">Calories</span>
            <span>{result.calories}</span>
            <span className="text-gray-600">Protein (g)</span>
            <span>{result.protein}</span>
            <span className="text-gray-600">Carbs (g)</span>
            <span>{result.carbs}</span>
            <span className="text-gray-600">Fat (g)</span>
            <span>{result.fat}</span>
          </div>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-500">
        Tip: start with something like <strong>“200g rice”</strong>.
      </p>
    </main>
  );
}
