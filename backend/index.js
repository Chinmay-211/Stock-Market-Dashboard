
const express = require('express');
const cors = require('cors');
const yahooFinance = require('yahoo-finance2').default;
const ss = require('simple-statistics'); 

const app = express();
const PORT = 5000;

app.use(cors());

const COMPANIES = {
    "Apple": "AAPL",
    "Microsoft": "MSFT",
    "Google": "GOOGL",
    "Amazon": "AMZN",
    "Tesla": "TSLA",
    "Meta Platforms": "META",
    "NVIDIA": "NVDA",
    "JPMorgan Chase": "JPM",
    "Johnson & Johnson": "JNJ",
    "Walmart": "WMT",
};

// --- Helper Function to Calculate SMA ---
const calculateSMA = (data, window) => {
    let sma = [];
    for (let i = 0; i <= data.length - window; i++) {
        const chunk = data.slice(i, i + window);
        const sum = chunk.reduce((acc, val) => acc + val.close, 0);
        sma.push({ date: data[i + window - 1].date, value: sum / window });
    }
    // Pad with nulls at the beginning to align with the original data
    return Array(window - 1).fill(null).concat(sma.map(s => s.value));
};

// --- Helper Function for AI Prediction (Linear Regression) ---
const getPrediction = (data) => {
    if (data.length < 2) return null;
    
    // Format data for the library: [day_number, price]
    const regressionData = data.map((d, index) => [index, d.close]);
    
    // Calculate the linear regression
    const { m, b } = ss.linearRegression(regressionData);
    
    // Predict the next day's price (index = data.length)
    const nextDayPrice = ss.linearRegressionLine({ m, b })(data.length);
    
    return nextDayPrice;
};


app.get('/api/companies', (req, res) => {
    res.json({ companies: Object.keys(COMPANIES) });
});


app.get('/api/stock/:companyName', async (req, res) => {
    const { companyName } = req.params;
    const tickerSymbol = COMPANIES[companyName];

    if (!tickerSymbol) {
        return res.status(404).json({ error: "Company not found" });
    }

    try {
        const today = new Date();
        const yearAgo = new Date();
        yearAgo.setFullYear(today.getFullYear() - 1);

        const historicalData = await yahooFinance.historical(tickerSymbol, {
            period1: yearAgo,
            period2: today,
            interval: '1d'
        });

       
        // If the API returns no historical data, send an error instead of crashing.
        if (!historicalData || historicalData.length === 0) {
            console.error(`No historical data found for ${tickerSymbol}`);
            return res.status(500).json({ error: `Could not fetch historical data for ${tickerSymbol}` });
        }
        
        const quote = await yahooFinance.quote(tickerSymbol);
        
        const sma50 = calculateSMA(historicalData, 50);
        const prediction = getPrediction(historicalData);

        res.json({
            historical: historicalData,
            fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: quote?.fiftyTwoWeekLow,
            averageVolume: quote?.averageDailyVolume3Month,
            sma50: sma50,
            prediction: prediction,
        });
    } catch (error) {
        console.error('Yahoo Finance API error:', error.message);
        res.status(500).json({ error: "Could not fetch stock data" });
    }
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});