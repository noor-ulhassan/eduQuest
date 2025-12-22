import { useEffect, useState } from "react";

const Footer = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 80;

      if (nearBottom) setShow(true);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="relative text-center py-16">
      <div
        className={`transition-all duration-700 ease-out ${
          show
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
      >
        
        <img
          src="/star.png" 
          alt="Quest complete"
          className="w-10 mx-auto mb-4 animate-[bounce_1.5s_ease-in-out_infinite]"
          style={{ imageRendering: "pixelated" }}
        />

        <p className="text-yellow-300 font-jersey tracking-[0.3em] text-xs md:text-sm">
          QUEST COMPLETE
        </p>

        <p className="mt-2 text-gray-500 text-xs">
          You reached the end, nice run!
        </p>
      </div>
    </footer>
  );
};

export default Footer;