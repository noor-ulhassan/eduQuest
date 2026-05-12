import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "neutral", suppressErrorRendering: true });

export default function MermaidDiagram({ diagram, id }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!diagram || !ref.current) return;
    (async () => {
      try {
        const { svg } = await mermaid.render(id, diagram);
        if (ref.current) ref.current.innerHTML = svg;
      } catch {
        if (ref.current) {
          ref.current.style.display = "none";
          ref.current.innerHTML = "";
        }
        const errorEl = document.getElementById("d" + id);
        if (errorEl) errorEl.remove();
      }
    })();
  }, [diagram, id]);

  return <div ref={ref} className="w-full overflow-x-auto" />;
}
