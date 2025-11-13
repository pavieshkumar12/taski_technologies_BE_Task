import mongoose from "mongoose";
import Book from "../models/bookModel.js";
import Author from "../models/authorModel.js";

export const createBook = async (req, res, next) => {
	try {
		const { title, genre, publishedAt, author } = req.body;

		const existing = await Book.findOne({ title: title.trim() });
		if (existing) {
			return res.status(409).json({ error: "Book title already exists" });
		}

		const authorDoc = await Author.findById(author);
		if (!authorDoc) {
			return res.status(400).json({ error: "Invalid author id" });
		}

		const normalizedPublishedAt = publishedAt.split("T")[0];
		const isValidPublishedAt = /^\d{4}-\d{2}-\d{2}$/.test(normalizedPublishedAt);
	
		if (!isValidPublishedAt) {
		  return res.status(400).json({ error: "publishedAt must be in YYYY-MM-DD format" });
		}

		const book = await Book.create({
			title: title.trim(),
			genre: genre.trim(),
			publishedAt: normalizedPublishedAt,
			author: authorDoc._id,
		});

		const populated = await book.populate("author");
		res.status(201).json(populated);
	} catch (err) {
		res.status(400).json({ error: err.message });
		next(err);
	}
};

export const getBooks = async (req, res, next) => {  
	try {  
		const { title, author, page = 1, limit = 10 } = req.query;

		// Convert page and limit to integers
		const parsedPage = Number.parseInt(page, 10);
		const parsedLimit = Number.parseInt(limit, 10);

		// Ensure page is a valid positive number, otherwise default to 1
		const pageNumber = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
		// Ensure limit is a valid positive number, otherwise default to 10
		const limitNumber = Number.isFinite(parsedLimit) && parsedLimit >= 1 ? parsedLimit : 10;

		// Initialize an array to hold OR filter conditions for MongoDB
		const orConditions = [];

		// If title is provided and not empty, create a case-insensitive regex for searching
		const titleRegex = title && title.trim() !== "" ? new RegExp(title.trim(), "i") : null;
		// If titleRegex exists, add it as a filter condition
		if (titleRegex) {
			orConditions.push({ title: titleRegex });
		}

		// If author is provided and not empty, create a case-insensitive regex
		const authorRegex = author && author.trim() !== "" ? new RegExp(author.trim(), "i") : null;
		if (authorRegex) {
			// Find all authors whose names match the regex
			const matchingAuthors = await Author.find({ name: authorRegex }).select("_id");

			
			if (!matchingAuthors.length) {
				return res.json({
					data: [],
					pagination: {
						total: 0,
						page: pageNumber,
						limit: limitNumber,
						totalPages: 0,
					},
				});
			}

			// Add author filter (books written by matching authors)
			orConditions.push({
				author: { $in: matchingAuthors.map((a) => a._id) },
			});
		}

		// Combine all OR conditions into a MongoDB filter object
		const filters = orConditions.length ? { $or: orConditions } : {};

		// Count total number of books matching the filters
		const total = await Book.countDocuments(filters);
		// Find books matching the filters, populate author details, sort alphabetically by title,
		// and apply pagination (skip/limit)
		const books = await Book.find(filters)
			.populate("author")
			.sort({ title: 1 })
			.skip((pageNumber - 1) * limitNumber)
			.limit(limitNumber);

		// Calculate total pages (ceil division of total items by limit)
		const totalPages = total > 0 ? Math.ceil(total / limitNumber) : 0;

		// Send JSON response with books data and pagination details
		res.json({
			data: books,
			pagination: {
				total,
				page: pageNumber,
				limit: limitNumber,
				totalPages,
			},
		});
	} catch (err) {
		res.status(400).json({ error: err.message });
		next(err);
	}
};


export const updateBook = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { title, genre, publishedAt, author } = req.body;

		const update = {};

		if (title !== undefined) {
			const trimmed = title.trim();
			if (trimmed !== "") {
				const existing = await Book.findOne({ title: trimmed, _id: { $ne: id } });
				if (existing) {
					return res.status(409).json({ error: "Book title already exists" });
				}
				update.title = trimmed;
			} else {
				update.title = trimmed;
			}
		}

		if (genre !== undefined) {
			update.genre = typeof genre === "string" ? genre.trim() : genre;
		}

		if (publishedAt !== undefined && publishedAt !== "") {
			const normalizedPublishedAt = publishedAt.split("T")[0];
			const isValidPublishedAt = /^\d{4}-\d{2}-\d{2}$/.test(normalizedPublishedAt);
		
			if (!isValidPublishedAt) {
				return res.status(400).json({ error: "publishedAt must be in YYYY-MM-DD format" });
			}
			update.publishedAt = normalizedPublishedAt;
		}

		if (author !== undefined && author !== "") {
			const authorDoc = await Author.findById(author);
			if (!authorDoc) {
				return res.status(400).json({ error: "Invalid author id" });
			}
			update.author = authorDoc._id;
		}

		const updated = await Book.findByIdAndUpdate(id, update, {
			new: true,
			runValidators: true,
		}).populate("author");

		if (!updated) {
			return res.status(404).json({ error: "Book not found" });
		}

		res.json({ message: "Book updated successfully", data: updated });
	} catch (err) {
		res.status(400).json({ error: err.message });
		next(err);
	}
};

export const deleteBook = async (req, res, next) => {
	try {
		const { id } = req.params;
		const deleted = await Book.findByIdAndDelete(id);
		if (!deleted) {
			return res.status(404).json({ error: "Book not found" });
		}
		res.json({ message: "Book deleted successfully" });
	} catch (err) {
		res.status(400).json({ error: err.message });
		next(err);
	}
};


