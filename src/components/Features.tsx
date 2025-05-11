import React from "react";
import FeatureCard from "./FeatureCard";
import { FaDrawPolygon, FaLayerGroup, FaSave, FaJs, FaDatabase } from "react-icons/fa";
import { SiTailwindcss } from "react-icons/si";

const Features = () => {
  const features = [
    {
      icon: FaJs,
      title: "Canvas с Fabric.js",
      description: "Интерактивный канвас с поддержкой кастомных объектов, масштабирования и вращения.",
    },
    {
      icon: FaLayerGroup,
      title: "Многослойность (Этажи)",
      description: "Каждый этаж хранится как JSON и переключается без потери состояния.",
    },
    {
      icon: FaDrawPolygon,
      title: "Добавление объектов",
      description: "Создание стен, дверей, комнат и точек по клику прямо на канвасе.",
    },
    {
      icon: FaDatabase,
      title: "Zustand State Management",
      description: "Простой и мощный глобальный state для объектов, этажей и активных элементов.",
    },
    {
      icon: FaSave,
      title: "Сохранение и загрузка",
      description: "Сохранение состояния канваса и этажей между сессиями.",
    },
    {
      icon: SiTailwindcss,
      title: "Интерфейс с Tailwind CSS",
      description: "Современный UI с адаптивным дизайном, переключением темы и удобной панелью свойств.",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 rounded-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-6">
            Возможности
          </h2>
        </div>
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
