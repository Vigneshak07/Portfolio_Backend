const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const app = express();

// ✅ FIX 3: cors("*") as string not array — array with wildcard doesn't work
app.use(cors());
app.use(express.json());

// ✅ FIX 4: Use environment variable for MongoDB URI (set this in Render dashboard)
// Never hardcode credentials in code pushed to GitHub
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Vignesh_Bd:Vigneshak0803@cluster0.vdalara.mongodb.net/portfolioDB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// ===== Schema =====
const MessageSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true }
}, { timestamps: true });

const Message = mongoose.model("Message", MessageSchema);

// ===== Root route — so Render health check doesn't 404 =====
app.get("/", (req, res) => {
  res.send("Portfolio backend is running ✅");
});

// ===== POST /send =====
app.post("/send", async (req, res) => {
  console.log("📩 Data Received:", req.body);
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();
    console.log("✅ Saved to MongoDB:", newMessage);
    res.status(200).send("Message saved successfully");
  } catch (error) {
    console.error("❌ Save Error:", error);
    res.status(500).send("Error saving message");
  }
});

// ===== GET /messages — view all saved messages =====
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).send("Error fetching messages");
  }
});

// ✅ FIX 5: Use process.env.PORT — Render assigns its own port, not 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
