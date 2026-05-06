import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export const fetchModels = async () => {
  const { data } = await api.get("/models");
  return data;
};

export const chatWithAI = async (messages: Message[], model?: string, files?: File[]) => {
  const formData = new FormData();
  formData.append("messages", JSON.stringify(messages));
  if (model) formData.append("model", model);
  
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const { data } = await api.post("/chat", formData);
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
