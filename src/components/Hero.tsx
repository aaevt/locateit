"use client";

import Link from "next/link";
import { useTypingEffect } from "@/components/hooks/useTypingEffect";

export default function Hero() {
  const { word, cursor, isTyping } = useTypingEffect(
    ["class", "room", "fast", "free", "it"],
    {
      typingSpeed: 200,
      deletingSpeed: 200,
      pauseAfterType: 1000,
      pauseAfterDelete: 300,
      loop: false,
    },
  );

  return (
    <section className="text-center my-32 mx-4 sm:mx-8 md:mx-16 lg:mx-24">
      <h1 className="font-sans text-3xl tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl dark:text-white mb-6">
        locate{" "}
        <span className="text-black dark:text-white">
          <span className="typing-word relative inline-block after:absolute after:content-['|'] after:animate-blink after:ml-1 after:text-black dark:after:text-white">
            {word}
          </span>
        </span>
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 font-light">
        Конструктор карт в зданиях! 
      </p>
      <div className="flex justify-center space-x-6">
        <Link
          href="/constructor"
          className="animate-pulse bg-black text-white dark:bg-white dark:text-black px-5 py-2 rounded-md text-base font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition"
        >
          Начать
        </Link>
      </div>
    </section>
  );
}
