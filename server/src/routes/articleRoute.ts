// articleRoute.ts
import express from 'express';
import { createArticle, getAllArticles, getSingleArticle, deleteArticle, getArticlesByGenre, getRelatedArticles,getArticlesByAuthor } from '../controllers/articleController';
import verifyToken from '../middlewares/authMiddleware';  
import { createComment, getCommentsByArticle } from '../controllers/commentController';
import { Multer } from 'multer';

export default function(upload: Multer) {
  const router = express.Router();

  // Get all articles
  router.get('/', getAllArticles);

  // Get a single article by ID
  router.get('/:id', getSingleArticle);

  // Create a new article (protected route) with single image upload
  router.post("/", verifyToken, upload.single('thumbnail'), createArticle);

  // Delete an article (protected route)
  router.delete('/:id', verifyToken, deleteArticle);

  // Get article based on author
  router.get('/author/:authorId',verifyToken,getArticlesByAuthor);

  // Get article based on genre
  router.get('/genre/:genreId', getArticlesByGenre);

  // Get related articles
  router.get('/:articleId/related', getRelatedArticles);

  // Create a new comment (protected route)
  router.post('/:articleId/comments', verifyToken, createComment);

  // Get all comments for a specific article
  router.get('/:articleId/comments', getCommentsByArticle);

  return router;
}