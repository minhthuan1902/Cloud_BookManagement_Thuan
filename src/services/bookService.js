const { getBookModels } = require("../models/bookModels");
const {
  productPrefix,
  vatRate,
} = require("../config/personalization");

function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function getAllBooks() {
  const { ReadBook } = getBookModels();

  // Xem danh sách bằng tài khoản READ.
  return ReadBook.find().sort({ createdAt: -1 }).lean();
}

async function createBook(input) {
  const productCode =
    typeof input.productCode === "string"
      ? input.productCode.trim()
      : "";

  const name =
    typeof input.name === "string" ? input.name.trim() : "";

  const rawPrice =
    typeof input.price === "string" ? input.price.trim() : "";

  if (!productCode.startsWith(productPrefix)) {
    throw validationError(
      `Mã sách phải bắt đầu bằng ${productPrefix}.`
    );
  }

  if (!name) {
    throw validationError("Vui lòng nhập tên sách.");
  }

  const price = Number(rawPrice);

  if (!rawPrice || !Number.isFinite(price) || price < 0) {
    throw validationError("Giá sách phải là số không âm.");
  }

  // Tính giá sau thuế ở backend trước khi lưu.
  const finalPrice = Math.round(price * (1 + vatRate / 100));

  if (!Number.isSafeInteger(finalPrice)) {
    throw validationError("Giá sách vượt giới hạn cho phép.");
  }

  const { WriteBook } = getBookModels();

  // Thêm sách bằng tài khoản WRITE.
  return WriteBook.create({
    productCode,
    name,
    price,
    vatRate,
    finalPrice,
  });
}

module.exports = {
  getAllBooks,
  createBook,
};