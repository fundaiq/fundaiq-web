export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-black dark:text-white">
      <div className="max-w-5xl mx-auto text-center py-24 px-6">
        {/* Hero Section with Motion */}
        <div className="relative mb-16">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight animate-fade-in">
            <span className="dark:text-white text-[#1F1F1F]">Smarter Investing</span> Starts with <span className="text-[#0073E6]">FundaIQ</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in-up">
            Build confidence in every investment decision — with instant reports, clear valuations, and a powerful AI-driven analysis engine designed for retail investors.
          </p>
          <div className="absolute -top-10 left-10 w-24 h-24 bg-[#0073E6] rounded-full opacity-30 animate-ping"></div>
          <div className="absolute -bottom-10 right-10 w-16 h-16 bg-[#1DB954] rounded-full opacity-20 animate-pulse"></div>
          <div className="mt-8 animate-fade-in-up">
            <a href="/report" className="inline-block bg-[#0073E6] text-white px-6 py-3 rounded-md shadow hover:bg-blue-600 transition">
              🧠 Start Analyzing Now
            </a>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-3">🚀 How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-lg shadow bg-[#F5F8FB] dark:bg-zinc-800">
              <h3 className="text-lg font-semibold text-[#0073E6] mb-2">Step 1: Import</h3>
              <p>Upload your Screener Excel file or enter a stock ticker to fetch financial data instantly.</p>
            </div>
            <div className="p-6 rounded-lg shadow bg-[#F5F8FB] dark:bg-zinc-800">
              <h3 className="text-lg font-semibold text-[#0073E6] mb-2">Step 2: Analyze</h3>
              <p>Get a complete one-page report with valuation, financial health metrics, and insights — all auto-generated.</p>
            </div>
            <div className="p-6 rounded-lg shadow bg-[#F5F8FB] dark:bg-zinc-800">
              <h3 className="text-lg font-semibold text-[#0073E6] mb-2">Step 3: Understand</h3>
              <p>Read our AI-generated explanations to truly understand the <em>"Why" before the Buy</em>.</p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-3">🌱 Our Principles</h2>
          <ul className="list-disc list-inside text-left max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
            <li><strong>Clarity:</strong> We simplify complexity for every investor.</li>
            <li><strong>Independence:</strong> We don’t sell stocks — we teach how to think about them.</li>
            <li><strong>Discipline:</strong> We focus on valuations, not hype.</li>
            <li><strong>Transparency:</strong> Every assumption is editable, every number is explained.</li>
          </ul>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-3">🌀 Smart Visuals, Smooth Experience</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Enjoy subtle animations, intuitive UI, and clear breakdowns — all powered by FundaIQ’s fast backend and thoughtful design.</p>

          <div className="flex justify-center items-center gap-8">
            <div className="w-24 h-24 rounded-full border-4 border-[#0073E6] animate-spin-slow"></div>
            <div className="w-24 h-24 rounded-full border-4 border-[#1DB954] animate-pulse"></div>
            <div className="w-24 h-24 rounded-full border-4 border-[#F5C518] animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
