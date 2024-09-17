import { Request, Response } from 'express';
import db from '../models';

const Comment = db.comments;
const Article = db.articles;
const User = db.users;

interface AuthRequest extends Request {
    user?: any;
}

// Create a new comment (JWT protected)
export const createComment = async (req: AuthRequest, res: Response): Promise<Response> => {
  const { articleId } = req.params;
  const { content } = req.body;
  const userId = req.user.id; // Extract user id from JWT middleware

  try {
    // Find the article by its ID
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Create a new comment
    const newComment = await Comment.create({
      content,
      user_id: userId,
      article_id: articleId,
    });

    return res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all comments for a specific article
export const getCommentsByArticle = async (req: Request, res: Response): Promise<Response> => {
  const { articleId } = req.params;

  try {
    // Find all comments related to the article
    const comments = await Comment.findAll({
      where: { article_id: articleId },
      include: [{
        model: User,
        attributes: ['name', 'email'],
      }], // Optionally include user data
    });

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
