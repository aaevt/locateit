import React, { ReactNode } from "react";

interface FeatureCardProps {
  icon: React.ComponentType<{ size: number }>;
  title: string;
  description: string | ReactNode;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
      <Icon size={34} />
      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 font-light">{description}</p>
    </div>
  );
};

export default FeatureCard;