import React from "react";

const WelcomeBanner = ({ className }) => {
  return (
    <div
      className={`relative mx-28 my-28 overflow-hidden rounded-xl shadow-lg ${className}`}
      style={{
        backgroundImage: "url('/mount.jfif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex items-center gap-6 p-8 md:p-12">
        <img
          src="/pika3.gif"
          alt="robo"
          width={100}
          height={100}
          className="object-contain drop-shadow-md"
        />

        <div className="flex flex-col">
          <h2
            className="text-4xl md:text-5xl font-black text-white tracking-wide uppercase"
            style={{ textShadow: "4px 4px 0px #000000" }}
          >
            Learning Paths
          </h2>

          <p className="mt-2 text-lg md:text-xl text-white font-bold drop-shadow-md">
            Step-by-step paths to mastery
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
