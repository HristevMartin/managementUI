'use server';

import { getSession } from "@/auth"

export default async function isAuthenticated() {
    const session = await getSession()
    const user = session?.user?.id;
    
    return user;
};