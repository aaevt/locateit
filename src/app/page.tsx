import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import Image from "next/image";
import Features from "@/components/Features";
import Accordion from "@/components/Accordion";
import DocumentationInfo from "@/components/DocsSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Section
          leftHalf={
            <>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
                Интерактивные планы помещений
              </h2>
              <p className="text-xl font-light text-gray-700 dark:text-gray-300">
                Редактор на основе <strong>Fabric.js</strong> и <strong>Zustand</strong> позволяет создавать простые планы зданий. 
                Поддерживает одновременное изменение нескольких этажей с сохранением в <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">canvas.toJSON()</code>.
              </p>
            </>
          }
          rightHalf={
            <Image
              src="/ui-image.png"
              alt="Конструктор"
              width={500}
              height={300}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          }
        />
        <Section
          leftHalf={
            <Image
              src="/plan-image.png"
              alt="План помещения"
              width={500}
              height={300}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          }
          rightHalf={
            <>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
                Поиск пути
              </h2>
              <p className="text-xl font-light text-gray-700 dark:text-gray-300">
                Система прокладки маршрутов по помещениям с учётом <strong>стен, дверей и этажей</strong>. Алгоритм учитывает препятствия на пути и позволяет находить кратчайшие маршруты между точками. 
                Гибкая архитектура позволяет в будущем внедрить эвакуационные планы, доступность для МГН и поддержку пользовательских правил навигации.
              </p>
            </>
          }
        />
      <DocumentationInfo/>
      </main>
      <Footer />
    </div>
  );
}
