const mssv = (process.env.MSSV || "").trim();
const fullName = (process.env.FULL_NAME || "").trim();

if (!/\d{3}$/.test(mssv) || !fullName) {
  throw new Error("Cần cấu hình FULL_NAME và MSSV kết thúc bằng 3 chữ số.");
}

const productPrefix = mssv.slice(-3);

// Đề mới: VAT = chữ số cuối MSSV + 4.
const vatRate = Number(mssv.slice(-1)) + 4;

module.exports = {
  mssv,
  fullName,
  productPrefix,
  vatRate,
};