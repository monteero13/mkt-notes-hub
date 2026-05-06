"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, background: "#09090b", color: "#fafafa", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em" }}>Error crítico</h2>
          <p style={{ color: "#71717a", marginTop: "0.5rem", fontSize: "0.875rem" }}>
            {error.message || "Error inesperado en la aplicación."}
          </p>
          <button
            onClick={reset}
            style={{ marginTop: "1.5rem", padding: "0.5rem 1.5rem", background: "#6366f1", color: "white", border: "none", cursor: "pointer", borderRadius: "2px", fontWeight: 700 }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
