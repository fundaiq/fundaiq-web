import React from 'react';

const StockMarketGuide = () => {
  return (
    <div className="container mx-auto" style={{ paddingTop: 'calc(64px + var(--space-lg))' }}>
      {/* Header Section */}
      <div className="text-center mb-5 px-4 py-5 bg-brand rounded-2xl text-white shadow-lg">
        <h1 className="text-4xl font-extrabold mb-3 flex items-center justify-center gap-3">
          <span className="text-4xl">📈</span>
          <span>Stock Market Basics</span>
        </h1>
        <p className="text-xl font-medium">Your complete beginner's guide to understanding the stock market</p>
      </div>

      {/* What is Stock Market */}
      <div className="card-base mb-5">
        <h2 className="text-3xl font-bold brand-text mb-4 flex items-center gap-3">
          <span className="text-4xl">🏛️</span>What is the Stock Market?
        </h2>
        <p className="text-secondary mb-4 text-lg">
          The stock market is like a giant marketplace where people buy and sell pieces of companies called "stocks" or "shares." 
          Think of it as an auction house where the prices of these company pieces go up and down based on how much people want to buy or sell them.
        </p>
        
        <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4 mt-4">
          <h3 className="text-xl font-semibold mb-3 brand-text">💡 Simple Analogy</h3>
          <p className="text-secondary">
            Imagine you and your friends start a lemonade business. You decide to sell 100 pieces of your business to raise money. 
            Each piece represents 1% ownership. If someone buys 10 pieces, they own 10% of your lemonade business. 
            The stock market works the same way, but with big companies!
          </p>
        </div>
      </div>

      {/* What are Stocks */}
      <div className="card-base mb-5">
        <h2 className="text-3xl font-bold brand-text mb-4 flex items-center gap-3">
          <span className="text-4xl">📜</span>What are Stocks?
        </h2>
        <p className="text-secondary mb-4 text-lg">
          A stock represents a tiny piece of ownership in a company. When you buy a stock, you become a shareholder - 
          literally a person who shares in the ownership of that company.
        </p>
        
        <h3 className="text-2xl font-bold mb-3 text-primary">Types of Stocks:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
            <h4 className="font-semibold brand-text mb-2 text-lg">Common Stocks</h4>
            <p className="text-secondary text-sm">Give you voting rights in company decisions and potential dividends (profit sharing).</p>
          </div>
          <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
            <h4 className="font-semibold brand-text mb-2 text-lg">Preferred Stocks</h4>
            <p className="text-secondary text-sm">Usually no voting rights, but you get paid dividends before common stockholders.</p>
          </div>
        </div>
      </div>

      {/* How Stock Markets Work */}
      <div className="card-base mb-5">
        <h2 className="text-3xl font-bold brand-text mb-4 flex items-center gap-3">
          <span className="text-4xl">⚙️</span>How Does the Stock Market Work?
        </h2>
        <p className="text-secondary mb-4 text-lg">
          The stock market operates through exchanges - organized marketplaces where stocks are bought and sold. Let's understand this step by step:
        </p>
        
        <h3 className="text-2xl font-bold mb-3 text-primary flex items-center gap-3">
          🏢 Stock Exchanges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
            <h4 className="font-semibold brand-text mb-2">NYSE</h4>
            <p className="text-secondary text-sm">The largest stock exchange in the world by market value. Home to giants like Coca-Cola, IBM.</p>
          </div>
          <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
            <h4 className="font-semibold brand-text mb-2">NASDAQ</h4>
            <p className="text-secondary text-sm">Electronic exchange known for technology companies like Apple, Microsoft, Google.</p>
          </div>
          <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
            <h4 className="font-semibold brand-text mb-2">BSE/NSE (India)</h4>
            <p className="text-secondary text-sm">Bombay Stock Exchange and National Stock Exchange are India's main exchanges.</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-3 text-primary flex items-center gap-3">
          📱 How a Stock Trade Actually Happens
        </h3>
        <div className="bg-surface-secondary border border-default rounded-xl p-4 mb-4">
          <h4 className="font-bold mb-3 brand-text text-xl">Step-by-Step Process:</h4>
          <div className="space-y-3">
            {[
              { step: 1, title: "You Place an Order", desc: "Through your broker's app/website, you say 'I want to buy 10 shares of ABC Company at ₹100 each'" },
              { step: 2, title: "Broker Receives Order", desc: "Your broker (like Zerodha, Upstox) gets your order" },
              { step: 3, title: "Order Goes to Exchange", desc: "Broker sends your order to the stock exchange (NSE/BSE)" },
              { step: 4, title: "Matching System", desc: "Exchange computer finds someone selling ABC shares at ₹100" },
              { step: 5, title: "Trade Executed", desc: "Your buy order matches with someone's sell order" },
              { step: 6, title: "Settlement", desc: "After 2 days (T+2), shares appear in your Demat account, money is deducted" }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 p-3 bg-surface-elevated rounded-lg border border-default">
                <div className="flex-shrink-0 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <div>
                  <h5 className="font-semibold text-primary mb-1">{item.title}</h5>
                  <p className="text-secondary text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-3 text-primary flex items-center gap-3">
          💰 Order Types Explained
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
            <h4 className="font-semibold brand-text mb-2 text-lg">Market Order</h4>
            <p className="text-secondary text-sm mb-2"><strong>What:</strong> "Buy/sell immediately at current market price"</p>
            <p className="text-secondary text-sm"><strong>Example:</strong> ABC stock is ₹100, you place market order, you get it around ₹100</p>
          </div>
          <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
            <h4 className="font-semibold brand-text mb-2 text-lg">Limit Order</h4>
            <p className="text-secondary text-sm mb-2"><strong>What:</strong> "Buy/sell only at specific price or better"</p>
            <p className="text-secondary text-sm"><strong>Example:</strong> ABC is ₹100, you set limit buy at ₹95. Order executes only if price drops to ₹95</p>
          </div>
          <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
            <h4 className="font-semibold brand-text mb-2 text-lg">Stop-Loss Order</h4>
            <p className="text-secondary text-sm mb-2"><strong>What:</strong> "Sell if price falls below certain level"</p>
            <p className="text-secondary text-sm"><strong>Example:</strong> You bought at ₹100, set stop-loss at ₹90. Auto-sells if price hits ₹90</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-3 text-primary flex items-center gap-3">
          📊 Price Movement - Supply & Demand in Action
        </h3>
        <div className="bg-surface-secondary border border-default rounded-xl p-4 mb-4">
          <h4 className="font-bold mb-3 brand-text text-xl">Real Example: How Prices Change</h4>
          <p className="text-secondary mb-4 text-lg"><strong>Scenario:</strong> XYZ Company announces great quarterly results</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-elevated border-l-4 rounded-lg p-4" style={{ borderLeftColor: 'var(--success-primary)' }}>
              <h5 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--success-primary)' }}>
                📈 Bullish Result
              </h5>
              <div className="space-y-2 text-sm text-secondary">
                <p><strong>Result:</strong> More people want to buy (demand increases)</p>
                <p><strong>Current sellers at ₹50:</strong> 1000 shares available</p>
                <p><strong>New buyers want:</strong> 5000 shares</p>
                <p><strong>What happens:</strong> Price goes up to ₹55, ₹60, ₹65... until supply meets demand</p>
              </div>
            </div>

            <div className="bg-surface-elevated border-l-4 rounded-lg p-4" style={{ borderLeftColor: 'var(--danger-primary)' }}>
              <h5 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--danger-primary)' }}>
                📉 Bearish Scenario
              </h5>
              <div className="space-y-2 text-sm text-secondary">
                <p><strong>Opposite scenario:</strong> Bad news comes out</p>
                <p><strong>Current buyers at ₹50:</strong> Want only 500 shares</p>
                <p><strong>Sellers want to sell:</strong> 3000 shares</p>
                <p><strong>What happens:</strong> Price drops to ₹45, ₹40, ₹35... until someone buys</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Essential Terms */}
      <div className="card-base mb-5">
        <h2 className="text-3xl font-bold brand-text mb-4 flex items-center gap-3">
          <span className="text-4xl">📚</span>Essential Stock Market Terms
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { term: "IPO", full: "Initial Public Offering", desc: "When a private company first sells its stocks to the public." },
            { term: "Dividend", full: "", desc: "Money that companies pay to shareholders from their profits." },
            { term: "Market Cap", full: "", desc: "Total value of all company's stocks (Stock Price × Number of Shares)." },
            { term: "Bull Market", full: "", desc: "When stock prices are generally rising and investor confidence is high." },
            { term: "Bear Market", full: "", desc: "When stock prices are generally falling and investors are pessimistic." },
            { term: "Portfolio", full: "", desc: "The collection of all your investments (stocks, bonds, etc.)." }
          ].map((item, index) => (
            <div key={index} className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
              <h4 className="font-bold brand-text mb-2 text-lg">{item.term}</h4>
              {item.full && <p className="text-sm text-tertiary mb-2 font-medium">({item.full})</p>}
              <p className="text-sm text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to Start Investing */}
      <div className="card-base mb-5">
        <h2 className="text-3xl font-bold brand-text mb-4 flex items-center gap-3">
          <span className="text-4xl">🚀</span>How to Start Investing
        </h2>
        
        <h3 className="text-2xl font-bold mb-3 text-primary">Step 1: Open a Demat Account</h3>
        <p className="text-secondary mb-3">A Demat (dematerialized) account holds your stocks digitally. You'll need:</p>
        <ul className="list-disc list-inside mb-4 text-secondary space-y-1 ml-4">
          <li>PAN Card</li>
          <li>Aadhar Card</li>
          <li>Bank Account</li>
          <li>Income Proof</li>
        </ul>

        <h3 className="text-2xl font-bold mb-3 text-primary">Step 2: Choose a Broker</h3>
        <p className="text-secondary mb-4">Brokers are companies that execute your buy/sell orders. Popular options include Zerodha, Upstox, Angel Broking, and traditional banks.</p>

        <h3 className="text-2xl font-bold mb-3 text-primary">Step 3: Research Before You Invest</h3>
        <p className="text-secondary mb-3">Never invest blindly. Study the company's:</p>
        <ul className="list-disc list-inside text-secondary space-y-1 ml-4">
          <li>Financial health</li>
          <li>Business model</li>
          <li>Competition</li>
          <li>Future growth prospects</li>
        </ul>
      </div>

      {/* Investment Strategies */}
      <div className="card-base mb-5">
        <h2 className="text-3xl font-bold brand-text mb-4 flex items-center gap-3">
          <span className="text-4xl">🎯</span>Investment Strategies for Beginners
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
            <h4 className="font-semibold brand-text mb-2">Long-term Investing</h4>
            <p className="text-sm text-secondary">Buy and hold stocks for years. Less risky, good for beginners.</p>
          </div>
          <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
            <h4 className="font-semibold brand-text mb-2">Diversification</h4>
            <p className="text-sm text-secondary">Don't put all money in one stock. Spread risk across different companies/sectors.</p>
          </div>
          <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
            <h4 className="font-semibold brand-text mb-2">SIP (Systematic Investment Plan)</h4>
            <p className="text-sm text-secondary">Invest a fixed amount regularly, regardless of market conditions.</p>
          </div>
          <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
            <h4 className="font-semibold brand-text mb-2">Value Investing</h4>
            <p className="text-sm text-secondary">Buy stocks that are priced below their true worth.</p>
          </div>
        </div>
      </div>

      {/* Tips for Success */}
      <div className="bg-surface-secondary border rounded-lg p-4 mb-5" style={{ borderColor: 'var(--success-primary)' }}>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ color: 'var(--success-primary)' }}>
          💡 Tips for New Investors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Start small - invest only what you can afford to lose",
            "Never invest borrowed money", 
            "Don't panic during market downturns",
            "Keep learning - read financial news and books",
            "Have patience - wealth building takes time",
            "Keep some emergency money outside investments",
            "Review your portfolio regularly but don't overtrade",
            "Consider mutual funds if individual stock picking seems difficult"
          ].map((tip, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-surface-elevated rounded border border-default">
              <span style={{ color: 'var(--success-primary)' }} className="font-bold">✓</span>
              <span className="text-secondary">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Warning */}
      <div className="bg-surface-secondary border rounded-lg p-4 mb-5" style={{ borderColor: 'var(--warning-primary)' }}>
        <h3 className="text-2xl font-bold mb-3 flex items-center gap-3" style={{ color: 'var(--warning-primary)' }}>
          ⚠️ Important Risk Warning
        </h3>
        <p className="text-secondary">
          Stock market investments carry risks. Prices can go down as well as up, and you might lose money. 
          Never invest money you need for essential expenses. Always do your research and consider consulting with a financial advisor.
        </p>
      </div>

      {/* Conclusion */}
      <div className="card-base">
        <h2 className="text-3xl font-bold brand-text mb-4 flex items-center gap-3">
          <span className="text-4xl">🎓</span>Key Takeaways
        </h2>
        <p className="text-secondary mb-4 text-lg">
          The stock market is a powerful tool for building wealth over time, but it requires patience, knowledge, and discipline. 
          Start with small amounts, focus on learning, and remember that successful investing is a marathon, not a sprint.
        </p>
        
        <div className="bg-surface-secondary border-l-4 border-brand rounded-lg p-4">
          <h3 className="text-xl font-bold mb-3 brand-text">Remember: Time in the Market {'>'} Timing the Market</h3>
          <p className="text-secondary">
            It's better to stay invested for a long time than trying to guess the perfect time to buy or sell. 
            Historical data shows that patient, long-term investors generally do well in the stock market.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockMarketGuide;