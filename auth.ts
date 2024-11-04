import { AuthOptions, getServerSession } from "next-auth"
import CredentialsProvider from 'next-auth/providers/credentials';


const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user, session, trigger }) {
      if (user) {
        token.sub = user.id.toString();
        token.role = user.role;
      }

      if (trigger === 'update' && session?.user?.customerTokenId) {
        token.customerTokenId = session.user.customerTokenId;
      }

      return token;
    },
    session({ session, token }) {
      session.user ||= session.user || {};
      session.user.id = token.sub ? parseInt(token.sub, 10) : undefined;
      session.user.role = token.role;

      session.user.customerTokenId = token.customerTokenId;

      return session;
    },

    redirect: async ({ url, baseUrl }) => {
      return url;
    }
  },
  events: {
    async signIn({ user }) {
      console.log('signIn is being called');
    },

    // async signOut() {
    //   const cookieCartId = cookies().get('cartId')?.value;

    //   if (cookieCartId) {
    //     try {
    //       await unassignCartFromCustomer(cookieCartId);
    //     } catch (error) {
    //       // eslint-disable-next-line no-console
    //       console.error(error);
    //     }
    //   }
    // },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        id: { label: "id", type: "id" },
        role: { label: "role", type: "role" },
      },
      async authorize(credentials) {
        let roles = credentials?.role.split(',');

        return {
          id: credentials?.id,
          role: roles,
        };
      }

    }),
  ],
}

/**
 * Helper function to get the session on the server without having to import the authOptions object every single time
 * @returns The session object or null
 */
const getSession = () => getServerSession(authOptions)

export { authOptions, getSession }