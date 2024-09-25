import { Op } from 'sequelize';
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

export const getRecommendedArticles = async (userIp: string, limit: number = 10) => {
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

  const genreIds = new Set(viewedGenres.flatMap((view: { Article: { Genres: any[]; }; }) => view.Article.Genres.map(genre => genre.id)));

  return Article.findAll({
    include: [
      {
        model: Genre,
        where: { id: { [Op.in]: Array.from(genreIds) } },
      },
      {
        model: ArticleView,
        attributes: ['views'],
      },
    ],
    order: [
      [ArticleView, 'views', 'DESC'],
      ['createdAt', 'DESC'],
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
      },
    ],
    order: [
      [ArticleView, 'views', 'DESC'],
      ['createdAt', 'DESC'],
    ],
    limit,
  });
};