"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({ content, contentClassName }) => {
  const [activeCard, setActiveCard] = useState(0);
  const sectionRefs = useRef([]);

  // IntersectionObserver — detect which text block is in view
  useEffect(() => {
    const observers = sectionRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveCard(i); },
        { threshold: 0.5, rootMargin: "-20% 0px -30% 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  // Right panel accent gradients — brand tones
  const linearGradients = [
    "linear-gradient(135deg, rgba(234,88,12,0.14) 0%, rgba(63,72,239,0.08) 100%)",
    "linear-gradient(135deg, rgba(63,72,239,0.16) 0%, rgba(234,88,12,0.08) 100%)",
    "linear-gradient(135deg, rgba(234,88,12,0.18) 0%, rgba(120,20,5,0.08) 100%)",
    "linear-gradient(135deg, rgba(63,72,239,0.18) 0%, rgba(10,5,40,0.08) 100%)",
  ];

  return (
    <div className="relative w-full">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 flex gap-12 lg:gap-24">

        {/* ── Left: scrolling text sections ── */}
        <div className="flex-1 min-w-0">
          {content.map((item, index) => (
            <div
              key={item.title + index}
              ref={(el) => (sectionRefs.current[index] = el)}
              className="min-h-[80vh] flex flex-col justify-center py-20"
            >
              <motion.span
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-[10px] font-inter font-bold uppercase tracking-widest text-metallic-orange mb-4 block"
              >
                {item.badge}
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.06 }}
                className={cn(
                  "text-3xl sm:text-4xl font-bold font-inter leading-tight mb-5 transition-colors duration-500",
                  activeCard === index ? "text-metallic" : "text-zinc-600"
                )}
              >
                {item.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
                className={cn(
                  "text-base font-inter leading-relaxed max-w-md transition-colors duration-500",
                  activeCard === index ? "text-zinc-300" : "text-zinc-600"
                )}
              >
                {item.description}
              </motion.p>
            </div>
          ))}
        </div>

        {/* ── Right: sticky visual panel ── */}
        <div className="hidden lg:block w-[44%] shrink-0">
          <div className="sticky top-[16vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCard}
                initial={{ opacity: 0, scale: 0.96, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -24 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ background: linearGradients[activeCard % linearGradients.length] }}
                className={cn(
                  "h-[62vh] max-h-[500px] rounded-2xl border border-white/8 overflow-hidden",
                  contentClassName
                )}
              >
                {content[activeCard]?.content ?? null}
              </motion.div>
            </AnimatePresence>

            {/* Progress indicator */}
            <div className="flex items-center gap-2 mt-5 pl-2">
              {content.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: activeCard === i ? 28 : 6,
                    backgroundColor: activeCard === i ? "#ea580c" : "rgba(255,255,255,0.12)",
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-1.5 rounded-full"
                />
              ))}
              <span className="ml-2 text-[10px] font-inter text-zinc-600 uppercase tracking-widest">
                {String(activeCard + 1).padStart(2, "0")} / {String(content.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
