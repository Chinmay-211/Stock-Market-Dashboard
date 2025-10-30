const express = require('express');
const cors = require('cors');
const yahooFinance = require('yahoo-finance2').default;
const ss = require('simple-statistics'); 
const path = require('path'); // Not strictly needed for Vercel API, but kept for completeness

const app = express();

// --- CRITICAL FOR SEPARATE DEPLOYMENT: CORS Configuration ---
// In a real-world scenario, you MUST replace the origin: '*' with your specific frontend URL 
// (e.g., origin: 'https://my-stock-frontend.vercel.app'). 
// Using '*' here allows all domains during initial testing.
const frontendURL = 
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

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
        // Ensure only numbers are being summed
        const sum = chunk.reduce((acc, val) => acc + (val.close || 0), 0);
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
    // This endpoint works as /api/companies on Vercel
    res.json({ companies: Object.keys(COMPANIES) });
});


app.get('/api/stock/:companyName', async (req, res) => {
    // This endpoint works as /api/stock/:companyName on Vercel
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

        
        if (!historicalData || historicalData.length === 0) {
            console.error(`No historical data found for ${tickerSymbol}`);
            return res.status(500).json({ error: `Could not fetch historical data for ${tickerSymbol}` });
        }
        
        // Fetch quote data
        const quote = await yahooFinance.quote(tickerSymbol);
        
        // Calculations
        const sma50 = calculateSMA(historicalData, 50);
        const prediction = getPrediction(historicalData);

        res.json({
            historical: historicalData.map(d => ({
                date: d.date, // Use Date object or convert to string if preferred
                close: d.close,
            })),
            fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: quote?.fiftyTwoWeekLow,
            averageVolume: quote?.averageDailyVolume3Month,
            sma50: sma50,
            prediction: prediction,
        });
    } catch (error) {
        console.error('Yahoo Finance API error:', error.message);
        // It's crucial to set the status code for API errors
        res.status(500).json({ error: "Could not fetch stock data" });
    }
});

// Vercel Serverless Function requirement: Export the Express app
module.exports = app;