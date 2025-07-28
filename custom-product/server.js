import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB setup
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(mongoUri);
let db;

async function connectDB() {
  await client.connect();
  db = client.db("shopify_custom_app");
  console.log("Connected to MongoDB");
}
connectDB().catch(console.error);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASS || "password",
  },
});

// API to get products from Shopify Admin API (placeholder)
app.get("/api/products", async (req, res) => {
  // TODO: Implement Shopify Admin API call to fetch products
  res.json({ products: [] });
});

// API to submit quote request
app.post("/api/quotes", async (req, res) => {
  try {
    const quote = req.body;
    const quotesCollection = db.collection("quotes");
    await quotesCollection.insertOne(quote);

    // Send email to merchant
    const mailOptions = {
      from: '"Shopify App" <no-reply@shopifyapp.com>',
      to: process.env.MERCHANT_EMAIL || "merchant@example.com",
      subject: "New Quote Request",
      text: JSON.stringify(quote, null, 2),
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Quote request submitted successfully" });
  } catch (error) {
    console.error("Error submitting quote:", error);
    res.status(500).json({ error: "Failed to submit quote request" });
  }
});

// Serve frontend (React app)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
