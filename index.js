// index.js

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

/**
 * Formats a number for display, or returns '—' if invalid
 * @param {number|null} num
 * @returns {string}
 */
function format(num) {
  if (num === null || num === undefined || isNaN(num)) return "—";
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Fetch a single NFT collection from the API route
 * @param {string} id
 * @returns {Promise<Object>}
 */
async function fetchCollection(id) {
  const res = await fetch(`/api/nft?id=${id}`);
  if (!res.ok) {
    throw new Error(`Failed to load ${id}: ${res.status}`);
  }
  return res.json();
}

/**
 * Load all NFT data and populate the table
 */
async function loadData() {
  // Clear table
  table.innerHTML = "";

  // Fetch all collections concurrently, handle errors individually
  const requests = collections.map(id =>
    fetchCollection(id)
      .then(data => ({ id, data }))
      .catch(err => ({ id, error: err }))
  );

  const results = await Promise.all(requests);

  for (const result of results) {
    const row = document.createElement("tr");

    // If there was an error fetching this collection
    if (result.error) {
      row.innerHTML = `
        <td>${result.id}</td>
        <td colspan="4" class="loading">Error loading data</td>
      `;
      table.appendChild(row);
      continue;
    }

    const data = result.data;

    // Extract numeric ETH values from API response
    const floor = data.floor_price?.eth ?? null;
    const marketCap = data.market_cap?.eth ?? null;
    const supply = data.total_supply ?? null;

    // Calculate FD Market Cap and mNAV
    const fdMarketCap = (floor != null && supply != null) ? floor * supply : null;
    const mnav = (marketCap != null && fdMarketCap != null) ? fdMarketCap / marketCap : null;

    // Append row to table
    row.innerHTML = `
      <td>
        ${data.name}
        <span class="tag">${data.symbol?.toUpperCase()}</span>
      </td>
      <td>${format(floor)}</td>
      <td>${format(marketCap)}</td>
      <td>${format(fdMarketCap)}</td>
      <td>${mnav != null ? mnav.toFixed(2) + "x" : "—"}</td>
    `;

    table.appendChild(row);
  }
}

// Run on page load
loadData();
