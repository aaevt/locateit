"use client";

import React from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Canvas from "@/components/constructor/Canvas";
import Toolbar from "@/components/constructor/Toolbar";
import Shapesbar from "@/components/constructor/Shapesbar";
import Activebar from "@/components/constructor/Activebar";
import ImportExportBar from "@/components/constructor/ImportExportBar";

const ConstructorPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />
      <Toolbar />
      <div className="flex flex-1 pt-20 overflow-hidden">
        <div className="flex flex-col h-full">
          <Shapesbar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-4">
            <Canvas />
          </div>
          <div className="px-4 pb-4">
            <ImportExportBar />
          </div>
        </div>
        <div className="flex flex-col h-full">
          <Activebar />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ConstructorPage;
