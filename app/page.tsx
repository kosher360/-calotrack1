"use client";

import React from "react";

type Result = {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  raw?: string;
};

export default function Home() {
  const [query, setQuery] = React.useState("200g rice");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<Result | null>(null);

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food: query }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      setResult(data.result);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Calories / macros analyzer</h1>

      <form onSubmit={analyze} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "2 eggs and a slice of toast"'
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#111",
            color: "white",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </form>

      {error && (
        <div style={{ color: "#b00020", marginBottom: 12 }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 12,
            lineHeight: 1.6,
          }}
        >
          {"raw" in result ? (
            <>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>Model output (raw):</div>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{result.raw}</pre>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Estimated macros</div>
              <div>Calories: <b>{result.calories}</b></div>
              <div>Protein (g): <b>{result.protein}</b></div>
              <div>Carbs (g): <b>{result.carbs}</b></div>
              <div>Fat (g): <b>{result.fat}</b></div>
            </>
          )}
        </div>
      )}

      <p style={{ color: "#666", marginTop: 16, fontSize: 12 }}>
        Tip: try something like <b>“1 cup cooked quinoa and 150g chicken breast”</b>.
      </p>
    </main>
  );
}
