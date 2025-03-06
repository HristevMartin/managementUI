import Link from "next/link";
import Login from "../login/page";
import Register from "../register/page";

const WelcomeLogin = ({ params }: any) => {
    const lang = params.locale;
    return (
        <div className="flex flex-col md:flex-row justify-center items-center h-screen w-screen p-4">
            <div className="flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-300 pb-5 md:pb-0 md:pr-10">
                <h2 className="text-lg md:text-xl font-bold mb-4">Already have an account?</h2>
                <Login lang={lang} />
                <Link href="/forgot-password" className="mt-2 text-blue-500 hover:underline">Forgotten your password?</Link>
                <label className="mt-2 flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Remember me
                </label>
            </div>
            <div className="flex flex-col items-center pt-5 md:pt-0 md:pl-10 mb-5">
                <h2 className="text-lg md:text-xl font-bold mb-4">Want to create an account?</h2>
                <Register lang={lang} />
            </div>
        </div>
    )
}

export default WelcomeLogin;