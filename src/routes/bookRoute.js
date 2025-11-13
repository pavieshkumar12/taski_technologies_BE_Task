import express from "express";
import {
  createBook,
  getBooks,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";
import { celebrate, Joi, errors, Segments } from "celebrate";

const router = express.Router();

router.post(
  "/newBook",
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string().required(),
      genre: Joi.string().required(),
      publishedAt: Joi.string().required(),
      author: Joi.string().required(),
    }),
  }),
  createBook
);

router.get(
  "/getBooks",
  celebrate({
    [Segments.QUERY]: Joi.object()
      .keys({
        author: Joi.string().allow("").optional(),
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(50).optional(),
      })
  }),
  getBooks
);

router.put(
  "/editBook/:id",
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string().required(),
    }),
    [Segments.BODY]: Joi.object()
      .keys({
        title: Joi.string().allow("").optional(),
        genre: Joi.string().allow("").optional(),
        publishedAt: Joi.string().allow("").optional(),
        author: Joi.string().allow("").optional(),
      })
  }),
  updateBook
);

router.delete(
  "/removeBook/:id",
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string().required(),
    }),
  }),
  deleteBook
);

router.use(errors());

export default router;
