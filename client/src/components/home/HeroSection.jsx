import React, { useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";

const FLOATING_LOGOS = [
  // ─── left side ───
  {
    src: "/python.png",
    label: "Python",
    top: "14%",
    left: "10%",
    size: 80,
    depth: 0.06,
    rotate: 0,
  },
  {
    src: "/html1.png",
    label: "HTML",
    top: "36%",
    left: "7%",
    size: 90,
    depth: 0.045,
    rotate: 0,
  },
  {
    src: "/css1.png",
    label: "CSS",
    top: "58%",
    left: "12%",
    size: 70,
    depth: 0.07,
    rotate: 0,
  },
  {
    src: "/dsa.png",
    label: "DSA",
    top: "76%",
    left: "18%",
    size: 50,
    depth: 0.035,
    rotate: 0,
  },

  // ─── right side ───
  {
    src: "/js1.png",
    label: "JavaScript",
    top: "12%",
    left: "82%",
    size: 60,
    depth: 0.065,
    rotate: 0,
  },
  {
    src: "/react.png",
    label: "React",
    top: "38%",
    left: "84%",
    size: 66,
    depth: 0.05,
    rotate: 0,
  },
  {
    src: "/java.png",
    label: "Java",
    top: "60%",
    left: "80%",
    size: 67,
    depth: 0.075,
    rotate: 0,
  },
  {
    src: "/css1.png",
    label: "C#",
    top: "78%",
    left: "74%",
    size: 40,
    depth: 0.04,
    rotate: 0,
  },

  // ─── inner scattered ───
  {
    src: "/js.png",
    label: "JS",
    top: "20%",
    left: "26%",
    size: 42,
    depth: 0.08,
    rotate: 0,
  },
  {
    src: "/ts.png",
    label: "ts",
    top: "22%",
    left: "68%",
    size: 90,
    depth: 0.055,
    rotate: 0,
  },
  {
    src: "/html1.png",
    label: "HTML5",
    top: "70%",
    left: "62%",
    size: 40,
    depth: 0.085,
    rotate: 0,
  },
  {
    src: "/c.png",
    label: "C#",
    top: "72%",
    left: "34%",
    size: 90,
    depth: 0.05,
    rotate: 0,
  },
];

/* ─────────────────────────────────────────────────────────
   FloatingLogo — a single parallax card with unique physics
   Each logo gets its own spring constants + idle bob so
   they feel independent rather than locked together.
   ───────────────────────────────────────────────────────── */
const FloatingLogo = ({ logo, mouseX, mouseY, index }) => {
  // Deterministic seed per logo so each has unique physics
  const seed = ((index * 7 + 3) % 11) / 11;

  const springConfig = {
    stiffness: 16 + seed * 14, // 18–32  (soft → medium)
    damping: 3 + seed * 2.5, // 3–5.5  (low friction = lots of drift)
    mass: 1.2 + seed * 1.0, // 1.2–2.2 (heavy = momentum/inertia)
  };

  const x = useSpring(useMotionValue(0), springConfig);
  const y = useSpring(useMotionValue(0), springConfig);

  // Subscribe to parent motion values, scaled per-card
  React.useEffect(() => {
    const unsubX = mouseX.on("change", (v) => x.set(v * logo.depth));
    const unsubY = mouseY.on("change", (v) => y.set(v * logo.depth));
    return () => {
      unsubX();
      unsubY();
    };
  }, [mouseX, mouseY, logo.depth, x, y]);

  // Unique idle float so each card bobs independently
  const dur = 4 + seed * 4; // 4–8s cycle
  const ampY = 6 + seed * 10; // 6–16px vertical bob
  const ampX = 3 + (1 - seed) * 5; // 3–8px horizontal sway
  const delay = seed * 2; // stagger start 0–2s

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        top: logo.top,
        left: logo.left,
        x,
        y,
        width: logo.size,
        height: logo.size,
      }}
      initial={{ opacity: 0, scale: 0.6, rotate: logo.rotate }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: [logo.rotate, logo.rotate + 3, logo.rotate - 2, logo.rotate],
        translateY: [0, -ampY, ampY * 0.5, 0],
        translateX: [0, ampX, -ampX * 0.6, 0],
      }}
      transition={{
        opacity: { duration: 0.8, delay: 0.12 * index, ease: "easeOut" },
        scale: { duration: 0.8, delay: 0.12 * index, ease: "easeOut" },
        rotate: {
          duration: dur * 1.3,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
        translateY: {
          duration: dur,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
        translateX: {
          duration: dur * 1.1,
          delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      {/* Glassmorphism card */}
      <div
        className="w-full h-full rounded-xl flex items-center justify-center"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
        }}
      >
        <img
          src={logo.src}
          alt={logo.label}
          className="w-[60%] h-[60%] object-contain opacity-60"
          draggable={false}
        />
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────
   Grid dots background overlay (subtle)
   ───────────────────────────────────────────────────────── */
const GridDots = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage:
        "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
    }}
  />
);

/* ─────────────────────────────────────────────────────────
   HeroSection — main component
   ───────────────────────────────────────────────────────── */
const HeroSection = () => {
  const containerRef = useRef(null);

  // Raw mouse position (centered at 0,0 relative to viewport center)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    },
    [mouseX, mouseY],
  );

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "100vh",
        marginTop: "-3.5rem", // bleed behind the fixed navbar (h-14)
        paddingTop: "3.5rem",
        backgroundColor: "#171717",
      }}
    >
      {/* Radial glow behind text */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "500px",
          background:
            "radial-gradient(ellipse at center, rgba(249,115,22,0.10) 0%, rgba(220,38,38,0.06) 40%, transparent 70%)",
        }}
      />

      {/* Grid dots */}
      <GridDots />

      {/* Floating language logos */}
      {FLOATING_LOGOS.map((logo, index) => (
        <FloatingLogo
          key={logo.label}
          logo={logo}
          mouseX={mouseX}
          mouseY={mouseY}
          index={index}
        />
      ))}

      {/* Center content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center px-4 text-center"
        style={{ minHeight: "calc(100vh - 3.5rem)" }}
      >
        {/* Main headline */}
        <motion.h1
          className=" tracking-tight leading-[1.1]"
          style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span
            className="font-inter text-7xl"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.2rem",
            }}
          >
            Achieve mastery
          </span>
          <span
            className="block text-white mt-1 font-inter "
            style={{
              letterSpacing: "0.3rem",
            }}
          >
            through challenge
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-zinc-100 max-w-xl leading-relaxed"
          style={{ fontSize: "clamp(0.95rem, 1.8vw, 1.2rem)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          Improve your development skills by training with your peers on
          EduQuest that continuously challenge and push your coding practice.
        </motion.p>

        {/* CTA button with glowing rising sun background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="mt-10 relative"
        >
          {/* Glowing rising sun effect */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[-1]"
            style={{
              width: "700px",
              height: "400px",
              background:
                "radial-gradient(ellipse at center, rgba(220, 38, 38, 0.45) 0%, rgba(239, 68, 68, 0.15) 45%, transparent 70%)",
              filter: "blur(24px)",
            }}
          />
          <Link to="/login">
            <button
              className="relative cursor-pointer border border-orange-600 rounded-[6px] bg-gradient-to-br from-[#dc2626] to-[#b91c1c] text-white font-semibold tracking-wider hover:bg-none hover:bg-red-600"
              style={{
                padding: "14px 40px",
                fontSize: "1.05rem",
                // Transition is removed as requested
              }}
            >
              Get Started
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
