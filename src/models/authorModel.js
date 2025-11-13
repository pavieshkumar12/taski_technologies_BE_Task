import mongoose from "mongoose";

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  bio: { type: String, required: false, default: '' },
  dob: { type: String, required: true },
  profilePic: {type: String, required: false, default: ''}
});

const Author = mongoose.model("Author", authorSchema);
export default Author;
