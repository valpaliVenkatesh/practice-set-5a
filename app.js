const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

function sendDbToJsonResponse(movie) {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
}

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    ORDER BY
      movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
//API2
app.post("/movies/", async (request, response) => {
  try {
    const { directorId, movieName, leadActor } = request.body;
    const postMovieQuery = `
  INSERT INTO
    movie ( director_id, movie_name, lead_actor)
  VALUES
    (${directorId}, '${movieName}', '${leadActor}');`;
    await db.run(postMovieQuery);
    response.send("Movie Successfully Added");
  } catch (e) {
    console.log(`${e.message}`);
  }
});

//API3
app.get("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
    const movie = await db.get(getMovieQuery);
    response.send(sendDbToJsonResponse(movie));
  } catch (e) {
    console.log(`${e.message}`);
  }
});
module.exports = app;

//API4
