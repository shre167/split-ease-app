import React from 'react';
import { Zap, Users, Bell } from 'lucide-react';
import LoginCard from '@/components/LoginCard';
import AuthFooter from '@/components/AuthFooter';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#2563eb] text-white font-sans p-8 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 pt-16 w-full">
        {/* Left Column - Logo, Heading, Features */}
        <div className="flex-1 flex flex-col items-start text-left mt-32 lg:mt-48">
          {/* Logo and Title */}
          <div className="flex items-center gap-4 mb-10">
            <Zap className="w-8 h-8" />
            <div>
              <h1 className="text-4xl font-bold">SplitEase</h1>
              <p className="text-white/90 mt-2">Smart expense splitting for modern life</p>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-6 w-full">
            <div className="flex items-start gap-5 bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow">
              <Zap className="w-7 h-7 text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-extrabold text-xl mb-2 leading-tight tracking-tight">
                  Split Bills Effortlessly
                </h3>
                <p className="text-white/90 text-lg font-medium leading-snug">
                  Automatically calculate who owes what and settle up with integrated payments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5 bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow">
              <Users className="w-7 h-7 text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-extrabold text-xl mb-2 leading-tight tracking-tight">
                  Track Group Expenses
                </h3>
                <p className="text-white/90 text-lg font-medium leading-snug">
                  Keep track of shared expenses with friends, roommates, and colleagues.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5 bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow">
              <Bell className="w-7 h-7 text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-extrabold text-xl mb-2 leading-tight tracking-tight">
                  Smart Notifications
                </h3>
                <p className="text-white/90 text-lg font-medium leading-snug">
                  Get reminded when it's time to settle up or when expenses are added.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="flex-1 flex justify-center lg:justify-end mt-6">
          <LoginCard />
        </div>
      </div>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
};

export default Index;
