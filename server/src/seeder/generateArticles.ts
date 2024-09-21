import { faker } from '@faker-js/faker';
import db from '../models'; // Adjust the path to your db instance

// Function to generate fake articles
const generateFakeArticles = async (numArticles: number) => {
  try {
    // Get the list of users (assuming you have users in the DB)
    const users = await db.users.findAll();

    if (!users.length) {
      console.error('No users found. Please add some users first.');
      return;
    }

    // Get or create genres
    const genreNames = ['Bangladesh','International','Top','Today','Technology', 'Science', 'Politics', 'Sports', 'Entertainment', 'Health', 'Business', 'Travel'];
    const genres = await Promise.all(
      genreNames.map(name => db.genres.findOrCreate({ where: { name } }))
    );

    const articles = [];

    for (let i = 0; i < numArticles; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      const article = await db.articles.create({
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(10),
        thumbnail: faker.image.url(),
        published_at: faker.date.past(),
        author_id: randomUser.id,
      });

      // Assign 1 to 3 random genres to the article
      const numGenres = faker.number.int({ min: 1, max: 3 });
      const randomGenres = faker.helpers.arrayElements(genres, numGenres).map(genre => genre[0]); // [0] because findOrCreate returns [instance, created]
      await article.addGenres(randomGenres);

      articles.push(article);
    }

    console.log(`${numArticles} fake articles created successfully with genres!`);
  } catch (error) {
    console.error('Error creating fake articles:', error);
  }
};

// Call the function to generate 50 fake articles
generateFakeArticles(100000);