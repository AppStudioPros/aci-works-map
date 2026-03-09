'use client';

import dynamic from 'next/dynamic';

const ACIFlowMap = dynamic(() => import('@/components/ACIFlowMap'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-[#060610] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
            Your First <span className="text-sky-400">30 Days</span> with ACI
          </h1>
          <p className="text-[#64748B] text-base max-w-2xl mx-auto">
            See exactly what happens when ACI joins your organization — from Day 1 to real results.
          </p>
        </div>
        <ACIFlowMap />
      </div>
    </main>
  );
}
