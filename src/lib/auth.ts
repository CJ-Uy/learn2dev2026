import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { username } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema, }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      firstname: {
        type: "string",
        required: true,
        input: true,
      },
      lastname: {
        type: "string",
        required: true,
        input: true,
      }
    }
  },
  plugins: [username()],
});

