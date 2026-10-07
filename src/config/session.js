const session = require("express-session");
const { MongoStore } = require("connect-mongo");

function createSessionMiddleware() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("Thiếu biến môi trường: SESSION_SECRET");
  }

  const store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: process.env.DB_NAME,
    collectionName: "sessions",

    mongoOptions: {
      authSource: "admin",
      auth: {
        username: process.env.MONGODB_WRITE_USER,
        password: process.env.MONGODB_WRITE_PASSWORD,
      },
      serverSelectionTimeoutMS: 15000,
    },

    ttl: 24 * 60 * 60,
    autoRemove: "native",
  });

  store.on("error", (error) => {
    console.error("Lỗi lưu session:", error.message);
  });

  return session({
    name: "book.sid",
    secret: process.env.SESSION_SECRET,
    store,
    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  });
}

module.exports = { createSessionMiddleware };