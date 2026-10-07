const mongoose = require("mongoose");

let readConnection;
let writeConnection;

async function connectDatabases() {
  const requiredVariables = [
    "MONGODB_URI",
    "DB_NAME",
    "MONGODB_READ_USER",
    "MONGODB_READ_PASSWORD",
    "MONGODB_WRITE_USER",
    "MONGODB_WRITE_PASSWORD",
  ];

  for (const name of requiredVariables) {
    if (!process.env[name]) {
      throw new Error(`Thiếu biến môi trường: ${name}`);
    }
  }

  const options = {
    dbName: process.env.DB_NAME,
    authSource: "admin",
    autoCreate: false,
    autoIndex: false,
    bufferCommands: false,
    serverSelectionTimeoutMS: 15000,
    maxPoolSize: 5,
  };

  // Kết nối bằng tài khoản chỉ đọc sách.
  readConnection = mongoose.createConnection(
    process.env.MONGODB_URI,
    {
      ...options,
      user: process.env.MONGODB_READ_USER,
      pass: process.env.MONGODB_READ_PASSWORD,
    }
  );

  // Kết nối bằng tài khoản chỉ thêm sách.
  writeConnection = mongoose.createConnection(
    process.env.MONGODB_URI,
    {
      ...options,
      user: process.env.MONGODB_WRITE_USER,
      pass: process.env.MONGODB_WRITE_PASSWORD,
    }
  );

  readConnection.on("error", () => {
    console.error("Kết nối READ gặp lỗi.");
  });

  writeConnection.on("error", () => {
    console.error("Kết nối WRITE gặp lỗi.");
  });

  await Promise.all([
    readConnection.asPromise(),
    writeConnection.asPromise(),
  ]);

  console.log("MongoDB READ đã kết nối.");
  console.log("MongoDB WRITE đã kết nối.");
}

function getConnections() {
  if (!readConnection || !writeConnection) {
    throw new Error("Database chưa được khởi tạo.");
  }

  return {
    readConnection,
    writeConnection,
  };
}

// Xuất đúng tên hàm để app.js sử dụng.
module.exports = {
  connectDatabases,
  getConnections,
};