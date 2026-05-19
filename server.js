const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");

const app = express();

// ✅ FIXED: Allow requests from your Live Server (port 5500)
app.use(cors({
  origin: ["*"]
}));
app.use(express.json());

// ===== MongoDB Connection =====
mongoose.connect("mongodb+srv://Vignesh_Bd:Vigneshak0803@cluster0.vdalara.mongodb.net/portfolioDB?retryWrites=true&w=majority")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// ===== Schema — ✅ FIXED: added timestamps so you can see when messages were sent =====
const MessageSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true }
}, { timestamps: true }); // adds createdAt & updatedAt automatically

const Message = mongoose.model("Message", MessageSchema);

// ===== POST /send — Save contact form data =====
app.post("/send", async (req, res) => {
  console.log("📩 Data Received:", req.body);

  const { name, email, subject, message } = req.body;

  // Basic server-side check
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

// ===== GET /messages — View all messages (optional, for testing) =====
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).send("Error fetching messages");
  }
});

// ===== Start Server =====
app.listen(5000, () => {
  console.log("🚀 Server running on http://127.0.0.1:5000");
});
