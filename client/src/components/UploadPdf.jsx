import { useState } from "react";

const UploadPdf = () => {
  const [pdf, setPdf] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      setPdf(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB");
      setPdf(null);
      return;
    }

    setError("");
    setPdf(file);
  };

  const handleUpload = () => {
    if (!pdf) {
      setError("Please select a PDF first");
      return;
    }

    alert(`PDF ready to upload: ${pdf.name}`);
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg text-center">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Upload Your PDF
      </h2>

      <label className="block border-2 border-dashed border-yellow-500 rounded-lg p-12 cursor-pointer hover:bg-yellow-50 transition">
        {pdf ? pdf.name : "Click or drag your PDF here"}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          className="hidden"
        />
      </label>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {pdf && (
        <div className="text-left mt-4 text-gray-700">
          <p>
            <strong>File name:</strong> {pdf.name}
          </p>
          <p>
            <strong>File size:</strong> {(pdf.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        className="mt-6 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
      >
        Upload PDF
      </button>
    </div>
  );
};

export default UploadPdf;
