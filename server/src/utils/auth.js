import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";
console.log(process.env.TRUSTED_ORIGINS);
const trustedOrigins = process.env.TRUSTED_ORIGINS.split(",");

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
  trustedOrigins: trustedOrigins,

  session: { cookie: true },

});
