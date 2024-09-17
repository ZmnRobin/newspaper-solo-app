import express from 'express';
import { createArticle, getAllArticles, getSingleArticle,deleteArticle, getArticlesByGenre,getRelatedArticles } from '../controllers/articleController';
import verifyToken from '../middlewares/authMiddleware';  
import { createComment, getCommentsByArticle } from '../controllers/commentController';

const router = express.Router();

// Get all articles
router.get('/', getAllArticles);

// Get a single article by ID
router.get('/:id', getSingleArticle);

// Create a new article (protected route)
router.post('/', verifyToken, createArticle);

// Delete an article (protected route)
router.delete('/:id', verifyToken, deleteArticle);

// Get article based on genre
router.get('/genre/:genreId', getArticlesByGenre);

// Get related articles
router.get('/:articleId/related', getRelatedArticles);

// Create a new comment (protected route)
router.post('/:articleId/comments', verifyToken, createComment);

// Get all comments for a specific article
router.get('/:articleId/comments', getCommentsByArticle);


export default router;
