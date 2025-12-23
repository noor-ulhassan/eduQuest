import React, { useEffect, useState } from "react";
import api from "@/features/auth/authApi";

export default function UserDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [quiz, setQuiz] = useState(null); // Full quiz object from backend
  const [answers, setAnswers] = useState({}); // user answers
  const [result, setResult] = useState(null); // evaluation result
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Fetch all user documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoadingDocs(true);
        const res = await api.get("/documents/"); // your endpoint
        setDocuments(res.data.data);
      } catch (err) {
        console.log("Failed to fetch documents", err);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDocuments();
  }, []);

  // Generate quiz for a specific document
  const handleGenerateQuiz = async (documentId) => {
    try {
      setGeneratingQuiz(true);
      const res = await api.post("/quiz/generate-quiz", {
        documentId,
        title: "Auto Generated Quiz",
        numberOfQuestions: 5,
        difficulty: "medium",
      });
      setQuiz(res.data.data); // full quiz with answers
      setAnswers({});
      setResult(null);
    } catch (err) {
      console.error("Failed to generate quiz", err);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Evaluate quiz (frontend only)
  const handleSubmitQuiz = () => {
    let score = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++;
      }
    });
    setResult({
      score,
      total: quiz.questions.length,
      percentage: (score / quiz.questions.length) * 100,
    });
  };

  const handleCloseQuiz = () => {
    setQuiz(null);
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Documents</h1>

      {/* Documents List */}
      {loadingDocs ? (
        <p>Loading documents...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div key={doc._id} className="border p-4 rounded shadow">
              <h2 className="font-semibold text-lg">{doc.title}</h2>
              <p className="text-sm text-gray-500">{doc.fileName}</p>
              <p className="text-sm text-gray-500">
                Size: {(doc.fileSize / 1024).toFixed(2)} KB
              </p>
              <p className="text-sm">
                Status:{" "}
                <span
                  className={
                    doc.status === "ready"
                      ? "text-green-600"
                      : "text-orange-600"
                  }
                >
                  {doc.status}
                </span>
              </p>
              <button
                className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={() => handleGenerateQuiz(doc._id)}
                disabled={doc.status !== "ready" || generatingQuiz}
              >
                {generatingQuiz ? "Generating..." : "Generate Quiz"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Modal / Section */}
      {quiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl p-6 rounded shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">{quiz.title}</h2>

            {quiz.questions.map((q, qIndex) => (
              <div key={qIndex} className="mb-4">
                <p className="font-medium">
                  {qIndex + 1}. {q.question}
                </p>
                <div className="mt-1 space-y-1">
                  {q.options.map((opt, optIndex) => (
                    <label
                      key={optIndex}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name={`q-${qIndex}`}
                        value={opt}
                        checked={answers[qIndex] === opt}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [qIndex]: opt }))
                        }
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {!result ? (
              <button
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleSubmitQuiz}
              >
                Submit Quiz
              </button>
            ) : (
              <div className="mt-4">
                <p className="font-semibold">
                  Score: {result.score} / {result.total} (
                  {result.percentage.toFixed(1)}%)
                </p>
                <button
                  className="mt-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  onClick={handleCloseQuiz}
                >
                  Close Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
