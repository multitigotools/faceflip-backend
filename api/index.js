
const axios = require('axios');

module.exports = async (req, res) => {
  // 1. Set CORS so your Multitigo website can talk to this server
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image, style } = req.body;
  
  // REPLACE THE TEXT BELOW WITH YOUR ACTUAL HUGGING FACE TOKEN
  const HF_TOKEN = "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"; 
  
  const models = {
    anime: "cagliostrolab/animagine-xl-3.1",
    caricature: "jbilcke-hf/ai-caricature",
    miniature: "toyxyz/miniature-world-diffusion"
  };

  try {
    const response = await axios({
      url: `https://api-inference.huggingface.co/models/${models[style]}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
      data: JSON.stringify({ inputs: image }),
      responseType: 'arraybuffer'
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    res.status(200).json({ success: true, result: `data:image/png;base64,${base64}` });
  } catch (err) {
    res.status(500).json({ success: false, message: "AI Engine Warming Up... Try in 10 seconds!" });
  }
};
