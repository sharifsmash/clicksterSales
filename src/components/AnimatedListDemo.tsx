import React from 'react';
import { cn } from "../lib/utils";
import { AnimatedList } from "./magicui/animated-list";

interface Feature {
  icon: string;
  title: string;
  time: string;
}

const features: Feature[] = [
  { icon: '💸', title: 'Easy ad management', time: '15m ago' },
  { icon: '📈', title: 'Profit optimization', time: '30m ago' },
  { icon: '🤖', title: 'AI-powered insights', time: '1h ago' },
  { icon: '🔗', title: 'Multi-platform integration', time: '2h ago' },
];

const FeatureItem: React.FC<Feature> = ({ icon, title, time }) => (
  <div className="flex items-center space-x-4 bg-white rounded-lg p-4 shadow-md">
    <span className="text-2xl">{icon}</span>
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">{time}</p>
    </div>
  </div>
);

export function AnimatedListDemo({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      <AnimatedList>
        {features.map((feature, idx) => (
          <FeatureItem key={idx} {...feature} />
        ))}
      </AnimatedList>
    </div>
  );
}