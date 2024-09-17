import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import db from "./models";
import userRoutes from "./routes/userRoute";
import articleRoutes from "./routes/articleRoute";
import genreRoute from "./routes/genreRoute";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hey there! Server is up and running now." });
});

//synchronizing the database and forcing it to false so we dont lose data
db.sequelize.sync({ force: false }).then(() => {
  console.log("db has been re sync")
})

//routes for the user API
app.use('/api/users', userRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/genres', genreRoute)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});