import Link from "next/link";
import Login from "../login/page";
import Register from "../register/page";

const WelcomeLogin = ({ params }: any) => {
  const lang = params.locale;
  return (
    <div className="flex flex-col md:flex-row justify-center items-center h-screen w-screen p-8">
      <div className="flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-300 pb-6 md:pb-0 md:pr-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Already have an account?</h2>
        <Login lang={lang} />
      </div>
      <div className="flex flex-col items-center pt-6 md:pt-0 md:pl-12 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Want to create an account?</h2>
        <Register lang={lang} />
      </div>
    </div>
  )
}

export default WelcomeLogin;