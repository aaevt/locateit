import Link from "next/link";
import { ThemeProvider } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorMessage from "@/components/ErrorMessage";
import "./globals.css";

export default function Custom404() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <main className="flex-grow">
      <Header />
      <ErrorMessage
      errorCode="400"
      message="Oops! Something went wrong." />
      </main>
      <Footer />
    </div>
  );
}
