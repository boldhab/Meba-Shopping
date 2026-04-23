"use client";

import { useEffect, useState } from "react";
import { getProductQuestions, askQuestion, type Question } from "@/lib/api/qa";
import { useAuth } from "@/lib/hooks/useAuth";

export function ProductQA({ productId }: { productId: string }) {
  const { token, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const data = await getProductQuestions(productId);
        setQuestions(data);
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestions();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newQuestion.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await askQuestion(token, productId, newQuestion.trim());
      setMessage({ type: "success", text: "Your question has been submitted and is pending approval." });
      setNewQuestion("");
    } catch (err) {
      setMessage({ type: "error", text: "Failed to submit question." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="py-4">Loading questions...</div>;

  return (
    <div className="mt-12 border-t border-(--color-border) pt-8">
      <h2 className="text-xl font-bold mb-6">Customer Questions & Answers</h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-slate-50 rounded-lg">
          <label className="block text-sm font-medium mb-2">Have a question? Ask it here.</label>
          <div className="flex gap-2">
            <input 
              className="input flex-1" 
              placeholder="Type your question..." 
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              required
            />
            <button className="button" disabled={isSubmitting}>
              {isSubmitting ? "Asking..." : "Ask Question"}
            </button>
          </div>
          {message && (
            <p className={`mt-2 text-xs ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
        </form>
      ) : (
        <div className="mb-8 p-4 bg-slate-50 rounded-lg text-sm">
          Please <a href="/login" className="text-primary font-bold">login</a> to ask a question.
        </div>
      )}

      <div className="space-y-6">
        {questions.length === 0 ? (
          <p className="text-(--color-muted) text-sm">No questions asked yet. Be the first!</p>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="border-b border-(--color-border) pb-6 last:border-0">
              <div className="flex gap-3 items-start mb-2">
                <span className="bg-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded">Q</span>
                <div>
                  <p className="font-medium text-sm">{q.text}</p>
                  <p className="text-[10px] text-(--color-muted)">Asked by {q.user.name || "Anonymous"} on {new Date(q.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {q.answers.length > 0 ? (
                <div className="ml-7 space-y-4 mt-3">
                  {q.answers.map((a) => (
                    <div key={a.id} className="flex gap-3 items-start">
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">A</span>
                      <div>
                        <p className="text-sm">{a.text}</p>
                        <p className="text-[10px] text-(--color-muted)">
                          {a.user.role === "ADMIN" ? <span className="text-primary font-bold">Meba Store Representative</span> : a.user.name} 
                          • {new Date(a.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ml-7 text-xs text-(--color-muted) mt-2 italic">Waiting for an answer...</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
