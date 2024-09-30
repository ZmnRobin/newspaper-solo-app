import elasticClient from '../config/elasticsearch';
import { User } from '../models/User';

interface RecommendedArticle {
  id: string;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
  } | null;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  totalViews: number;
}

export const getRecommendedArticles = async (
  userIp: string,
  limit: number,
  page: number,
  excludeArticleId?: number
): Promise<{ articles: RecommendedArticle[], total: number }> => {
  try {
    const from = (page - 1) * limit;
    const recommendedArticles = await elasticClient.search({
      index: 'articles',
      body: {
        from,
        size: limit,
        query: {
          bool: {
            must_not: [
              ...(excludeArticleId ? [{ term: { _id: excludeArticleId.toString() } }] : [])
            ]
          }
        },
        sort: [
          { totalViewsLong: { order: 'desc' } },
          { createdAt: { order: 'desc' } }
        ]
      }
    });

    const total = recommendedArticles.hits.total?.valueOf ?? 0;
    const articleHits = recommendedArticles.hits.hits;

    // Fetch author information for all articles at once
    const authorIds = [...new Set(articleHits.map((hit: any) => hit._source.author_id))];
    const authors = await User.findAll({
      where: { id: authorIds },
      attributes: ['id', 'name']
    });

    const authorsMap = new Map(authors.map(author => [author.id, author]));

    const articles: RecommendedArticle[] = articleHits.map((hit: any) => {
      const author = authorsMap.get(hit._source.author_id);
      return {
        id: hit._id,
        title: hit._source.title,
        content: hit._source.content,
        author: author ? {
          id: author.id,
          name: author.name,
        } : null,
        thumbnail: hit._source.thumbnail,
        createdAt: hit._source.createdAt,
        updatedAt: hit._source.updatedAt,
        totalViews: hit._source.totalViewsLong || 0
      };
    });

    return { articles, total: typeof recommendedArticles.hits.total?.valueOf === 'function' 
      ? Number(recommendedArticles.hits.total.valueOf()) 
      : Number(recommendedArticles.hits.total) ?? 0 };
  } catch (error) {
    console.error('Error getting recommended articles:', error);
    return { articles: [], total: 0 };
  }
};

export const getPopularArticles = async (limit: number = 10, page: number = 1) => {
  try {
    const from = (page - 1) * limit;
    const popularArticles = await elasticClient.search({
      index: 'articles',
      body: {
        from,
        size: limit,
        sort: [
          { totalViewsLong: { order: 'desc' } },
          { createdAt: { order: 'desc' } }
        ]
      }
    });

    const total = typeof popularArticles.hits.total?.valueOf === 'function' 
      ? popularArticles.hits.total.valueOf() 
      : popularArticles.hits.total ?? 0;
    const articleHits = popularArticles.hits.hits;

    // Fetch author information for all articles at once
    const authorIds = [...new Set(articleHits.map((hit: any) => hit._source.author_id))];
    const authors = await User.findAll({
      where: { id: authorIds },
      attributes: ['id', 'name']
    });

    const authorsMap = new Map(authors.map(author => [author.id, author]));

    const articles: RecommendedArticle[] = articleHits.map((hit: any) => {
      const author = authorsMap.get(hit._source.author_id);
      return {
        id: hit._id,
        title: hit._source.title,
        content: hit._source.content,
        author: author ? {
          id: author.id,
          name: author.name,
        } : null,
        thumbnail: hit._source.thumbnail,
        createdAt: hit._source.createdAt,
        updatedAt: hit._source.updatedAt,
        totalViews: hit._source.totalViewsLong || 0
      };
    });

    return { articles, total };
  } catch (error) {
    console.error('Error getting popular articles:', error);
    return { articles: [], total: 0 };
  }
};

export const trackArticleView = async (articleId: number, userIp: string) => {
  try {
    await elasticClient.update({
      index: 'articles',
      id: articleId.toString(),
      body: {
        script: {
          source: 'ctx._source.totalViewsLong = (ctx._source.totalViewsLong == null) ? 1 : ctx._source.totalViewsLong + 1',
          lang: 'painless'
        },
        upsert: { totalViewsLong: 1 }
      }
    });
    console.log(`Updated view count for article ${articleId}`);
  } catch (error) {
    console.error('Error tracking article view:', error);
  }
};