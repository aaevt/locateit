import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/globals.css";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Footer />
    </>
  );
}
