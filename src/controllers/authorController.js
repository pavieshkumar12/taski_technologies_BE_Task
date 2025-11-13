import Author from "../models/authorModel.js";

export const createAuthor = async (req, res,next) => {
  try {
    const { name, bio = "", dob } = req.body;

    if (!dob || typeof dob !== "string") {
      return res.status(400).json({ error: "Date of birth is required in YYYY-MM-DD format" });
    }

    const normalizedDob = dob.split("T")[0];
    const isValidDobFormat = /^\d{4}-\d{2}-\d{2}$/.test(normalizedDob);

    if (!isValidDobFormat) {
      return res.status(400).json({ error: "Date of birth must be in YYYY-MM-DD format" });
    }

    const existing = await Author.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ error: "Author name already exists" });
    }

    const profilePic = req.file?.path || "";

    const author = await Author.create({
      name: name.trim(),
      bio,
      dob: normalizedDob,
      profilePic,
    });

    res.status(201).json(author);
  } catch (err) {
    res.status(400).json({ error: err.message });
    next(err)
  }
};


export const getAuthors = async (req, res,next) => {
  try {
    const { search } = req.query;

    const filter = {};
    if (search && typeof search === "string" && search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    const authors = await Author.find(filter);
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: err.message });
    next(err)
  }
};
