import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema, }),
  emailAndPassword: { enabled: true },
});

