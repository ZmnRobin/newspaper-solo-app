// articleController.ts
import { Request, Response } from 'express';
import db from '../models';
import { Op } from 'sequelize';
import elasticClient from '../config/elasticsearch';

const Article = db.articles;
const User = db.users;
const Genre = db.genres;

interface AuthRequest extends Request {
    user?: any;
}

// export const getArticles = async (req: Request, res: Response): Promise<Response> => {
//   const { page = 1, limit = 10, genreId, authorId, query, articleId } = req.query;
//   const pageNumber = parseInt(page as string, 10);
//   const limitNumber = parseInt(limit as string, 10);
//   const from = (pageNumber - 1) * limitNumber;

//   try {
//     // Use Elasticsearch for search queries
//     if (query) {
//       const response = await esClient.search({
//         index: 'articles',
//         body: {
//           from,
//           size: limitNumber,
//           query: {
//             multi_match: {
//               query: query as string,
//               fields: ['title', 'content', 'author.name', 'genres.name']
//             }
//           },
//           sort: [{ createdAt: 'desc' }]
//         }
//       });

//       const hits = response.hits.hits;
//       const total = response.hits.total ? response.hits.total.valueOf as unknown as number : 0;

//       const articles = hits.map((hit: any) => ({
//         id: hit._id,
//         ...hit._source
//       }));

//       return res.status(200).json({
//         articles,
//         currentPage: pageNumber,
//         totalPages: Math.ceil(total / limitNumber),
//         totalItems: total,
//       });
//     }

//     // For non-search queries, use the existing Sequelize logic
//     let whereClause: any = {};
//     let includeClause: any = [
//       { model: User, attributes: ['id', 'name'] },
//       Genre
//     ];

//     if (genreId) {
//       includeClause = [
//         {
//           model: Genre,
//           where: { id: genreId },
//           through: { attributes: [] },
//         },
//         {
//           model: User,
//           attributes: ['id', 'name'],
//         }
//       ];
//     }

//     if (authorId) {
//       whereClause.author_id = authorId;
//     }

//     if (articleId) {
//       whereClause.id = { [Op.ne]: articleId };
//       const currentArticle = await Article.findByPk(articleId, {
//         include: [{ model: Genre }]
//       });
//       if (!currentArticle) {
//         return res.status(404).json({ message: 'Article not found' });
//       }
//       const genreIds = currentArticle.Genres.map((genre: { id: any; }) => genre.id);
//       includeClause[0].where = { id: { [Op.in]: genreIds } };
//     }

//     const { count, rows: articles } = await Article.findAndCountAll({
//       where: whereClause,
//       include: includeClause,
//       order: [['createdAt', 'DESC']],
//       limit: limitNumber,
//       offset: from,
//       distinct: true,
//     });

//     const totalPages = Math.ceil(count / limitNumber);

//     return res.status(200).json({
//       articles,
//       currentPage: pageNumber,
//       totalPages,
//       totalItems: count,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const getArticles = async (req: Request, res: Response): Promise<Response> => {
//   const { page = 1, limit = 10, genreId, authorId, query, articleId } = req.query;
//   const pageNumber = parseInt(page as string, 10);
//   const limitNumber = parseInt(limit as string, 10);
//   const offset = (pageNumber - 1) * limitNumber;

//   try {
//     let whereClause: any = {};
//     let includeClause: any = [
//       { model: User, attributes: ['id', 'name'] },
//       Genre
//     ];

//     if (genreId) {
//       includeClause = [
//         {
//           model: Genre,
//           where: { id: genreId },
//           through: { attributes: [] },
//         },
//         {
//           model: User,
//           attributes: ['id', 'name'],
//         }
//       ];
//     }

//     if (authorId) {
//       whereClause.author_id = authorId;
//     }

//     if (query) {
//       whereClause[Op.or] = [
//         { title: { [Op.iLike]: `%${query}%` } },
//         { content: { [Op.iLike]: `%${query}%` } }
//       ];
//     }

