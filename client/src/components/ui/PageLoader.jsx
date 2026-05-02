// const PageLoader = ({ message = "Loading…" }) => {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800">
//       <div className="h-10 w-10 border-4 border-gray-200 border-t-yellow-500 rounded-full animate-spin" />
//       {message && <p className="mt-4 text-sm text-gray-50">{message}</p>}
//     </div>
//   );
// };

// export default PageLoader;
const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111]">
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-10px); opacity: 1; }
        }
        .dot { animation: wave 1s ease-in-out infinite; }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      <div className="flex items-center gap-4">
        <div className="dot w-5 h-5 rounded-full bg-gray-300" />
        <div className="dot w-5 h-5 rounded-full bg-gray-300" />
        <div className="dot w-5 h-5 rounded-full bg-gray-300" />
      </div>
    </div>
  );
};

export default PageLoader;
