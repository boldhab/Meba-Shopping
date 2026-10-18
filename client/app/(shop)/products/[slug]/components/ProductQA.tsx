"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProductQuestions, askQuestion, type Question } from "@/lib/api/qa";
import { useAuth } from "@/lib/hooks/useAuth";
import { HelpCircle, Send, CheckCircle2, ShieldCheck, MessageCircleQuestion } from "lucide-react";

export function ProductQA({ productId }: { productId: string }) {
  const { token, isAuthenticated, user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    const query = newQuestion.trim();
    if (!token || !query) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const created = await askQuestion(token, productId, query);

      // Optimistically append question
      const optimisticQuestion: Question = {
        id: created?.id || `q-${Date.now()}`,
        text: query,
        status: "APPROVED",
        createdAt: new Date().toISOString(),
        user: {
          id: user?.id || "me",
          name: user?.name || "You",
        },
        answers: [],
      };

      setQuestions((prev) => [optimisticQuestion, ...prev]);
      setMessage({ type: "success", text: "Your question has been posted! Our staff and community will answer shortly." });
      setNewQuestion("");
    } catch {
      setMessage({ type: "error", text: "Failed to submit question. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mt-8">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading community questions...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs mt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Community & Support
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Questions & Answers ({questions.length})
          </h2>
        </div>
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Ask about this product
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              className="flex-1 px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all text-slate-900"
              placeholder="e.g. Is this organic? What is the expiration date?"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newQuestion.trim()}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Post Question</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
          {message && (
            <div
              className={`mt-3 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {message.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : "⚠️"}
              <span>{message.text}</span>
            </div>
          )}
        </form>
      ) : (
        <div className="mb-8 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
              ?
            </div>
            <span>Have a specific inquiry regarding ingredients, storage, or packaging?</span>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-slate-900 text-xs shrink-0 transition-colors"
          >
            Sign In to Ask
          </Link>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <MessageCircleQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No questions asked yet</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Be the first to inquire about this product.
            </p>
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-lg bg-orange-500 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  Q
                </span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-900">{q.text}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Asked by <span className="font-semibold text-slate-600">{q.user?.name || "Customer"}</span> •{" "}
                    {new Date(q.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {q.answers && q.answers.length > 0 ? (
                <div className="ml-9 space-y-3 mt-3">
                  {q.answers.map((a) => {
                    const isStaff = a.user?.role === "ADMIN";
                    return (
                      <div key={a.id} className="flex gap-3 items-start p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                        <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          A
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                            {a.text}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                            {isStaff ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Meba Store Representative
                              </span>
                            ) : (
                              <span>{a.user?.name || "Verified Customer"}</span>
                            )}
                            <span>• {new Date(a.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="ml-9 mt-2 text-[11px] text-slate-400 italic">
                  Awaiting response from Meba customer support...
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
