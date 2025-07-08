
import React from 'react';
import LogoSquare from '@/components/LogoSquare';
import FeatureCard from '@/components/FeatureCard';
import LoginCard from '@/components/LoginCard';

const features = [
  {
    icon: 'zap',
    title: 'Split Bills Effortlessly',
    description: 'Automatically calculate who owes what and settle up with integrated payments.'
  },
  {
    icon: 'users',
    title: 'Track Group Expenses',
    description: 'Keep track of shared expenses with friends, roommates, and colleagues.'
  },
  {
    icon: 'bell',
    title: 'Smart Notifications',
    description: 'Get reminded when it’s time to settle up or when expenses are added.'
  }
];

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#5015e6] to-[#7924e0] font-manrope flex items-center justify-center px-2">
      <section className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 py-16 items-center justify-center">
        {/* Left column: Features */}
        <div className="flex-1 flex flex-col justify-center items-center lg:items-start gap-8 max-w-lg w-full">
          <LogoSquare />
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mt-4 mb-2 text-center lg:text-left leading-tight tracking-tight">SplitEase</h1>
          <p className="text-white/90 text-xl mb-8 text-center lg:text-left font-medium">Smart expense splitting for modern life</p>
          <div className="flex flex-col gap-6 w-full">
            {features.map((feature, i) => (
              <FeatureCard key={i} icon={feature.icon} title={feature.title} description={feature.description} />
            ))}
          </div>
        </div>
        {/* Right column: Login */}
        <div className="flex-1 flex justify-center items-center max-w-md w-full">
          <LoginCard />
        </div>
      </section>
    </main>
  );
};

export default Index;
