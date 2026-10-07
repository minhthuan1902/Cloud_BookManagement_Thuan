const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    vatRate: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "books",
    autoCreate: false,
    autoIndex: false,
  }
);

module.exports = bookSchema;