"use client";
import { PathfinderApp } from "./components/PathfinderApp";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function PathfinderPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="flex-grow p-8">
        <PathfinderApp />
      </main>
      <Footer />
    </div>
  );
}
