import express from "express";
import path from "path";
import axios from "axios";
import Groq from "groq-sdk";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import cors from "cors";

// Initialize Groq
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || "dummy_key" 
});

// Multer for file uploads
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // 1. Models List
  app.get("/api/models", async (req, res) => {
    try {
      if (!process.env.GROQ_API_KEY) return res.json({ data: [] });
      const models = await groq.models.list();
      res.json(models);
    } catch (error: any) {
      console.error("Models fetch error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Chat with AI (Supporting Files)
  app.post("/api/chat", upload.array("files"), async (req, res) => {
    try {
      const { messages: messagesStr, model = "llama-3.3-70b-versatile" } = req.body;
      const messages = JSON.parse(messagesStr);
      
      let targetModel = model;
      const uploadedFiles = req.files as Express.Multer.File[];

      if (uploadedFiles && uploadedFiles.length > 0) {
        targetModel = "llama-3.2-11b-vision-preview";
      }

      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "dummy_key") {
        return res.status(401).json({ error: "Groq API kaliti sozlanmagan." });
      }

      const completion = await groq.chat.completions.create({
        messages,
        model: targetModel,
      });

      res.json({ message: completion.choices[0]?.message?.content });
    } catch (error: any) {
      console.error("Groq Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Checkout.uz Payment
  app.post("/api/payment/checkout", async (req, res) => {
    try {
      const { amount, orderId, userEmail } = req.body;
      const CHECKOUT_API_KEY = process.env.CHECKOUT_UZ_API_KEY;
      
      let paymentUrl = `https://checkout.uz/pay/${orderId}?amount=${amount}&email=${userEmail}`;

      if (CHECKOUT_API_KEY) {
        try {
          const response = await axios.post("https://api.checkout.uz/v1/payment/create", {
            amount: amount * 100, 
            order_id: orderId,
            description: `Premium AI Subscription`,
            success_url: process.env.APP_URL || `https://t.me/developerairobot`,
            user: { email: userEmail }
          }, {
            headers: { "Authorization": `Bearer ${CHECKOUT_API_KEY}` },
            timeout: 7000
          });

          if (response.data?.payment_url) {
            paymentUrl = response.data.payment_url;
          }
        } catch (apiErr: any) {
          console.error("Checkout.uz API Error:", apiErr.response?.data || apiErr.message);
        }
      }
      
      res.json({ success: true, paymentUrl });
    } catch (error: any) {
      console.error("Checkout.uz Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware
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
