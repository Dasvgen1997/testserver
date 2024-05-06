import { connectToDatabase } from "./db";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
const cors = require("cors");
import { OrderItem, Op } from "sequelize";

// Models
import { Post } from "./models/Post";

// Interfaces
import { Post as PostInterface } from "./interfaces/Post.interface";

async function initializeDB() {
  await connectToDatabase();
  await Post.sync(); // Синхронизация модели
}

initializeDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get("/posts", (req: Request, res: Response) => {
  let query = req.query;

  const offset = query._start ? +query._start : 0;
  const limit = query._limit ? +query._limit : 10;
  const sort = query._sort ? query._sort.toString() : "";

  interface QueryOptions {
    offset?: number;
    limit?: number;
    order?: OrderItem[];
  }

  let q: QueryOptions = {
    offset,
    limit,
    order: [["createdAt", "DESC"]],
  };

  if (sort) {
    let sortArr = sort.split("_");
    if (sortArr.length == 2) {
      q.order = [[sortArr[0], sortArr[1]]];
    }
  }

  Post.findAll(q)
    .then((posts) => {
      res.json(posts);
    })
    .catch(() => {
      res.status(400).json({ error: "Ошибка сервера!" });
    });
});

app.get("/posts/search", (req: Request, res: Response) => {
  let query = req.query;

  let title = query.title || "";
  let body = query.body || "";

  let orQuery = [];

  if (title) {
    orQuery.push({
      title: {
        [Op.iLike]: `%${title}%`,
      },
    });
  }
  if (body) {
    orQuery.push({
      body: {
        [Op.iLike]: `%${body}%`,
      },
    });
  }

  Post.findAll({
    where: {
      [Op.or]: orQuery,
    },
  })
    .then((posts) => {
      res.json(posts);
    })
    .catch(() => {
      res.status(400).json({ error: "Ошибка сервера!" });
    });
});

app.post("/posts", async (req: Request, res: Response) => {
  const body: PostInterface = req.body;

  if (!body.title || !body.body) {
    return res.status(400).json({ error: "Недостаточно данных" });
  }

  const newPost = await Post.create({
    title: body.title,
    body: body.body,
  });

  res.json(newPost);
});

app.put("/posts/:id", async (req: Request, res: Response) => {
  const id = +req.params.id;
  const body: PostInterface = req.body;

  let post = await Post.findByPk(id);

  if (!post) {
    return res.status(400).json({ error: "Нет такого поста!" });
  }

  await post.update(body);

  post = await Post.findByPk(id);

  res.json(post);
});

app.delete("/posts/:id", async (req: Request, res: Response) => {
  const id = +req.params.id;
  await Post.destroy({
    where: {
      id: id,
    },
  });
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
