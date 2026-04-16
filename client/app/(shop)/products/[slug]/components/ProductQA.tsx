"use client";

import { FormEvent, useState } from "react";
import { formatDate } from "@/lib/utils/formatDate";

type QaItem = {
  id: string;
  question: string;
  answer: string | null;
  asker: string;
  createdAt: string;
};

const initialQuestions: QaItem[] = [
  {
    id: "qa-1",
    question: "Is this product suitable for daily use?",
    answer: "Yes, this item is designed for regular use and standard household needs.",
    asker: "Customer",
    createdAt: new Date().toISOString(),
  },
  {
    id: "qa-2",
    question: "Do you offer bulk pricing?",
    answer: "Bulk pricing is available for larger quantities. Please contact support for a quote.",
    asker: "Buyer",
    createdAt: new Date().toISOString(),
  },
];

export function ProductQA() {
  const [items, setItems] = useState<QaItem[]>(initialQuestions);
  const [question, setQuestion] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuestion = question.trim();

    if (!nextQuestion) {
      setMessage("Please enter your question.");
      return;
    }

    setItems((current) => [
      {
        id: `qa-${Date.now()}`,
        question: nextQuestion,
        answer: null,
        asker: "You",
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setQuestion("");
    setMessage("Question posted. Seller will respond soon.");
  };

  return (
    <section className="product-qa panel">
      <p className="product-qa__eyebrow">Community</p>
      <h2>Questions & Answers</h2>

      <form className="product-qa__form" onSubmit={submitQuestion}>
        <textarea
          rows={3}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about shipping, compatibility, usage..."
        />
        <div className="product-qa__form-footer">
          <button type="submit">Ask question</button>
          {message ? <p>{message}</p> : null}
        </div>
      </form>

      <ul className="product-qa__list">
        {items.map((item) => (
          <li className="product-qa__item" key={item.id}>
            <p className="product-qa__question">{item.question}</p>
            <p className="product-qa__meta">
              {item.asker} • {formatDate(item.createdAt)}
            </p>
            <p className="product-qa__answer">
              {item.answer ? item.answer : "Awaiting answer from seller..."}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
