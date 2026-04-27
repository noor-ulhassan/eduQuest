import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Play } from "lucide-react";
import api from "@/features/auth/authApi";
import { useDispatch, useSelector } from "react-redux";
import { grantXP } from "@/utils/gamificationHelper.js";
import SlideshowPlayer from "./SlideshowPlayer";

mermaid.initialize({ startOnLoad: false, theme: "neutral" });

function MermaidDiagram({ diagram, topicIndex }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!diagram || !ref.current) return;
    const id = `mermaid-topic-${topicIndex}`;
    (async () => {
      try {
        const { svg } = await mermaid.render(id, diagram);
        if (ref.current) {
          ref.current.innerHTML = svg;

          // ── Diagram Visual Styling Start ──────────────────────────────
          const svgEl = ref.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.background = "transparent";
            svgEl.style.maxWidth = "100%";

            // Inject a <style> block directly into the SVG so node/edge
            // colors override whatever Mermaid's neutral theme sets.
            const styleTag = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "style",
            );
            styleTag.textContent = `
              .node rect, .node polygon, .node circle, .node ellipse,
              .node .label-container {
                fill: #1a1d2e !important;
                stroke: #6c63ff !important;
                stroke-width: 1.5px !important;
              }
              .edgePath .path, .flowchart-link {
                stroke: #4f5cf0 !important;
                stroke-opacity: 0.75 !important;
              }
              marker path {
                fill: #4f5cf0 !important;
                stroke: #4f5cf0 !important;
              }
              text {
                fill: #e2e8f0 !important;
              }
              .nodeLabel, .label foreignObject div,
              .label foreignObject span {
                color: #e2e8f0 !important;
              }
              .edgeLabel .label rect {
                fill: #0f1117 !important;
              }
              .edgeLabel span {
                color: #94a3b8 !important;
              }
            `;
            svgEl.prepend(styleTag);

            // rx/ry are SVG geometry attributes — more reliable to set via
            // setAttribute than CSS for cross-browser rounded node corners.
            ref.current.querySelectorAll(".node rect").forEach((rect) => {
              rect.setAttribute("rx", "8");
              rect.setAttribute("ry", "8");
            });
          }
          // ── Diagram Visual Styling End ────────────────────────────────
        }
      } catch {
        if (ref.current) ref.current.style.display = "none";
      }
    })();
  }, [diagram, topicIndex]);

  return <div ref={ref} className="w-full overflow-x-auto" />;
}

function ChapterContent({
  chapter,
  selectedTopic,
  enrollment,
  onProgressUpdate,
}) {
  const topicRefs = useRef([]);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showSlideshow, setShowSlideshow] = useState(false);

  useEffect(() => {
    if (topicRefs.current[selectedTopic]) {
      topicRefs.current[selectedTopic].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedTopic]);

  if (!chapter) {
    return (
      <div className="p-10 mt-16 text-center text-gray-500 font-jersey text-2xl">
        Select a chapter to begin learning...
      </div>
    );
  }

  const handleMarkCompleted = async () => {
    if (!enrollment?._id) return;
    try {
      await api.post("http://localhost:8080/api/v1/ai/mark-chapter-completed", {
        enrollmentId: enrollment._id,
        chapterName: chapter.chapterName,
        userEmail: user?.email,
      });

      await grantXP(dispatch, 150);

      onProgressUpdate();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  return (
    <article className="py-10 max-w-3xl mx-auto font-sans">
      <header className="mb-16 border-b border-white/10 pb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-space-grotesk tracking-tight leading-tight">
          {chapter?.chapterName}
        </h1>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-zinc-400 text-sm font-medium">
            <span className="bg-red-600/10 text-red-400 px-4 py-1.5 rounded-full border border-red-500/20">
              {chapter?.duration || "15 Min"}
            </span>
            <span>•</span>
            <span>{chapter?.topics?.length} Topics</span>
          </div>

          {/* Play Chapter button — opens the SlideshowPlayer modal */}
          <button
            onClick={() => setShowSlideshow(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-500/20 hover:-translate-y-0.5 active:scale-95"
          >
            <Play className="w-4 h-4" fill="currentColor" />
            Play Chapter
          </button>
        </div>
      </header>

      {/* Slideshow modal — rendered outside article flow so it covers the full viewport */}
      {showSlideshow && (
        <SlideshowPlayer
          chapter={chapter}
          onClose={() => setShowSlideshow(false)}
        />
      )}

      <div className="flex flex-col gap-16">
        {chapter?.topics?.map((topic, i) => (
          <section
            key={i}
            ref={(el) => (topicRefs.current[i] = el)}
            className={`transition-all duration-700 ${
              selectedTopic === i
                ? "opacity-100 translate-x-0"
                : "opacity-60 hover:opacity-90"
            }`}
          >
            <h2 className="text-2xl font-bold text-white mb-8 font-space-grotesk flex items-center gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600/20 text-red-400 text-sm border border-red-500/30">
                {i + 1}
              </span>
              {typeof topic === "object" ? topic.topic : topic}
            </h2>

            {topic?.content ? (
              <div
                className="prose prose-zinc prose-invert max-w-none
         prose-p:text-lg prose-p:leading-relaxed prose-p:text-zinc-300
         prose-headings:font-space-grotesk prose-headings:text-white
         prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
         prose-a:text-red-400 prose-a:no-underline hover:prose-a:underline
         prose-strong:text-white prose-strong:font-semibold
         prose-code:text-red-300 prose-code:bg-red-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
         prose-pre:bg-[#111111] prose-pre:border prose-pre:border-white/10
         prose-ul:text-zinc-300 prose-li:marker:text-red-500"
                dangerouslySetInnerHTML={{ __html: topic.content }}
              />
            ) : (
              <div className="py-10 text-zinc-500 italic flex items-center justify-center bg-[#111111] rounded-xl border border-white/5">
                Content generation pending...
              </div>
            )}

            {/* ── Diagram Section Start ──────────────────────────────────── */}
            {topic?.diagram && (
              <div
                className="mt-8 rounded-2xl overflow-hidden"
                style={{
                  background: "#0f1117",
                  boxShadow:
                    "0 0 0 1px rgba(108, 99, 255, 0.22)," +
                    "0 0 40px rgba(108, 99, 255, 0.06)," +
                    "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
                  padding: "24px",
                }}
              >
                {/* Header row: accent bar · label · fading rule */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-[3px] h-4 rounded-full flex-shrink-0"
                    style={{
                      background: "linear-gradient(to bottom, #6c63ff, #4f8ef7)",
                    }}
                  />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.18em]">
                    Concept Diagram
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(108,99,255,0.3), transparent)",
                    }}
                  />
                </div>

                <MermaidDiagram diagram={topic.diagram} topicIndex={i} />
              </div>
            )}
            {/* ── Diagram Section End ────────────────────────────────────── */}
          </section>
        ))}
      </div>

      <div className="mt-20 mb-20 flex justify-center pt-10 border-t border-white/10">
        <Button
          onClick={handleMarkCompleted}
          disabled={enrollment?.completedChapters?.includes(
            chapter?.chapterName,
          )}
          className="text-lg font-bold px-10 h-14 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 rounded-xl transition-all"
        >
          {enrollment?.completedChapters?.includes(chapter?.chapterName) ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" /> Chapter Completed
            </>
          ) : (
            "Mark Chapter as Completed"
          )}
        </Button>
      </div>
    </article>
  );
}

export default ChapterContent;
