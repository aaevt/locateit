"use client";

import React from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Canvas from "@/components/constructor/Canvas";
import Toolbar from "@/components/constructor/Toolbar";
import Shapesbar from "@/components/constructor/Shapesbar";
import Activebar from "@/components/constructor/Activebar";
import Floorsbar from "@/components/constructor/Floorsbar";
import ImportExportBar from "@/components/constructor/ImportExportBar";

const ConstructorPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />
      <div className="flex flex-col p-20 overflow-hidden">
        <div className="flex flew-row justify-center">
        <Toolbar />

        <div className="flex flex-col h-full px-4 gap-4">
          <Shapesbar />
        </div>

        <div className="flex flex-col justify-center overflow-hidden">
          <div className="flex items-center justify-center">
            <Canvas />
          </div>

          <div className="pt-4 ">
            <ImportExportBar />
          </div>

        </div>

        <div className="flex flex-col h-full px-4 gap-4">
          <Floorsbar />
          <Activebar />
        </div>

        </div>

      </div>
      <Footer />
    </div>
  );
};

export default ConstructorPage;
