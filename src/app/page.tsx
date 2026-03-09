import ACINodeMap from '@/components/ACINodeMap';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080f0b] px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Your First <span className="text-emerald-400">30 Days</span> with ACI
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            See exactly what happens when ACI joins your organization — from Day 1 to real results.
          </p>
        </div>
        <ACINodeMap />
      </div>
    </main>
  );
}
