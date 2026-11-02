import type { CSSProperties, ReactNode } from "react";

/** Masked lines that rise into place once their `.reveal` ancestor becomes visible. */
export function Lines({ lines }: { lines: ReactNode[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <span key={index} className="line-mask">
          <span className="line-inner" style={{ "--line": index } as CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </>
  );
}

export function ChapterMark({ number, label }: { number: string; label: string }) {
  return (
    <div className="chapter-mark reveal">
      <span className="chapter-mark-number">Kapitel {number}</span>
      <span className="chapter-mark-line" aria-hidden="true" />
      <span className="chapter-mark-label">{label}</span>
    </div>
  );
}
