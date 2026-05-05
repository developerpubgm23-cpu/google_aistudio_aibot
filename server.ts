import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
});

// Initialize Telegram Bot (with polling enabled to handle payments/queries)
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || "dummy_token", { polling: true });

// --- API ROUTES ---

// 1. Chat Completion (Groq)
app.get("/api/models", async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.json({ data: [] });
    const models = await groq.models.list();
    res.json(models);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model = "llama-3.3-70b-versatile" } = req.body;
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured" });
    }

    const completion = await groq.chat.completions.create({
      messages,
      model,
    });

    res.json({ message: completion.choices[0]?.message?.content });
  } catch (error: any) {
    console.error("Groq Error:", error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message });
  }
});

// 2. Telegram Stars Invoice
app.post("/api/payment/stars", async (req, res) => {
  try {
    const { amount, title, description } = req.body;
    
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return res.status(500).json({ error: "TELEGRAM_BOT_TOKEN is not configured" });
    }

    // For Stars (XTR), create an invoice link
    const link = await bot.createInvoiceLink(
      title || "Premium AI Access",
      description || "Get unlimited access to Llama 3 70B",
      "premium_stars_pay",
      "", // provider_token empty for Stars
      "XTR",
      [{ label: "Stars", amount: amount || 50 }]
    );

    res.json({ success: true, invoiceLink: link });
  } catch (error: any) {
    console.error("Stars Payment Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- TELEGRAM BOT HANDLERS ---

// MANDATORY: Answer pre_checkout_query for any payment to succeed
bot.on("pre_checkout_query", async (query) => {
  try {
    await bot.answerPreCheckoutQuery(query.id, true);
  } catch (err) {
    console.error("Answer PreCheckout Xato:", err);
  }
});

bot.on("successful_payment", async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, "Tabriklaymiz! To'lov muvaffaqiyatli amalga oshirildi. Endi siz PRO xizmatlaridan foydalanishingiz mumkin! ✅");
});

// Response to checking payments or notifications
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Botimizga xush kelibsiz! Web App-ga kirish uchun pastdagi tugmani bosing.", {
    reply_markup: {
      inline_keyboard: [[{ text: "Ilovani ochish", web_app: { url: process.env.APP_URL || "" } }]]
    }
  });
});

// 3. Checkout.uz Payment
app.post("/api/payment/checkout", async (req, res) => {
  try {
    const { amount, orderId, userEmail, chatId } = req.body;
    const CHECKOUT_API_KEY = process.env.CHECKOUT_UZ_API_KEY;
    
    let paymentUrl = `https://checkout.uz/pay/${orderId}?amount=${amount}&email=${userEmail}`;

    if (CHECKOUT_API_KEY) {
      try {
        const response = await axios.post("https://api.checkout.uz/v1/payment/create", {
          amount: amount * 100,
          order_id: orderId,
          description: "Premium Subscription",
          success_url: process.env.APP_URL || "https://t.me/your_bot",
          user: { email: userEmail }
        }, {
          headers: { "Authorization": `Bearer ${CHECKOUT_API_KEY}` },
          timeout: 5000
        });

        if (response.data?.payment_url) {
          paymentUrl = response.data.payment_url;
        }
      } catch (apiErr: any) {
        console.error("Checkout.uz API Error:", apiErr.response?.data || apiErr.message);
      }
    }

    // Send to Telegram if chatId exists
    if (chatId) {
      bot.sendMessage(chatId, `Sizning to'lov havolangiz tayyor! 💳\n\nSumma: ${amount.toLocaleString()} UZS\n\nTo'lovni amalga oshirish uchun pastdagi tugmani bosing:`, {
        reply_markup: {
          inline_keyboard: [[{ text: "To'lov qilish", url: paymentUrl }]]
        }
      }).catch(err => console.error("Bot sendMessage error:", err));
    }
    
    res.json({ success: true, paymentUrl });
  } catch (error: any) {
    console.error("Checkout.uz Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Payment Status Check
app.get("/api/payment/status/:orderId", async (req, res) => {
  const { orderId } = req.params;
  // Check in DB or via API
  res.json({ status: "pending", orderId });
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
