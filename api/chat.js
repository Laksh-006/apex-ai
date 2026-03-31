export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      content: [{ type: 'text', text: 'Error: GROQ_API_KEY is not set.' }]
    });
  }

  try {
    const { messages, system } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content: system || "You are a helpful AI productivity coach."
          },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({
        content: [{ type: 'text', text: `Groq Error: ${data.error.message}` }]
      });
    }

    const text = data.choices?.[0]?.message?.content || "No response received.";

    res.status(200).json({
      content: [{ type: 'text', text }]
    });

  } catch (err) {
    res.status(500).json({
      content: [{ type: 'text', text: `Server error: ${err.message}` }]
    });
  }
}