//     if (articleId) {
//       whereClause.id = { [Op.ne]: articleId };
//       const currentArticle = await Article.findByPk(articleId, {
//         include: [{ model: Genre }]
//       });
//       if (!currentArticle) {
//         return res.status(404).json({ message: 'Article not found' });
//       }
//       const genreIds = currentArticle.Genres.map((genre: { id: any; }) => genre.id);
//       includeClause[0].where = { id: { [Op.in]: genreIds } };
//     }

//     const { count, rows: articles } = await Article.findAndCountAll({
//       where: whereClause,
//       include: includeClause,
//       order: [['createdAt', 'DESC']],
//       limit: limitNumber,
//       offset,
//       distinct: true,
//     });

//     const totalPages = Math.ceil(count / limitNumber);

//     return res.status(200).json({
//       articles,
//       currentPage: pageNumber,
//       totalPages,
//       totalItems: count,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };


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

    // Handle genre filter
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

    // Handle author filter
    if (authorId) {
      whereClause.author_id = authorId;
    }

    // Handle related articles based on genre when articleId is provided
    if (articleId) {
      whereClause.id = { [Op.ne]: articleId };
      const currentArticle = await Article.findByPk(articleId, {
        include: [{ model: Genre }]
      });
      if (!currentArticle) {
        return res.status(404).json({ message: 'Article not found' });
      }
      const genreIds = currentArticle.Genres.map((genre: { id: any }) => genre.id);
      includeClause[0].where = { id: { [Op.in]: genreIds } };
    }

    // Use Elasticsearch for search query
    if (query) {
      // Cast query to a string
      const searchQuery = query as string;

      // Perform the search on Elasticsearch
      const esResult = await elasticClient.search({
        index: 'articles',
        from: offset,
        size: limitNumber,
        body: {
          query:{
            multi_match: {
              query: searchQuery,
              fields: ['title', 'content'],
            },
          }
        },
      });

      // Extract article IDs from Elasticsearch results
      const articleIds = esResult.hits.hits.map((hit: any) => hit._id);

      // Fetch articles with Sequelize using the IDs retrieved from Elasticsearch
      const { count, rows: articles } = await Article.findAndCountAll({
        where: {
          ...whereClause,
          id: { [Op.in]: articleIds }, // Filter based on Elasticsearch results
        },
        include: includeClause,
        order: [['createdAt', 'DESC']],
        limit: limitNumber,
        offset,
        distinct: true,
      });

      // Handle the total from Elasticsearch results (handling both number and object cases)
      const totalHits = typeof esResult.hits.total === 'number' 
        ? esResult.hits.total 
        : esResult.hits.total?.value ?? 0;

      const totalPages = Math.ceil(totalHits / limitNumber);

      return res.status(200).json({
        articles,
        currentPage: pageNumber,
        totalPages,
        totalItems: totalHits,
      });
    }

    // Fallback to regular Sequelize if no search query is provided
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
    // Create the article in the database
    const newArticle = await Article.create({ title, content, thumbnail, author_id: userId });

    // Add genres to the article
    if (genreIds && genreIds.length > 0) {
      const genres = await db.genres.findAll({ where: { id: genreIds } });
      await newArticle.addGenres(genres);
    }

    // Index the new article in Elasticsearch
    await elasticClient.index({
      index: 'articles',
      id: newArticle.id.toString(),
      body: {
        title: newArticle.title,
        content: newArticle.content,
        author_id: newArticle.author_id,
        thumbnail: newArticle.thumbnail,
        genres: genreIds || [],
        createdAt: newArticle.createdAt,
        updatedAt: newArticle.updatedAt,
      },
    });

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

    // Update the article in Elasticsearch
    await elasticClient.update({
      index: 'articles',
      id: article.id.toString(),
      body: {
        doc: {
          title: article.title,
          content: article.content,
          author_id: article.author_id,
          thumbnail: article.thumbnail,
          genres: genreIds || [],
          updatedAt: article.updatedAt,
        },
      },
    });

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

    // Delete the article from Elasticsearch
    await elasticClient.delete({
      index: 'articles',
      id: id.toString(),
    });

    return res.status(204).json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
