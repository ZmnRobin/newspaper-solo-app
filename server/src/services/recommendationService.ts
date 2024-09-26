import { Op,Sequelize } from 'sequelize';
import db from "../models";

const Article = db.articles;
const Genre = db.genres;
const Visitor = db.visitors;
const ArticleView = db.articleViews;

export const trackArticleView = async (articleId: number, userIp: string) => {
  const [visitor] = await Visitor.findOrCreate({ where: { user_ip: userIp } });
  const [articleView, created] = await ArticleView.findOrCreate({
    where: { visitor_id: visitor.id, article_id: articleId },
    defaults: { views: 1, unique_views: 1 },
  });

  if (!created) {
    await articleView.update({
      views: articleView.views + 1,
    });
  }
};

export const getRecommendedArticles = async (userIp: string, limit: number, excludeArticleId?: number) => {
  const visitor = await Visitor.findOne({ where: { user_ip: userIp } });
  
  if (!visitor) {
    // If the visitor is new, return popular articles
    return getPopularArticles(limit);
  }

  const viewedGenres = await ArticleView.findAll({
    where: { visitor_id: visitor.id },
    include: [
      {
        model: Article,
        include: [Genre],
      },
    ],
    order: [['views', 'DESC']],
  });

  // Get all genre IDs that this user has interacted with
  const genreIds = new Set(viewedGenres.flatMap((view: { Article: { Genres: any[]; }; }) => view.Article.Genres.map(genre => genre.id)));

  // Fetch articles belonging to these genres with proper ordering, excluding the specified article
  return Article.findAll({
    where: {
      id: excludeArticleId ? { [Op.ne]: excludeArticleId } : { [Op.ne]: null }, // Exclude the article if provided
    },
    include: [
      {
        model: Genre,
        where: { id: { [Op.in]: Array.from(genreIds) } },
        required: true, // Ensure only articles with these genres are included
      },
    ],
    attributes: {
      include: [
        // Calculate the sum of views directly in the query
        [
          Sequelize.literal('(SELECT COALESCE(SUM(views), 0) FROM "ArticleViews" WHERE "ArticleViews"."article_id" = "Article"."id")'),
          'totalViews',
        ],
      ],
    },
    order: [
      [Sequelize.literal('"totalViews"'), 'DESC'], // Use double quotes for the alias here
      ['createdAt', 'DESC'], // Then order by creation date
    ],
    limit,
  });
};


export const getPopularArticles = async (limit: number = 10) => {
  return Article.findAll({
    include: [
      {
        model: ArticleView,
        attributes: ['views'],
        required: false,
      },
    ],
    attributes: {
      include: [
        [
          Sequelize.literal('(SELECT COALESCE(SUM("ArticleViews"."views"), 0) FROM "ArticleViews" WHERE "ArticleViews"."article_id" = "Article"."id")'),
          'totalViews',
        ],
      ],
    },
    order: [
      [Sequelize.literal('"totalViews"'), 'DESC'], // Order by total views in descending order
      ['createdAt', 'DESC'],                      // Order by creation date in descending order
    ],
    limit,
  });
};
