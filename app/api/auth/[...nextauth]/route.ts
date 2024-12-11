// import { handlers } from '@/auth';

// console.log('show me the handlers', handlers);

// export const { GET, POST } = handlers;


import { authOptions } from "@/auth"
import NextAuth from "next-auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }