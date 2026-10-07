const { createSessionMiddleware } = require("./config/session");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { engine } = require("express-handlebars");

const { connectDatabases } = require("./config/database");
const personalization = require("./config/personalization");
const {
  getAllBooks,
  createBook,
} = require("./services/bookService");

const app = express();
app.set("trust proxy", 1);
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    helpers: {
      money(value) {
        return (
          new Intl.NumberFormat("vi-VN").format(Number(value)) +
          " đ"
        );
      },
    },
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));

app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(express.static(path.join(__dirname, "../public")));
app.use(createSessionMiddleware());
app.get("/session-test", (req, res, next) => {
  if (!req.session.createdAt) {
    req.session.createdAt = new Date().toISOString();
  }

  req.session.visits = (req.session.visits || 0) + 1;

  req.session.save((error) => {
    if (error) return next(error);

    res.set("Cache-Control", "no-store");

    res.json({
      fullName: personalization.fullName,
      mssv: personalization.mssv,
      visits: req.session.visits,
      createdAt: req.session.createdAt,
      serverProcess: process.pid,
      storage: "MongoDB Atlas",
    });
  });
});
// Thông tin dùng chung cho giao diện và footer.
app.use((req, res, next) => {
  Object.assign(res.locals, personalization);
  next();
});

app.get("/", (req, res) => {
  res.render("home", { title: "Trang chủ" });
});

app.get("/books/add", (req, res) => {
  res.render("books/add", {
    title: "Thêm sách",
    form: {},
  });
});

app.get("/books", async (req, res, next) => {
  try {
    const books = await getAllBooks();

    res.render("books/index", {
      title: "Danh sách sách",
      books,
      success: req.query.success === "1",
    });
  } catch (error) {
    next(error);
  }
});

app.post("/books", async (req, res, next) => {
  try {
    await createBook(req.body);
    res.redirect(303, "/books?success=1");
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).render("books/add", {
        title: "Thêm sách",
        error: error.message,
        form: {
          productCode: req.body.productCode,
          name: req.body.name,
          price: req.body.price,
        },
      });
    }

    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error("Lỗi xử lý yêu cầu:", error.name);
  res.status(500).type("text").send(
    "Không xử lý được yêu cầu. Kiểm tra kết nối và quyền database."
  );
});

async function startServer() {
  try {
    await connectDatabases();

    const port = Number(process.env.PORT || 3000);

    app.listen(port, "0.0.0.0", () => {
      console.log(`Web đang chạy tại http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Không khởi động được.");
    console.error("Loại lỗi:", error.name);
    console.error("Chi tiết:", error.message);

    await mongoose.disconnect();
    process.exitCode = 1;
  }
}

startServer();