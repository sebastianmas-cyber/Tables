
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <style>{`
        body {
          font-family: 'Inter', sans-serif;
          background-color: #1a1a2e; /* Deep purple background */
          color: #ffffff;
          min-height: 100vh;
        }
        .container-card {
          background-color: #16213e; /* Slightly lighter card color */
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          max-width: 800px;
        }
        .trainer-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .trainer-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(233, 69, 96, 0.3);
        }
      `}</style>
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="container-card w-full p-6 sm:p-10 rounded-xl text-center">
          <h1 className="text-4xl font-extrabold mb-2 text-[#e94560]">Apnea Training Tables</h1>
          <p className="text-gray-300 mb-8 text-lg">Select a training protocol to begin your session.</p>

          <div className="flex flex-col md:flex-row gap-6">
            {/* CO2 Trainer Link */}
            <Link href="/co2" className="flex-1">
              <div className="trainer-card p-6 rounded-xl bg-[#27375a] border-b-4 border-green-500 hover:bg-[#3b5998] h-full flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-2 text-green-400">CO₂ Tolerance Table</h2>
                <p className="text-gray-400">Decreases recovery time to adapt your body to higher carbon dioxide levels.</p>
                <span className="mt-4 inline-block px-4 py-2 bg-green-600 text-white font-semibold rounded-lg">START CO₂ TRAINING</span>
              </div>
            </Link>

            {/* O2 Trainer Link */}
            <Link href="/o2" className="flex-1">
              <div className="trainer-card p-6 rounded-xl bg-[#27375a] border-b-4 border-red-500 hover:bg-[#3b5998] h-full flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-2 text-red-400">O₂ Tolerance Table</h2>
                <p className="text-gray-400">Increases hold time with constant recovery to adapt to lower oxygen levels.</p>
                <span className="mt-4 inline-block px-4 py-2 bg-red-600 text-white font-semibold rounded-lg">START O₂ TRAINING</span>
              </div>
            </Link>
          </div>
          
          <p className="text-xs text-gray-600 mt-8">Remember: Never train alone or near water.</p>
        </div>
      </div>
    </>
  );
}
