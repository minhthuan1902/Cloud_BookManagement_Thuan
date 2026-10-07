const bookSchema = require("./Book");
const { getConnections } = require("../config/database");

function getBookModels() {
  const { readConnection, writeConnection } = getConnections();

  const ReadBook =
    readConnection.models.Book ||
    readConnection.model("Book", bookSchema);

  const WriteBook =
    writeConnection.models.Book ||
    writeConnection.model("Book", bookSchema);

  return { ReadBook, WriteBook };
}

module.exports = { getBookModels };