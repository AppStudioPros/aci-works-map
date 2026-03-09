import ACINodeMap from '@/components/ACINodeMap';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080f0b] flex flex-col items-center px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-center">
        How <span className="text-emerald-400">ACI</span> Works
      </h1>
      <p className="text-emerald-300/50 text-lg mb-8 text-center max-w-2xl">
        Adaptive Compound Intelligence — the nervous system of your organization
      </p>
      <ACINodeMap />
    </main>
  );
}
