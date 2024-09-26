// articleController.ts
import { Request, Response } from 'express';
import db from '../models';
import { Op } from 'sequelize';
import elasticClient from '../config/elasticsearch';
import { emitArticleIndexed } from '..';
import { getRecommendedArticles, trackArticleView } from '../services/recommendationService';

const Article = db.articles;
const User = db.users;
const Genre = db.genres;

interface AuthRequest extends Request {
    user?: any;
}

// Helper function to index an article in Elasticsearch
async function indexArticleInElasticsearch(article: any, genreIds: number[]) {
  try {
    await elasticClient.index({
      index: 'articles',
      id: article.id.toString(),
      body: {
        title: article.title,
        content: article.content,
        author_id: article.author_id,
        thumbnail: article.thumbnail,
        genres: genreIds || [],
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      },
    });
    console.log(`Article ${article.id} indexed in Elasticsearch`);

    // Emit the article indexed event
    emitArticleIndexed(article);

  } catch (error) {
    console.error(`Failed to index article ${article.id} in Elasticsearch:`, error);
  }
}

export const getArticles = async (req: Request, res: Response): Promise<Response> => {
  const { page = 1, limit = 10, genreId, authorId, query, articleId } = req.query;
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const offset = (pageNumber - 1) * limitNumber;

  try {
    const esQuery: any = {
      index: 'articles',
      from: offset,
      size: limitNumber,
      // track_total_hits: true,
      body: {
        sort: [
          {
            createdAt: {
              order: 'desc', // Sort by recency (latest articles first)
            },
          },
        ],
        query: {
          bool: {
            must: [],
          },
        },
      },
    };

    // Handle search query
    if (query) {
      esQuery.body.query.bool.must.push({
        multi_match: {
          query: query,
          fields: ['title', 'content'],
        },
      });
    }

    // Handle author filter
    if (authorId) {
      esQuery.body.query.bool.must.push({
        term: { author_id: authorId },
      });
    }

    // Handle genre filter
    if (genreId) {
      esQuery.body.query.bool.must.push({ term: { genres: parseInt(genreId as string, 10) } });
    }

    // Handle related articles filter
    if (articleId) {
      esQuery.body.query.bool.must.push({
        bool: {
          must_not: {
            term: { _id: articleId },
          },
        },
      });

      // Retrieve the genres of the current article to find related articles
      const currentArticle = await Article.findByPk(articleId, {
        include: [{ model: Genre }],
      });

      if (currentArticle) {
        const genreIds = currentArticle.Genres.map((genre: { id: any }) => genre.id);
        esQuery.body.query.bool.must.push({
          terms: { genres: genreIds },
        });
      }
    }

    // Perform the search query in Elasticsearch
    const esResult = await elasticClient.search(esQuery);

    // Extract article IDs from Elasticsearch results
    const articleIds = esResult.hits.hits.map((hit: any) => hit._id);

    // Safely access the total hits value
    const totalHits = esResult.hits.total ? (typeof esResult.hits.total === 'number' ? esResult.hits.total : esResult.hits.total.value) : 0;

    // Fetch articles from the database to include associations like User and Genre
    const { count, rows: articles } = await Article.findAndCountAll({
      where: {
        id: articleIds,
      },
      include: [
        { model: User, attributes: ['id', 'name'] },
        Genre,
      ],
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    const totalPages = Math.ceil(totalHits / limitNumber);

    return res.status(200).json({
      articles,
      currentPage: pageNumber,
      totalPages,
      totalItems: totalHits,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSingleArticle = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const userIp = req.ip;
  try {
    // Fetch article from Elasticsearch
    const esResult = await elasticClient.get({
      index: 'articles',
      id: id,
    });

    if (esResult.found) {
      const articleData = esResult._source;

      // Fetch related user and genre details from the database
      const article = await Article.findByPk(id, {
        include: [{ model: User, attributes: ['id', 'name'] }, Genre],
      });

      await trackArticleView(article.id, userIp || '');

      return res.status(200).json(article);
    } else {
      return res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRecommendations = async (req: Request, res: Response): Promise<Response> => {
  const userIp = req.ip;
  const { limit , articleId } = req.query;

  try {
    const recommendedArticles = await getRecommendedArticles(userIp||'', Number(limit), articleId ? Number(articleId) : undefined);
    return res.status(200).json(recommendedArticles);
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
    // Create the article in the database
    const newArticle = await Article.create({ title, content, thumbnail, author_id: userId });

    // Add genres to the article
    if (genreIds && genreIds.length > 0) {
      const genres = await db.genres.findAll({ where: { id: genreIds } });
      await newArticle.addGenres(genres);
    }

    // Index the new article in Elasticsearch (non-blocking)
    indexArticleInElasticsearch(newArticle, genreIds);

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

    // Update the article in Elasticsearch (non-blocking)
    indexArticleInElasticsearch(article, genreIds);

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

    // Delete the article from Elasticsearch (non-blocking)
    try {
      await elasticClient.delete({
        index: 'articles',
        id: id.toString(),
      });
    } catch (error) {
      console.error(`Failed to delete article ${id} from Elasticsearch:`, error);
      // We don't throw the error here, as the article has already been deleted from the database
    }

    return res.status(204).json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
