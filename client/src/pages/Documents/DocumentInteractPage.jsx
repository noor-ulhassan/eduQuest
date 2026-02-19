import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "@/features/auth/authApi"; 
import { grantXP } from "./../../../../server/utils/gamificationHelper.js";
import { 
  ArrowLeft, BrainCircuit, Loader2, CheckCircle, History, FileText, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const DocumentInteractPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- State ---
  const [doc, setDoc] = useState(null);
  const [pastAttempts, setPastAttempts] = useState([]); // NEW: Store past scores
  const [loading, setLoading] = useState(true);
  
  // Quiz State
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [savingResult, setSavingResult] = useState(false); // NEW: Loading state for save

  // 1. Fetch Doc Details & Past Attempts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Run both API calls in parallel for speed
        const [docRes, attemptsRes] = await Promise.all([
          api.get(`/documents/${id}`),
          api.get(`/quiz-attempts/document/${id}`) // NEW ROUTE
        ]);
        
        setDoc(docRes.data.data);
        setPastAttempts(attemptsRes.data.data || []);
      } catch (error) {
        toast.error("Failed to load document data");
        navigate("/documents");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // 2. Generate Quiz
  const handleGenerateQuiz = async () => {
    setGenerating(true);
    try {
      const res = await api.post("/quiz/generate-quiz", {
        documentId: id,
        title: `Quiz: ${doc.title}`,
        numberOfQuestions: 5,
        difficulty: "medium"
      });
      setQuiz(res.data.data); 
      setAnswers({});
      setResult(null);
      toast.success("Quiz generated!");
    } catch (error) {
      toast.error("Failed to generate quiz. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  // 3. Submit Quiz & Save to DB
  const handleSubmitQuiz = async () => {
    setSavingResult(true);
    let score = 0;
    
    // Format the QA Pairs exactly how the backend schema expects it
    const qaPairs = quiz.questions.map((q, index) => {
      const isCorrect = answers[index] === q.correctAnswer;
      if (isCorrect) score++;
      
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: answers[index] || "", // Fallback if skipped
        isCorrect: isCorrect,
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    try {
      // API Call to save the attempt
      const attemptRes = await api.post("/quiz-attempts", {
        documentId: id,
        score,
        totalQuestions,
        qaPairs
      });

      // Update UI: Show result and add to past attempts list instantly
      setResult({ score, total: totalQuestions, percentage });
      setPastAttempts([attemptRes.data.data, ...pastAttempts]); // Add new to top of list

      // Gamification
      if (percentage >= 80) {
        await grantXP(dispatch, 100);
        toast.success(`Excellent! You earned 100 XP`);
      } else {
        // await grantXP(dispatch, 20);
        toast.success(`Good effort! You earned 20 XP`);
      }
    } catch (error) {
      toast.error("Failed to save quiz results.");
    } finally {
      setSavingResult(false);
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!doc) return null;

  return (
    <div className="max-w-5xl mx-auto p-8 mt-10 min-h-screen">
      <Button variant="ghost" onClick={() => navigate("/documents")} className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
      </Button>

      {/* Document Header */}
      <div className="flex justify-between items-start mb-8 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-jersey text-zinc-900">{doc.title}</h1>
            <p className="text-zinc-500 mt-1">Uploaded on {new Date(doc.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.open(doc.filePath, "_blank")}>
            View PDF
        </Button>
      </div>

      {/* --- STATE A: Default View (Not taking a quiz) --- */}
      {!quiz && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left/Top Area: Generate New Quiz Banner */}
          <div className="lg:col-span-3 text-center py-12 bg-purple-50 rounded-3xl border-2 border-dashed border-purple-200">
            <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-4">
               <BrainCircuit className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-800 mb-2">Test Your Knowledge</h2>
            <p className="text-zinc-600 mb-6 max-w-md mx-auto">
              Ready to learn? Generate a fresh AI quiz based on this document's contents.
            </p>
            <Button 
              size="lg" 
              onClick={handleGenerateQuiz} 
              disabled={generating || doc.status !== 'ready'}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-6 rounded-xl text-lg shadow-md"
            >
              {generating ? <Loader2 className="animate-spin mr-2" /> : <BrainCircuit className="mr-2" />}
              {generating ? "AI is Generating..." : "Generate New AI Quiz"}
            </Button>
            {doc.status !== 'ready' && <p className="text-yellow-600 mt-4 text-sm font-medium">Document is still processing...</p>}
          </div>

          {/* Bottom Area: Past Attempts Grid */}
          <div className="lg:col-span-3 mt-4">
            <h3 className="text-2xl font-bold font-jersey mb-6 flex items-center">
              <History className="mr-2 text-zinc-400" /> Past Attempts
            </h3>
            
            {pastAttempts.length === 0 ? (
              <div className="text-center py-10 bg-zinc-50 rounded-2xl border text-zinc-500">
                No previous attempts. Take a quiz to establish your baseline!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastAttempts.map((attempt) => (
                  <Card key={attempt._id} className="hover:border-purple-300 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Target className={`w-5 h-5 ${attempt.percentage >= 80 ? 'text-green-500' : 'text-yellow-500'}`} />
                          <span className="font-bold text-lg">{attempt.percentage}%</span>
                        </div>
                        <span className="text-xs text-zinc-400 font-medium">
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-zinc-600 text-sm mb-4">
                        Score: {attempt.score} out of {attempt.totalQuestions}
                      </p>
                      {/* FUTURE FEATURE: The 'Review Highlight' button will go here! */}
                      <Button variant="secondary" className="w-full text-xs font-bold" disabled>
                        Review Highlights (Coming Soon)
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- STATE B: Active Quiz --- */}
      {quiz && !result && (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-center bg-zinc-900 text-white p-4 rounded-xl">
                <h2 className="text-xl font-bold">Live Quiz Session</h2>
                <Button variant="ghost" size="sm" onClick={() => setQuiz(null)} className="text-red-400 hover:text-red-300 hover:bg-zinc-800">
                  Abandon Quiz
                </Button>
            </div>
            
            {quiz.questions.map((q, qIdx) => (
                <Card key={qIdx} className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardContent className="p-6">
                        <p className="font-semibold text-lg mb-4 text-zinc-800">
                            <span className="text-purple-600 mr-2">Q{qIdx + 1}.</span> {q.question}
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                            {q.options.map((opt, oIdx) => (
                                <div 
                                    key={oIdx}
                                    onClick={() => setAnswers({...answers, [qIdx]: opt})}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                        answers[qIdx] === opt 
                                        ? "bg-purple-50 border-purple-500" 
                                        : "bg-white border-zinc-200 hover:border-purple-200"
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                                            answers[qIdx] === opt ? "border-purple-600 bg-purple-600" : "border-zinc-300"
                                        }`}>
                                            {answers[qIdx] === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        {opt}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
            
            <Button 
                onClick={handleSubmitQuiz} 
                className="w-full py-6 text-lg font-bold bg-green-600 hover:bg-green-700 mt-4"
                disabled={Object.keys(answers).length < quiz.questions.length || savingResult}
            >
                {savingResult ? <Loader2 className="animate-spin mr-2" /> : null}
                {savingResult ? "Saving Results..." : "Submit Answers"}
            </Button>
        </div>
      )}

      {/* --- STATE C: Post-Quiz Results --- */}
      {result && (
        <div className="bg-zinc-900 text-white p-10 rounded-3xl text-center shadow-2xl max-w-2xl mx-auto">
            <div className="mb-6">
                {result.percentage >= 80 
                    ? <CheckCircle className="w-20 h-20 text-green-400 mx-auto" /> 
                    : <BrainCircuit className="w-20 h-20 text-yellow-400 mx-auto" />
                }
            </div>
            <h2 className="text-4xl font-bold mb-2">{result.score} / {result.total}</h2>
            <p className="text-zinc-400 text-xl mb-8">
                You scored {result.percentage}% accuracy
            </p>
            <div className="flex justify-center gap-4">
                <Button 
                    onClick={() => { setQuiz(null); setResult(null); }}
                    variant="secondary" 
                    className="px-8 text-zinc-900 font-bold"
                >
                    Back to Document
                </Button>
            </div>
        </div>
      )}
    </div>
  );
};

export default DocumentInteractPage;