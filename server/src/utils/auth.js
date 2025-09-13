import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";


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
  trustedOrigins: ["http://localhost:5173", "http://localhost:5000", "https://prix-citations-rotary-mary.trycloudflare.com/"],

  session: { cookie: true },

});
