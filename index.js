import dotenv from "dotenv";
import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const PORT = 5050;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book",
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

db.connect();

app.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM book ORDER BY rating DESC");

  const book = result.rows;

  res.render("index.ejs", {
    books: book,
    bookCount: book.length,
  });
});

app.post("/new", async (req, res) => {
  const title = req.body.newTitle;
  const image = req.body.newImage;
  const description = req.body.newDescription;
  const rating = req.body.newRating;

  try {
    await db.query(
      "INSERT INTO book (title, image, description, rating) VALUES ($1, $2, $3, $4)",
      [title, image, description, rating],
    );
    res.redirect("/");
  } catch (error) {
    console.log("Something went wrong: \n", error);
  }
});

app.post("/edit", async (req, res) => {
  const id = req.body.updatedItemId;
  const title = req.body.updatedItemTitle;
  const rating = req.body.updatedItemRating;
  const image = req.body.updatedItemImage;
  const description = req.body.updatedItemDescription;

  try {
    await db.query(
      "UPDATE book SET title = $1, rating = $2, image = $3, description = $4 WHERE id = $5",
      [title, rating, image, description, id],
    );
    res.redirect("/");
  } catch (error) {
    console.log("Something went wrong: \n", error);
    res.status(500).send("Database update failed.");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
