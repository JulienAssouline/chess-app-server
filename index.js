const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

const PORT = 8080;

app.use(
  cors({
    origin: "https://stoic-spence-5f0ef9.netlify.com/",
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

      allGames.archives.forEach(d => {
        promises.push(axios.get(d));
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

app.listen(PORT, () =>
  console.log(`server listening on port http://localhost:${PORT}`)
);

module.exports = app;
