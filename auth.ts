import { AuthOptions, getServerSession } from "next-auth"
import NextAuth from 'next-auth';
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
      session.user.id = token.sub ? token.sub : undefined;
      session.user.role = token.role;

      session.user.customerTokenId = token.customerTokenId;

      return session;
    },

    redirect: async ({ url, baseUrl }) => {
      console.log('show me the baseUrl', baseUrl);
      console.log('show me the url', url);
      const redirectUrl = url.startsWith(baseUrl) ? url : `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
    
      console.log('show me the redirectUrl', redirectUrl);

      return redirectUrl;
    }
  },
  events: {
    async signIn({ user }) {
      console.log('signIn is being called');
    },

    signOut(user) {
      console.log('user:', user);
      console.log('signOut is being called');
    },
  },
  providers: [
    CredentialsProvider({
      credentials: {
        id: { label: "id", type: "id" },
        role: { label: "role", type: "role" },
      },
      async authorize(credentials) {
        let roles = credentials?.role.split(',');
        console.log('show me the credentials', credentials);
        return {
          id: credentials?.id,
          role: roles,
        };
      }

    }),
  ],
};

const { handlers, auth, signIn, signOut, update } = NextAuth(authOptions);

const getSession = () => getServerSession(authOptions)

// export { handlers, auth, signIn, signOut, update, authOptions, getSession }
export { handlers, auth, signIn, signOut, update, authOptions }