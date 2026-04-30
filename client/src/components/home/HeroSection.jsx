import React, { useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";

const FLOATING_LOGOS = [
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
    src: "/c.png",
    label: "C",
    top: "78%",
    left: "74%",
    size: 40,
    depth: 0.04,
    rotate: 0,
  },
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
    label: "TypeScript",
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
    label: "C++",
    top: "72%",
    left: "34%",
    size: 90,
    depth: 0.05,
    rotate: 0,
  },
];

const STATS = [
  { value: "10K+", label: "Learners" },
  { value: "50K+", label: "Challenges" },
  { value: "9", label: "Languages" },
];

const FloatingLogo = ({ logo, mouseX, mouseY, index }) => {
  const seed = ((index * 7 + 3) % 11) / 11;
  const springConfig = {
    stiffness: 16 + seed * 14,
    damping: 3 + seed * 2.5,
    mass: 1.2 + seed * 1.0,
  };
  const x = useSpring(useMotionValue(0), springConfig);
  const y = useSpring(useMotionValue(0), springConfig);

  React.useEffect(() => {
    const unsubX = mouseX.on("change", (v) => x.set(v * logo.depth));
    const unsubY = mouseY.on("change", (v) => y.set(v * logo.depth));
    return () => {
      unsubX();
      unsubY();
    };
  }, [mouseX, mouseY, logo.depth, x, y]);

  const dur = 4 + seed * 4;
  const ampY = 6 + seed * 10;
  const ampX = 3 + (1 - seed) * 5;
  const delay = seed * 2;

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
      <div
        className="w-full h-full rounded-xl flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
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

const HeroSection = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
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
        marginTop: "-3.5rem",
        paddingTop: "3.5rem",
        backgroundColor: "#171717",
      }}
    >
      <GridDots />

      {FLOATING_LOGOS.map((logo, index) => (
        <FloatingLogo
          key={index}
          logo={logo}
          mouseX={mouseX}
          mouseY={mouseY}
          index={index}
        />
      ))}

      <div
        className="relative z-10 flex flex-col items-center justify-center px-4 text-center"
        style={{ minHeight: "calc(100vh - 3.5rem)" }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-semibold"
        >
          <span>10,000+ developers. One leaderboard.</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="tracking-tight leading-[1.1]"
          style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        >
          <span
            className="font-inter font-bold text-metallic-orange"
            style={{
              letterSpacing: "0.2rem",
              fontSize: "clamp(2.4rem, 6vw, 5rem)",
            }}
          >
            Achieve mastery
          </span>
          <span
            className="block mt-1 font-inter font-bold text-metallic"
            style={{ letterSpacing: "0.3rem" }}
          >
            Through Challenge
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-zinc-400 max-w-lg leading-relaxed"
          style={{ fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
        >
          Solve real challenges. Compete live. Climb the global leaderboard.
          <br className="hidden sm:block" />
          Pick a language and start right now.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="mt-10"
        >
          <button
            onClick={() => navigate("/signup")}
            className="cursor-pointer border border-orange-600 rounded-[6px] bg-gradient-to-br from-[#dc2626] to-[#b91c1c] text-white font-semibold tracking-wider hover:from-red-500 hover:to-red-600 transition-all duration-200 active:scale-95"
            style={{ padding: "14px 40px", fontSize: "1.05rem" }}
          >
            Get Started
          </button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-14 flex items-center gap-6 sm:gap-10"
        >
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && (
                <span className="w-px h-6 bg-zinc-700 hidden sm:block" />
              )}
              <div className="text-center">
                <div className="font-bold text-metallic text-xl sm:text-2xl">
                  {stat.value}
                </div>
                <div className="text-zinc-500 text-xs sm:text-sm mt-0.5">
                  {stat.label}
                </div>
              </div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
