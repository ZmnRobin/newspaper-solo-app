// articleController.ts
import { Request, Response } from 'express';
import db from '../models';
import { Op } from 'sequelize';

const Article = db.articles;
const User = db.users;
const Genre = db.genres;

interface AuthRequest extends Request {
    user?: any;
}

export const getArticles = async (req: Request, res: Response): Promise<Response> => {
  const { page = 1, limit = 10, genreId, authorId, query, articleId } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const offset = (pageNumber - 1) * limitNumber;

  try {
    let whereClause: any = {};
    let includeClause: any = [
      { model: User, attributes: ['id', 'name'] },
      Genre
    ];

    if (genreId) {
      includeClause = [
        {
          model: Genre,
          where: { id: genreId },
          through: { attributes: [] },
        },
        {
          model: User,
          attributes: ['id', 'name'],
        }
      ];
    }

    if (authorId) {
      whereClause.author_id = authorId;
    }

    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } },
        { content: { [Op.iLike]: `%${query}%` } }
      ];
    }

    if (articleId) {
      whereClause.id = { [Op.ne]: articleId };
      const currentArticle = await Article.findByPk(articleId, {
        include: [{ model: Genre }]
      });
      if (!currentArticle) {
        return res.status(404).json({ message: 'Article not found' });
      }
      const genreIds = currentArticle.Genres.map((genre: { id: any; }) => genre.id);
      includeClause[0].where = { id: { [Op.in]: genreIds } };
    }

    const { count, rows: articles } = await Article.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [['createdAt', 'DESC']],
      limit: limitNumber,
      offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limitNumber);

    return res.status(200).json({
      articles,
      currentPage: pageNumber,
      totalPages,
      totalItems: count,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSingleArticle = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  try {
    const article = await Article.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'name'] }, Genre],
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

export const createArticle = async (req: AuthRequest, res: Response): Promise<Response> => {
  const { title, content, genreIds } = req.body;
  const userId = req.user?.id;
  const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const newArticle = await Article.create({ title, content, thumbnail, author_id: userId });

    if (genreIds && genreIds.length > 0) {
      const genres = await db.genres.findAll({ where: { id: genreIds } });
      await newArticle.addGenres(genres);
    }

    return res.status(201).json(newArticle);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateArticle = async (req: AuthRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { title, content, genreIds } = req.body;
  const userId = req.user?.id;
  const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const article = await Article.findByPk(id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (article.author_id !== userId)
      return res.status(403).json({ message: 'Unauthorized to update this article' });

    Object.assign(article, { title, content, thumbnail: thumbnail || article.thumbnail });
    await article.save();

    if (genreIds) {
      const genres = await db.genres.findAll({ where: { id: genreIds } });
      await article.setGenres(genres);
    }

    return res.status(200).json(article);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response): Promise<Response> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const article = await Article.findByPk(id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (article.author_id !== userId)
      return res.status(403).json({ message: 'Unauthorized to delete this article' });

    await article.destroy();
    return res.status(204).json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
