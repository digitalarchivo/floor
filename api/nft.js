const cache = new Map();

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing collection id" });
  }

  // Cache HIT (important: still set Cache-Control)
  if (cache.has(id)) {
    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );
    return res.status(200).json(cache.get(id));
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/nfts/${id}`,
      {
        headers: {
          "x-cg-demo-api-key": process.env.CG_API_KEY
        }
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();

    const payload = {
      name: data.name,
      symbol: data.symbol,
      floor_price: data.floor_price,
      market_cap: data.market_cap,
      total_supply: data.total_supply
    };

    cache.set(id, payload);

    // Cache MISS → still set Cache-Control
    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    res.status(200).json(payload);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
