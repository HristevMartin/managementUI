import Link from "next/link";
import Login from "../login/page";
import Register from "../register/page";

const WelcomeLogin = ({ params }: any) => {
  const lang = params.locale;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-center items-center min-h-screen">
        {/* Main Container */}
        <div className="w-full max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
              Welcome to <span style={{ color: '#463bcf' }}>TradePro</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-lg lg:max-w-2xl mx-auto px-4">
              Join our platform to showcase your skills and connect with clients
            </p>
          </div>

          {/* Login/Register Container */}
          <div className="flex flex-col lg:flex-row justify-center items-start gap-6 sm:gap-8 lg:gap-12">
            {/* Login Section */}
            <div className="w-full lg:flex-1 max-w-sm sm:max-w-md mx-auto">
              <div className="text-center mb-4 sm:mb-6">
                <h2 style={{ color: '#463bcf' }} className="text-lg sm:text-xl lg:text-2xl font-bold">
                  Already have an account?
                </h2>
                <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base">
                  Sign in to access your dashboard
                </p>
              </div>
              <Login lang={lang} />
            </div>

            {/* Divider */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-px h-80 bg-gray-300"></div>
            </div>
            <div className="lg:hidden flex items-center justify-center w-full">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-3 text-gray-500 text-xs sm:text-sm font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Register Section */}
            <div className="w-full lg:flex-1 max-w-sm sm:max-w-md mx-auto">
              <div className="text-center mb-4 sm:mb-6">
                <h2 style={{ color: '#463bcf' }} className="text-lg sm:text-xl lg:text-2xl font-bold">
                  Want to create an account?
                </h2>
                <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base">
                  Start your journey with us today
                </p>
              </div>
              <Register lang={lang} />
            </div>
          </div>

          {/* Footer Section */}
          <div className="text-center mt-8 sm:mt-12 lg:mt-16">
            <p className="text-xs sm:text-sm text-gray-500 px-4">
              By continuing, you agree to our{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeLogin;