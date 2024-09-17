// Importing modules
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../models";

const User = db.users;

const signup = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { name, email, password } = req.body;

    const data = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
    };

    // Saving the user
    const user = await User.create(data);

    if (user) {
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: 1 * 24 * 60 * 60 * 1000,
        }
      );

      res.cookie("jwt", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      console.log("user", JSON.stringify(user, null, 2));
      console.log(token);

      // Send user details
      return res.status(201).send(user);
    } else {
      return res.status(409).send("Details are not correct");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

// Login authentication
const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Find a user by their email
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (user) {
      const isSame = await bcrypt.compare(password, user.password);

      if (isSame) {
        const token = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET as string,
          {
            expiresIn: 1 * 24 * 60 * 60 * 1000,
          }
        );

        // Still set the HTTP-only cookie for additional security
        res.cookie("jwt", token, {
          maxAge: 1 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });

        console.log("user", JSON.stringify(user, null, 2));
        console.log(token);

        // Send user data and token in the response
        return res.status(200).json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            // Add any other non-sensitive user data you want to include
          },
          token,
        });
      } else {
        return res.status(401).send("Authentication failed");
      }
    } else {
      return res.status(401).send("Authentication failed");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export default { signup, login };
