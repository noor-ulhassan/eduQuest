import React, { useState, useEffect } from "react";

const LowerImage = () => {
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeSpeed, setTypeSpeed] = useState(150);

  const words = ["level up?", "learn?", "build?", "code?"];

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        setDisplayText(currentWord.substring(0, displayText.length - 1));
        setTypeSpeed(100);
      } else {
        setDisplayText(currentWord.substring(0, displayText.length + 1));
        setTypeSpeed(150);
      }

      if (!isDeleting && displayText === currentWord) {
        setTimeout(() => setIsDeleting(true), 400);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    };

    const timer = setTimeout(handleTyping, typeSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex]);

  return (
    <section className="relative z-0 w-full min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/gif6.gif"
          alt="Pixel art landscape"
          className="w-full h-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#0b0f1a]/60 to-transparent h-full"></div>

        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="relative z-10 text-center px-6 mt-[-50px]">
        <h2
          className="text-4xl md:text-7xl font-bold text-white mb-8 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] min-h-[80px] md:min-h-[120px] uppercase"
          style={{ fontFamily: "'Jersey 10', 'Press Start 2P', sans-serif" }}
        >
          Ready to <span className="text-white">{displayText}</span>
          <span className="inline-block w-1 h-10 md:h-16 bg-white ml-2 animate-pulse">
            |
          </span>
        </h2>

        <button className="bg-[#00a2ff] hover:bg-[#0091e6] text-white px-8 py-4 rounded-lg text-lg md:text-xl font-bold border-b-4 border-[#007acc] active:border-b-0 active:translate-y-1 transition-all shadow-xl">
          Start Learning for Free
        </button>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-4 z-10">
        <img src="/happy.gif" alt="" className="w-25 h-25 object-contain" />
      </div>
    </section>
  );
};

export default LowerImage;
