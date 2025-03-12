import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Section from "@/components/Section";
import Image from "next/image";
import Features from "@/components/Features";
import Accordion from "@/components/Accordion";

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
                Maps
              </h2>
              <p className="text-xl font-light">Postgres basic database and other cool features to come.</p>
            </>
          }
          rightHalf={
            <Image
              src={"/plan-image.png"}
              alt="section-image"
              width={500}
              height={100}
              className="w-1/2 h-auto"
            />
          }
        />
       <Section
          leftHalf={<Accordion />}
          rightHalf={
            <div className="flex flex-col justify-end">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
                Highlight the key features
              </h2>
              <p className="text-xl font-light">
                Talk about some of the key features of your app that you want to highlight. Use the beautiful accordion
                to highlight the key features of your app.
              </p>
            </div>
          }
        />
      </main>
      <Footer />
    </div>
  );
}
