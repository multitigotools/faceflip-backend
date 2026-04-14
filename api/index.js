const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image, style } = req.body;
  const HF_TOKEN = process.env.HF_TOKEN; 
  
  const models = {
    anime: "cagliostrolab/animagine-xl-3.1",
    caricature: "jbilcke-hf/ai-caricature",
    miniature: "toyxyz/miniature-world-diffusion",
    sketch: "artificialguybr/Sketchy-Style-LoRA"
  };

  try {
    const response = await axios({
      url: `https://router.huggingface.co/hf-inference/models/${models[style] || models.anime}`,
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${HF_TOKEN}`, 
        "Content-Type": "application/json" 
      },
      data: JSON.stringify({ inputs: image }),
      responseType: 'arraybuffer'
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    res.status(200).json({ success: true, image: base64 });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "AI Engine Warming Up... Try again in 10 seconds!" });
  }
};
