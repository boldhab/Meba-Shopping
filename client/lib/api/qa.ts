import { requestApi } from "./client";

export type Question = {
  id: string;
  text: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: { id: string; name: string | null };
  answers: Answer[];
  product?: { id: string; name: string; slug: string };
};

export type Answer = {
  id: string;
  text: string;
  createdAt: string;
  user: { id: string; name: string | null; role: string };
};

export async function getProductQuestions(productId: string): Promise<Question[]> {
  return requestApi<Question[]>(`/qa/products/${productId}`);
}

export async function askQuestion(token: string, productId: string, text: string): Promise<Question> {
  return requestApi<Question>("/qa", {
    method: "POST",
    token,
    body: { productId, text },
  });
}

export async function getAdminQuestions(token: string): Promise<{ items: Question[]; total: number }> {
  return requestApi<{ items: Question[]; total: number }>("/qa/admin", { token });
}

export async function updateQuestionStatus(
  token: string,
  questionId: string,
  status: "PENDING" | "APPROVED" | "REJECTED"
): Promise<Question> {
  return requestApi<Question>(`/qa/admin/${questionId}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}

export async function answerQuestion(token: string, questionId: string, text: string): Promise<Answer> {
  return requestApi<Answer>(`/qa/admin/${questionId}/answer`, {
    method: "POST",
    token,
    body: { text },
  });
}

export async function deleteQuestion(token: string, questionId: string): Promise<void> {
  return requestApi<void>(`/qa/admin/${questionId}`, {
    method: "DELETE",
    token,
  });
}
