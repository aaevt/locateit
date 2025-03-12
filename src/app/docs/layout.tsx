import { Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const navbar = <Navbar logo={<b>Documentation</b>} />;

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <body>
        <Header />
        <Layout
          sidebar={{autoCollapse: true}}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/aaevt/locateit/wiki"
          footer={<br/>}
        >
          {children}
        </Layout>
        <Footer/>
      </body>
    </html>
  );
}
