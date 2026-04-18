import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { username } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema, }),
  emailAndPassword: { 
    enabled: true, 
    sendResetPassword: async ({ user, url, token }) => {
      await resend.emails.send({
        from: "noreply@ripmcfc.com",
        to: user.email,
        subject: "Sit2Gether: Reset your password",
        html: `
          <p>Hello ${user.name ?? "there"},</p>
          <p>Click the link below to reset your password:</p>
          <p><a href="${url}">${url}</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
      })
    }
  },
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

