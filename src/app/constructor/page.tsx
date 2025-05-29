"use client";

import React from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Canvas from "@/app/constructor/components/Canvas";
import Toolbar from "@/app/constructor/components/Toolbar";
import Shapesbar from "@/app/constructor/components/Shapesbar";
import Activebar from "@/app/constructor/components/Activebar";
import Floorsbar from "@/app/constructor/components/Floorsbar";
import ImportExportBar from "@/app/constructor/components/ImportExportBar";

const ConstructorPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />
      <div className="flex flex-col flex-grow p-20 overflow-hidden">
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
