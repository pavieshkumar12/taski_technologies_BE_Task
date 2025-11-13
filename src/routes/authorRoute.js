import express from "express";
import { createAuthor, getAuthors } from "../controllers/authorController.js";
import { celebrate, Joi, errors, Segments } from "celebrate";
import { upload }  from "../helper/multer.js";
const router = express.Router();

router.post(
  "/newAuthor",
  upload.single("profilePic"),
celebrate({
  [Segments.BODY]: Joi.object().keys({
    name:Joi.string().required(),
    bio: Joi.string().optional(),
    dob: Joi.string().required(),
    profilePic: Joi.string().allow("").optional(),
  }),
}),
 createAuthor);

router.get("/authors",
celebrate({
  [Segments.QUERY]: Joi.object().keys({
    search: Joi.string().allow("").optional(),
  }),
}), getAuthors);

router.use(errors())

export default router;
