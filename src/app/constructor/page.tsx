"use client";

import React from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Canvas from "@/components/constructor/Canvas";
import Toolbar from "@/components/constructor/Toolbar";
import Shapesbar from "@/components/constructor/Shapesbar";

const ConstructorPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />
      <Toolbar />
      <div className="flex flex-1 pt-20 overflow-hidden">
        <Shapesbar />
        <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
          <Canvas />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ConstructorPage;
