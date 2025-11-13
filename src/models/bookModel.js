import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  genre: { type: String,required: true },
  publishedAt: { type: String,required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Author", required: true },
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
