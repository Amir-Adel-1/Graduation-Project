const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// Health check
app.get("/", (req, res) => {
  res.send("Proxy is running ✅");
});

// =======================
// /api/search?q=...
// =======================
app.get("/api/search", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) {
      return res.status(400).json({ error: "missing_query", message: "q is required" });
    }

    // API الجديد - ندعم name و q احتياطياً
    const url =
      `https://yassa-hany.com/api/MD/search.php?` +
      `name=${encodeURIComponent(q)}&q=${encodeURIComponent(q)}`;

    console.log("SEARCH Fetching:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("SEARCH API Error:", response.status, text.substring(0, 200));
      return res.status(response.status).send(text);
    }

    // يرجّع JSON لو أمكن
    try {
      return res.json(JSON.parse(text));
    } catch (_) {
      return res.send(text);
    }
  } catch (e) {
    console.error("SEARCH Proxy Error:", e);
    return res.status(500).json({ error: "proxy_error", message: e.message });
  }
});

// =======================
// /api/info?id=...
// =======================
app.get("/api/info", async (req, res) => {
  try {
    const id = (req.query.id || "").toString().trim();
    if (!id) {
      return res.status(400).json({ error: "missing_id", message: "id is required" });
    }

    const url = `https://yassa-hany.com/api/MD/info.php?id=${encodeURIComponent(id)}`;

    console.log("INFO Fetching:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("INFO API Error:", response.status, text.substring(0, 200));
      return res.status(response.status).send(text);
    }

    // يرجّع JSON لو أمكن
    try {
      return res.json(JSON.parse(text));
    } catch (_) {
      return res.send(text);
    }
  } catch (e) {
    console.error("INFO Proxy Error:", e);
    return res.status(500).json({ error: "proxy_error", message: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Test search: http://localhost:${PORT}/api/search?q=panadol`);
  console.log(
    `Test info: http://localhost:${PORT}/api/info?id=polyfresh-advanced-eye-drops-10-ml-1699979546-1718462410`
  );
});
