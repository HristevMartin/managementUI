import { useTranslations } from "next-intl";
import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { getTranslations } from "next-intl/server";

const Home = async () => {
  const session = await getServerSession(authOptions);
  // let session = '';
  const userId = session?.user?.id;
  console.log('userId!?!?!', userId)

  const t = await getTranslations("Homepage");
  console.log('show me the translations', t("title"))

  if (userId) {
    redirect('/en/backoffice/management')
  } else {
    redirect('/en/backoffice/login')
  }
};

export default Home;

