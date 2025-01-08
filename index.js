const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

//call express to initialize app
const app = express();

//for request sharing
app.use(cors());
app.use(express.json());

const openaiKey = process.env.OPENAI_KEY;

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello, world!",
  });
});

//create a route
app.post("/", async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || !messages.length) {
    res.status(400).json({
      success: false,
      message: "Messages Required",
    });
    return;
  }

  // Map user messages into the proper format for OpenAI's chat models
  const formattedMessages = [
    { role: "system", content: "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly." },
    ...messages.map((item) => ({
      role: item.from === "ai" ? "AI" : "Human",
      content: item.text,
    })),
  ];

  const reqUrl = "https://api.openai.com/v1/chat/completions";
  const reqBody = {
    model: "gpt-3.5-turbo",
    messages: formattedMessages,
    max_tokens: 3000,
    temperature: 0.6,
  };

  try {
    const response = await axios.post(reqUrl, reqBody, {
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${openaiKey}`,
      },
    });

    const data = response.data;
    const answer = Array.isArray(data.choices) ? data.choices[0]?.content : "";

    res.status(200).json({
      success: true,
      data: answer.trim(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.response?.data?.error?.message || "Something went wrong",
      error: err.response?.data || err.message,
    });
  }
});

// Start the server
app.listen(5500, () => console.log("Server is up on 5500"));