import elasticClient from '../config/elasticsearch';

export const getRecommendedArticles = async (userIp: string, limit: number, excludeArticleId?: number) => {
  try {
    const recommendedArticles = await elasticClient.search({
      index: 'articles',
      body: {
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

    return recommendedArticles.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
      totalViews: hit._source.totalViewsLong || 0
    }));
  } catch (error) {
    console.error('Error getting recommended articles:', error);
    return [];
  }
};

export const getPopularArticles = async (limit: number = 10) => {
  try {
    const popularArticles = await elasticClient.search({
      index: 'articles',
      body: {
        size: limit,
        sort: [
          { totalViewsLong: { order: 'desc' } },
          { createdAt: { order: 'desc' } }
        ]
      }
    });

    return popularArticles.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
      totalViews: hit._source.totalViewsLong || 0
    }));
  } catch (error) {
    console.error('Error getting popular articles:', error);
    return [];
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