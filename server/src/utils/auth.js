import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";
import bcrypt from "bcrypt";

// const db = await createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
// });

export const auth = betterAuth({
    database: createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    }),
  emailAndPassword: { 
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 4,
 }, 
  trustedOrigins: ["http://localhost:5173", "http://localhost:5000"],

//   // Look up a user by email
//   async findUserByEmail(email) {
//     const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
//       email,
//     ]);
//     return rows[0] || null;
//   },

//   // Create a user with email + password
//   async createUser({ email, name, password }) {
//     const password_hash = await bcrypt.hash(password, 10);
//     const [result] = await db.query(
//       "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
//       [email, password_hash, name]
//     );
//     return { id: result.insertId, email, name };
//   },

//   // Validate password
//   async validatePassword({ user, password }) {
//     return bcrypt.compare(password, user.password);
//   },

  session: { cookie: true },

});
