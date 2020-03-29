const express = require("express");
const cors = require("cors");
const axios = require("axios");
const rateLimit = require("axios-rate-limit");

const app = express();

app.set("port", process.env.PORT || 8080);

app.use(express.static(__dirname + "/public"));

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(
  cors({
    origin: "https://stoic-spence-5f0ef9.netlify.com",
    credentials: true
  })
);

const getAllGameURLS = async () => {
  try {
    const url =
      "https://api.chess.com/pub/player/julienassouline/games/archives";
    const result = await axios(url);

    return result.data;
  } catch (error) {
    console.log(error);
  }
};

const getData = async () => {
  const allGames = await getAllGameURLS();

  try {
    if (allGames.archives.length !== 0) {
      const promises = [];

      const http = rateLimit(axios.create(), {
        maxRequests: 2,
        perMilliseconds: 1000,
        maxRPS: 2
      });
      http.getMaxRPS();

      allGames.archives.forEach(d => {
        promises.push(http.get(d));
      });

      const allData = await Promise.all(promises);

      const results = allData.map(d => d.data.games);
      return results;
    }
  } catch (error) {
    console.log(error);
  }
};

getData();

async function getAllGamesData(req, res) {
  const data = await getData();
  res.send(data);
}

app.get("/chess-games", (req, res) => {
  getAllGamesData(req, res);
});

app.listen(app.get("port"), () =>
  console.log(`server listening on port http://localhost:${app.get("port")}`)
);

module.exports = app;
