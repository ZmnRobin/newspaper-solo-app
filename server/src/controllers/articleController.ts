import { Request, Response } from 'express';
import db from '../models';
import { Op } from 'sequelize';

const Article = db.articles;
const User = db.users;
const Genre=db.genres;

interface AuthRequest extends Request {
    user?: any;
}

export const getAllArticles = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Sort articles by newest first
    const articles = await Article.findAll({ include: [User], order: [['createdAt', 'DESC']] });
    return res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSingleArticle = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  try {
    // Include genres in the result
    const article = await Article.findByPk(id, {
      include: [User]
    });
    if (article) {
      return res.status(200).json(article);
    } else {
      return res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getArticlesByGenre = async (req: Request, res: Response): Promise<Response> => {
  const { genreId } = req.params;
  try {
    const articles = await Article.findAll({
      include: [
        {
          model: Genre,
          where: { id: genreId },
          through: { attributes: [] }, // Exclude genre attributes
        },
        {
          model: User,
          attributes: ['id', 'name'], // Include only necessary user attributes
        }
      ],
      order: [['createdAt', 'DESC']], // Optional: sort by newest first
    });

    if (articles.length > 0) {
      return res.status(200).json(articles);
    } else {
      return res.status(404).json([]);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getArticlesByAuthor = async (req: Request, res: Response): Promise<Response> => {
  const { authorId } = req.params;
  try {
    const articles = await Article.findAll({
      where: { author_id: authorId },
      include: [User],
      order: [['createdAt', 'DESC']], // Optional: sort by newest first
    });

    if (articles.length > 0) {
      return res.status(200).json(articles);
    } else {
      return res.status(404).json([]);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export const getRelatedArticles = async (req: Request, res: Response): Promise<Response> => {
  const { articleId } = req.params;
  const limit = 5; // Number of related articles to return

  try {
    // First, find the current article and its genres
    const currentArticle = await Article.findByPk(articleId, {
      include: [{ model: Genre }]
    });

    if (!currentArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Get the genre IDs of the current article
    const genreIds = currentArticle.Genres.map((genre: { id: any; }) => genre.id);

    // Find related articles
    const relatedArticles = await Article.findAll({
      include: [
        {
          model: Genre,
          where: { id: { [Op.in]: genreIds } },
          through: { attributes: [] },
        },
        {
          model: User,
          attributes: ['id', 'name'],
        }
      ],
      where: {
        id: { [Op.ne]: articleId } // Exclude the current article
      },
      order: [['createdAt', 'DESC']], // Sort by newest first
      limit: limit,
      distinct: true, // Ensure we get unique articles
    });

    return res.status(200).json(relatedArticles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createArticle = async (req: AuthRequest, res: Response): Promise<Response> => {
  const { title, content, genreIds } = req.body;
  const userId = req.user?.id;

  // Get the uploaded file (if it exists)
  const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;

  console.log('thumbnail', thumbnail, req.file);

  try {
    // Create the article in the database
    const newArticle = await Article.create({
      title,
      content,
      thumbnail, // Save the file path to the thumbnail field
      author_id: userId,
    });

    // If genreIds were provided, associate the article with genres
    if (genreIds && genreIds.length > 0) {
      const genres = await db.genres.findAll({
        where: { id: genreIds }
      });
      await newArticle.addGenres(genres); // Associate genres with the article
    }

    return res.status(201).json(newArticle);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// Delete article if user is the author
export const deleteArticle = async (req: AuthRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (article.author_id !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this article' });
    }

    await article.destroy();
    return res.status(204).json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
