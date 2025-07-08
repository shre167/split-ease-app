import React from 'react';
import { Zap, Users, Bell } from 'lucide-react';

const icons: Record<string, React.ReactNode> = {
  zap: <Zap className="w-7 h-7 text-white" />,
  users: <Users className="w-7 h-7 text-white" />,
  bell: <Bell className="w-7 h-7 text-white" />,
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="flex items-start gap-5 bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow font-manrope">
    <div className="flex-shrink-0 mt-1">{icons[icon]}</div>
    <div>
      <h3 className="text-white font-extrabold text-xl mb-2 leading-tight tracking-tight">{title}</h3>
      <p className="text-white/90 text-lg font-medium leading-snug">{description}</p>
    </div>
  </div>
);

export default FeatureCard; 