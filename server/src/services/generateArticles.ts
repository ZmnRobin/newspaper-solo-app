import { faker } from "@faker-js/faker";
import db from "../models";
import elasticClient from "../config/elasticsearch";

// Function to generate and index fake articles in batches
const generateAndIndexFakeArticles = async (
  numArticles: number,
  batchSize: number = 1000
) => {
  try {
    const users = await db.users.findAll();
    if (!users.length) {
      console.error("No users found. Please add some users first.");
      return;
    }

    const genreNames = [
      "Top", "Today", "Bangladesh", "International", "Technology",
      "Science", "Politics", "Sports", "Entertainment", "Health",
      "Business", "Recommended", "Lifestyle", "Education", "Environment",
      "Fashion", "Food",
    ];

    // Fetch or create genres from the database
    const genres = await Promise.all(
      genreNames.map(async (name) => {
        const [genre] = await db.genres.findOrCreate({ where: { name } });
        return genre;
      })
    );

    const totalBatches = Math.ceil(numArticles / batchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
      console.log(`Processing batch ${batch + 1} of ${totalBatches}...`);

      const articles = [];
      const newArticles = [];

      // Generate articles in the current batch
      for (
        let i = 0;
        i < batchSize && batch * batchSize + i < numArticles;
        i++
      ) {
        const randomUser = users[Math.floor(Math.random() * users.length)];

        const articleData = {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(10),
          thumbnail: faker.image.url(),
          author_id: randomUser.id,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        };

        newArticles.push(articleData);
      }

      // Bulk insert articles into the database
      const createdArticles = await db.articles.bulkCreate(newArticles, {
        returning: true,
      });

      for (const article of createdArticles) {
        // Assign 1 to 3 random genres to the article
        const numGenres = faker.number.int({ min: 1, max: 3 });
        const randomGenres = faker.helpers.arrayElements(genres, numGenres);
        await article.addGenres(randomGenres);

        // Add the genres information to the article object for indexing
        article.genres = randomGenres;

        articles.push(article);
      }

      // Index articles in Elasticsearch in a batch
      const bulkOperations = articles.flatMap((article) => [
        { index: { _index: "articles", _id: article.id.toString() } },
        {
          title: article.title,
          content: article.content,
          author_id: article.author_id,
          thumbnail: article.thumbnail,
          genres: article.genres.map((genre:any) => genre.id),
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
        },
      ]);

      await elasticClient.bulk({ refresh: true, body: bulkOperations });
      console.log(`Batch ${batch + 1} processed and indexed successfully.`);
    }

    console.log(
      `${numArticles} fake articles created and indexed successfully in Elasticsearch!`
    );
  } catch (error) {
    console.error("Error creating and indexing fake articles:", error);
  }
};

// Call the function to generate and index 1,000 fake articles in batches of 100
generateAndIndexFakeArticles(800000, 5000);