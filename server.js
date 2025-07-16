import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
      query
    )}+starter+in:name&sort=stars&order=desc&per_page=3`;
    const response = await fetch(url);
    const json = await response.json();

    const results = json.items.map((repo) => ({
      name: repo.full_name,
      url: repo.html_url,
      stars: repo.stargazers_count,
    }));

    res.json({ results });
  } catch (e) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(port, () => {
  console.log(`Project Planner API running at http://localhost:${port}`);
});
