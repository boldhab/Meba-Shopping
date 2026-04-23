"use client";

import { useEffect, useState } from "react";
import { getAdminQuestions, updateQuestionStatus, answerQuestion, deleteQuestion, type Question } from "@/lib/api/qa";
import { useAuth } from "@/lib/hooks/useAuth";

export function QAAdminList() {
  const { token, isAuthenticated, user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadQuestions = async () => {
    if (!token || !isAuthenticated || user?.role !== "ADMIN") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getAdminQuestions(token);
      setQuestions(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadQuestions();
  }, [token, isAuthenticated, user?.role]);

  const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (!token) return;
    try {
      await updateQuestionStatus(token, id, status);
      await loadQuestions();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !answeringId || !answerText.trim()) return;

    setIsSubmitting(true);
    try {
      await answerQuestion(token, answeringId, answerText.trim());
      setAnsweringId(null);
      setAnswerText("");
      await loadQuestions();
    } catch (err) {
      alert("Failed to post answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this question?")) return;
    try {
      await deleteQuestion(token, id);
      await loadQuestions();
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  if (isLoading) return <div className="panel">Loading Q&A...</div>;
  if (error) return <div className="panel text-red-600">{error}</div>;

  return (
    <div className="panel overflow-x-auto">
      <div className="mb-4">
        <h2 className="m-0">Product Questions</h2>
        <p className="m-0 text-sm text-(--color-muted)">Answer customer inquiries or moderate submissions.</p>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-(--color-muted)">No questions yet.</p>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-3">Product / User</th>
              <th className="px-3 py-3">Question</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Answers</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="border-b border-slate-100 align-top hover:bg-slate-50">
                <td className="px-3 py-3">
                  <div className="font-medium">{q.product?.name}</div>
                  <div className="text-[10px] text-(--color-muted)">by {q.user.name || q.user.id}</div>
                </td>
                <td className="px-3 py-3 max-w-xs">{q.text}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    q.status === "APPROVED" ? "bg-green-100 text-green-800" :
                    q.status === "REJECTED" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {q.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="text-xs">
                    {q.answers.length} {q.answers.length === 1 ? "answer" : "answers"}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setAnsweringId(q.id); setAnswerText(""); }} 
                        className="text-primary text-xs font-bold bg-transparent border-none p-0 cursor-pointer"
                      >
                        Answer
                      </button>
                      <button onClick={() => handleStatusUpdate(q.id, "APPROVED")} className="text-green-600 text-xs bg-transparent border-none p-0 cursor-pointer">Approve</button>
                      <button onClick={() => handleDelete(q.id)} className="text-red-600 text-xs bg-transparent border-none p-0 cursor-pointer">Delete</button>
                    </div>
                    {answeringId === q.id && (
                      <form onSubmit={handleAnswerSubmit} className="mt-2 card-stack p-2 bg-white border border-(--color-border) rounded">
                        <textarea 
                          className="input text-xs w-full mb-2" 
                          rows={3} 
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Type your official answer..."
                          required
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="button scale-75 origin-left" disabled={isSubmitting}>Post</button>
                          <button type="button" onClick={() => setAnsweringId(null)} className="button scale-75 origin-left bg-transparent text-(--color-text)">Cancel</button>
                        </div>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
