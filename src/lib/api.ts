import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export const chatWithAI = async (messages: Message[], model?: string) => {
  const { data } = await api.post("/chat", { messages, model });
  return data.message;
};

export const createStarsInvoice = async (amount: number, title?: string, description?: string) => {
  const { data } = await api.post("/payment/stars", { amount, title, description });
  return data;
};

export const createCheckoutLink = async (amount: number, orderId: string, email: string) => {
  const { data } = await api.post("/payment/checkout", { amount, orderId, userEmail: email });
  return data;
};

export const checkPaymentStatus = async (orderId: string) => {
  const { data } = await api.get(`/payment/status/${orderId}`);
  return data;
};
