import React, { useEffect, useState } from "react";
import api from "@/features/auth/authApi";
import { useDispatch } from "react-redux";
import { grantXP } from "./../../../../server/utils/gamificationHelper.js";
import { Upload, FileText, BrainCircuit, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function DocumentDetailPage() {
  // --- State for Documents List ---
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // --- State for Upload Logic ---
  const [pdf, setPdf] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // --- State for Quiz Logic ---
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const dispatch = useDispatch();

  // 1. Fetch Documents on Load
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await api.get("/documents/");
      setDocuments(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  // 2. Handle PDF Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    setPdf(file);
  };

  // 3. Handle PDF Upload
  const handleUpload = async () => {
    if (!title.trim() || !pdf) {
      toast.error("Please provide a title and select a PDF");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("pdf", pdf);

    try {
      setUploading(true);
      await api.post("/documents/upload", formData); // Adjust to your actual upload endpoint
      toast.success("Document uploaded successfully!");
      setTitle("");
      setPdf(null);
      fetchDocuments(); // Refresh the list
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // 4. Quiz Generation & Evaluation
  const handleGenerateQuiz = async (documentId) => {
    try {
      setGeneratingQuiz(true);
      const res = await api.post("/quiz/generate-quiz", {
        documentId,
        title: "AI Analysis Quiz",
        numberOfQuestions: 5,
        difficulty: "medium",
      });
      setQuiz(res.data.data);
      setAnswers({});
      setResult(null);
    } catch (err) {
      toast.error("Failed to generate quiz");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSubmitQuiz = async () => {
    let score = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) score++;
    });

    const percentage = (score / quiz.questions.length) * 100;
    setResult({ score, total: quiz.questions.length, percentage });

    // Gamification bonus
    if (percentage >= 80) {
      await grantXP(dispatch, 100);
      toast.success("Mastery level! +100 XP");
    } else {
      await grantXP(dispatch, 30);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto mt-24 min-h-screen">
      <h1 className="text-4xl font-jersey tracking-wider mb-8 text-zinc-800">
        Knowledge Vault
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* --- LEFT COLUMN: UPLOAD SECTION --- */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border-2 border-zinc-100 shadow-sm sticky top-32">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-yellow-600" /> New Upload
            </h2>
            <input
              type="text"
              placeholder="Enter PDF title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-4 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none"
            />
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl p-8 cursor-pointer hover:bg-zinc-50 transition mb-4">
              <FileText className="w-10 h-10 text-zinc-300 mb-2" />
              <span className="text-sm text-zinc-500 text-center">
                {pdf ? pdf.name : "Click to select PDF"}
              </span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-yellow-500 text-white font-bold py-3 rounded-xl hover:bg-yellow-600 transition disabled:opacity-50"
            >
              {uploading ? "Processing..." : "Sync to Vault"}
            </button>
          </div>
        </div>

        {/* --- RIGHT COLUMN: DOCUMENTS LIST --- */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            My Library
          </h2>

          {loadingDocs ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-zinc-100 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white border p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-800">{doc.title}</h3>
                      <p className="text-xs text-zinc-400">
                        Status: {doc.status}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerateQuiz(doc._id)}
                    disabled={doc.status !== "ready" || generatingQuiz}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm hover:bg-zinc-800 disabled:opacity-50"
                  >
                    <BrainCircuit className="w-4 h-4" />
                    {generatingQuiz ? "AI Processing..." : "Start Quiz"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- QUIZ MODAL (STAYS SAME) --- */}
      {quiz && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-zinc-900">{quiz.title}</h2>
              <button
                onClick={() => setQuiz(null)}
                className="p-2 hover:bg-zinc-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {quiz.questions.map((q, qIndex) => (
                <div key={qIndex} className="p-5 bg-zinc-50 rounded-2xl">
                  <p className="font-bold mb-4">
                    Q{qIndex + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition ${
                          answers[qIndex] === opt
                            ? "border-blue-500 bg-blue-50"
                            : "bg-white border-zinc-100"
                        }`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          onChange={() =>
                            setAnswers({ ...answers, [qIndex]: opt })
                          }
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!result ? (
              <button
                onClick={handleSubmitQuiz}
                className="w-full mt-8 bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition"
              >
                Submit Quiz
              </button>
            ) : (
              <div className="mt-8 text-center bg-zinc-900 text-white p-6 rounded-3xl">
                <p className="text-4xl font-bold mb-2">
                  {result.score} / {result.total}
                </p>
                <p className="text-zinc-400 mb-6">
                  Accuracy: {result.percentage}%
                </p>
                <button
                  onClick={() => setQuiz(null)}
                  className="w-full bg-white text-zinc-900 py-3 rounded-xl font-bold"
                >
                  Close Result
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
