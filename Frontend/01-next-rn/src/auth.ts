import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { InactiveAccountError, InvalidEmailPasswordError } from "./utils/errors"
import { sendRequest } from "./utils/api"
import { IUser } from "./types/next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const res = await sendRequest<IBackendRes<ILogin>>({
            method: "POST",
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`,
            body: {
              username: credentials?.username,
              password: credentials?.password
            }
          })

          if (res?.data) {
            return {
              id: res.data?.user?._id,
              _id: res.data?.user?._id,
              name: res.data?.user?.name,
              email: res.data?.user?.email,
              access_token: res.data?.access_token,
              emailVerified: true
            };
          }
          
          if (res?.statusCode === 401) {
            throw new InvalidEmailPasswordError()
          }
          
          if (res?.statusCode === 400) {
            throw new InactiveAccountError()
          }
          
          throw new Error(res?.message || "Internal server error")
        } catch (error: any) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user = user as IUser;
      }
      return token
    },
    session({ session, token }) {
      session.user = token.user as IUser;
      return session
    },
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, 
      //otherwise redirect to login page
      return !!auth
    },
  },
})