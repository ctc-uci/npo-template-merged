import { Router } from "express";

import { keysToCamel } from "../common/utils";
import { admin } from "../config/firebase";
import { db } from "../db/db-pgp"; // TODO: replace this db with

export const userRouter = Router();

// Get all users
userRouter.get("/", async (req, res) => {
  try {
    const users = await db.query(`SELECT * FROM users`);

    res.status(200).json(keysToCamel(users));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get a user by ID
userRouter.get("/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const user = await db.query("SELECT * FROM users WHERE firebase_uid = $1", [
      firebaseUid,
    ]);

    res.status(200).json(keysToCamel(user));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete a user by ID, both in Firebase and NPO DB
userRouter.delete("/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    // Firebase delete
    await admin.auth().deleteUser(firebaseUid);
    // DB delete
    const user = await db.query("DELETE FROM users WHERE firebase_uid = $1", [
      firebaseUid,
    ]);

    res.status(200).json(keysToCamel(user));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Create user
userRouter.post("/create", async (req, res) => {
  try {
    const { email, firebaseUid } = req.body;

    const user = await db.query(
      "INSERT INTO users (email, firebase_uid) VALUES ($1, $2) RETURNING *",
      [email, firebaseUid]
    );

    res.status(200).json(keysToCamel(user));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update a user by ID
userRouter.put("/update", async (req, res) => {
  try {
    const { email, firebaseUid } = req.body;

    const user = await db.query(
      "UPDATE users SET email = $1 WHERE firebase_uid = $2 RETURNING *",
      [email, firebaseUid]
    );

    res.status(200).json(keysToCamel(user));
  } catch (err) {
    res.status(400).send(err.message);
  }
});
