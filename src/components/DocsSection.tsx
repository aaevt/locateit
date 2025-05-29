import Link from "next/link";
import { BookOpenIcon } from "lucide-react";

const DocumentationInfo = () => {
  return (
    <div className="w-full  mx-auto bg-white dark:bg-gray-900 shadow-md rounded-xl p-8 mt-16 text-center">
      <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-4">
        Хочешь узнать больше?
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
        Документация поможет разобраться в редакторе и нахождении путей.
      </p>
      <Link
        href="/docs"
        className="inline-flex items-center px-6 py-3 rounded-lg 0 bg-black text-white dark:bg-white text-white hover:bg-gray-800 dark:hover:bg-gray-200 transition"
      >
        <BookOpenIcon className="w-5 h-5 mr-2" />
        Перейти к документации
      </Link>
    </div>
  );
};

export default DocumentationInfo;
