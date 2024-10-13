import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import DiscordProvider from "next-auth/providers/discord";

import { db } from "@/lib//db";
import { fetchRedis } from "@/helpers/redis";

function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || clientId.length === 0) {
    throw new Error("Missing Google Client ID");
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing Google Client Secret");
  }

  return { clientId, clientSecret };
}
// function getFacebookCredentials() {
//   const clientId = process.env.FACEBOOK_CLIENT_ID;
//   const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

//   if (!clientId || clientId.length === 0) {
//     throw new Error("Missing Client ID");
//   }

//   if (!clientSecret || clientSecret.length === 0) {
//     throw new Error("Missing Client Secret");
//   }

//   return { clientId, clientSecret };
// }
// function getDiscordCredentials() {
//   const clientId = process.env.DISCORD_CLIENT_ID;
//   const clientSecret = process.env.DISCORD_CLIENT_SECRET;

//   if (!clientId || clientId.length === 0) {
//     throw new Error("Missing Client ID");
//   }

//   if (!clientSecret || clientSecret.length === 0) {
//     throw new Error("Missing Client Secret");
//   }

//   return { clientId, clientSecret };
// }

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
    // FacebookProvider({
    //   clientId: getFacebookCredentials().clientId,
    //   clientSecret: getFacebookCredentials().clientSecret,
    // }),
    // DiscordProvider({
    //   clientId: getDiscordCredentials().clientId,
    //   clientSecret: getDiscordCredentials().clientSecret,
    // }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const dbUserResult = (await fetchRedis("get", `user:${token.id}`)) as
        | string
        | null;

      // const timestamp = Date.now();

      if (!dbUserResult) {
        token.id = user!.id;
        // await db.zadd(`all-users`, {
        //   score: timestamp,
        //   member: JSON.stringify(token),
        // });
        return token;
      }

      const dbUser = JSON.parse(dbUserResult) as User;

      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        picture: dbUser.image,
      };
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      return session;
    },
    redirect() {
      return "/character-creation";
    },
  },
};
