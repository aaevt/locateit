import Link from "next/link";

interface ErrorComponentProps {
  errorCode: string;
  message: string;
}

const ErrorComponent = ({ errorCode, message }: ErrorComponentProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-black text-center">
      <h1 className="text-6xl font-bold text-red-500">{errorCode}</h1>
      <p className="text-xl text-gray-700 dark:text-gray-300">{message}</p>
      <Link
        href="/"
        className="bg-black text-white dark:bg-white dark:text-black px-5 py-2 rounded-md text-base font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition mt-4"
      >
        Go back home
      </Link>
    </div>
  );
};

export default ErrorComponent;
