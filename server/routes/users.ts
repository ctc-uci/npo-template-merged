import { Router } from "express";

import { admin } from "../config/firebase";
import { db } from "../db/db-pgp"; // TODO: replace this db with

export const userRouter = Router();

// Get all users
userRouter.get("/", async (req, res) => {
  try {
    const user = await db.query(`SELECT * FROM users`);
    res.send({
      account: user.rows,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get a user by ID
userRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db.query("SELECT * FROM users WHERE user_id = $1", [
      userId,
    ]);
    res.send({
      user: user.rows[0],
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete a user by ID, both in Firebase and NPO DB
userRouter.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Firebase delete
    await admin.auth().deleteUser(userId);
    // DB delete
    await db.query("DELETE FROM users WHERE user_id = $1", [userId]);

    res.status(200).send(`Deleted user with ID: ${userId}`);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Create user
userRouter.post("/create", async (req, res) => {
  try {
    const { email, userId } = req.body;

    const newUser = await db.query(
      "INSERT INTO users (email, user_id) VALUES ($1, $2) RETURNING *",
      [email, userId]
    );

    res.status(200).send({
      newUser: newUser.rows[0],
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update a user by ID
userRouter.put("/update/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { email } = req.body;

    const user = await db.query(
      "UPDATE users SET email = $1 WHERE user_id = $2 RETURNING *",
      [email, userId]
    );

    res.send({
      user: user.rows[0],
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});
