import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const Home = async ({ params }: any) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // const t = await getTranslations("Homepage");
  const lang = params.locale;

  if (userId) {
    redirect(`/${lang}/backoffice/management`)
  } else {
    redirect(`/${lang}/backoffice/login`)
  }
};

export default Home;