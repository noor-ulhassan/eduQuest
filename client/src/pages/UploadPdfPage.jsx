import UploadPdf from "../components/UploadPdf";

const UploadPdfPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 bg-opacity-90 backdrop-blur-md p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300 border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-4 animate-pulse font-jersey tracking-wider">
          Upload Your PDF
        </h2>
        <p className="text-center text-gray-300 mb-6">
          Upload PDFs and level up your workspace!
        </p>
        <UploadPdf />

    
      </div>
    </div>
  );
};

export default UploadPdfPage;