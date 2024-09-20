// articleRoute.ts
import express from "express";
import {
  createArticle,
  getAllArticles,
  getSingleArticle,
  deleteArticle,
  getArticlesByGenre,
  getRelatedArticles,
  getArticlesByAuthor,
  searchArticles,
  updateArticle,
} from "../controllers/articleController";
import verifyToken from "../middlewares/authMiddleware";
import {
  createComment,
  deleteComment,
  getCommentsByArticle,
  updateComment,
} from "../controllers/commentController";
import { Multer } from "multer";

export default function (upload: Multer) {
  const router = express.Router();

  // Ger articles based on search query
  router.get("/search", searchArticles);

  // Get all articles
  router.get("/", getAllArticles);

  // Get article based on author
  router.get("/author/:authorId", verifyToken, getArticlesByAuthor);

  // Get article based on genre
  router.get("/genre/:genreId", getArticlesByGenre);

  // Get a single article by ID
  router.get("/:id", getSingleArticle);

  // Create a new article (protected route) with single image upload
  router.post("/", verifyToken, upload.single("thumbnail"), createArticle);

  // Update an article (protected route) with single image upload
  router.put("/:id", verifyToken, upload.single("thumbnail"), updateArticle);

  // Delete an article (protected route)
  router.delete("/:id", verifyToken, deleteArticle);

  // Get related articles
  router.get("/:articleId/related", getRelatedArticles);

  // Create a new comment (protected route)
  router.post("/:articleId/comments", verifyToken, createComment);

  // Get all comments for a specific article
  router.get("/:articleId/comments", getCommentsByArticle);
  
  // Delete a comment by it's owner (protected route)
  router.delete("/:articleId/comments/:commentId", verifyToken, deleteComment);

  // Update a comment by it's owner (protected route)
  router.put("/:articleId/comments/:commentId", verifyToken, updateComment);

  return router;
}
