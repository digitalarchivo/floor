const collections = [
  "cryptopunks",
  "meebits",
  "bored-ape-yacht-club",
  "azuki",
  "moonbirds",
  "pudgy-penguins",
  "chimpers",
  "good-vibes-club"
];

const table = document.getElementById("nft-table");

function format(num) {
  if (num === null || num === undefined || isNaN(num)) return "—";
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

async function fetchCollection(id) {
  const res = await fetch(`/api/nft?id=${id}`);
  if (!res.ok) throw new Error(`Failed to load ${id}`);
  return res.json();
}

async function loadData() {
  table.innerHTML = "";

  const requests = collections.map(id =>
    fetchCollection(id)
      .then(data => ({ id, data }))
      .catch(err => ({ id, error: err }))
  );

  const results = await Promise.all(requests);

  for (const result of results) {
    const row = document.createElement("tr");

    if (result.error) {
      row.innerHTML = `<td>${result.id}</td><td colspan="4" class="loading">Error loading data</td>`;
      table.appendChild(row);
      continue;
    }

    const data = result.data;

    // FIXED: use native_currency instead of .eth
    const floor = data.floor_price?.native_currency ?? null;
    const marketCap = data.market_cap?.native_currency ?? null;
    const supply = data.total_supply ?? null;

    const fdMarketCap = floor != null && supply != null ? floor * supply : null;
    const mnav = marketCap != null && fdMarketCap != null ? fdMarketCap / marketCap : null;

    row.innerHTML = `
      <td>${data.name} <span class="tag">${data.symbol?.toUpperCase()}</span></td>
      <td>${format(floor)}</td>
      <td>${format(marketCap)}</td>
      <td>${format(fdMarketCap)}</td>
      <td>${mnav != null ? mnav.toFixed(2) + "x" : "—"}</td>
    `;

    table.appendChild(row);
  }
}

loadData();
