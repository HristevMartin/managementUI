"use server";

import { cookies } from "next/headers";

export const getUserStateToHttpOnlyCookie = (initialUserState) => {
  const userStateString = cookies().get("user")?.value;
  console.log("userStateString", userStateString);
  return userStateString ? JSON.parse(userStateString) : null;
};

export const saveUserStateToHttpOnlyCookie = (initialUserState) => {
  const serializedUserState = JSON.stringify(initialUserState);
  console.log("serializedUsserState", serializedUserState);

  cookies().set({
    name: "user",
    value: serializedUserState,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });

  console.log("done setting cookie");
};
