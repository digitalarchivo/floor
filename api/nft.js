export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing collection id" });
  }

  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/nfts/${id}`,
      {
        headers: {
          "x-cg-demo-api-key": process.env.CG_API_KEY
        }
      }
    );

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).send(text);
    }

    const data = await r.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
