const { createNotificationHelper } = require('./notificationController');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';

const getWeather = async (req, res) => {
    const city = req.query.city || 'Pune';
    if (!WEATHER_API_KEY) {
        return res.status(503).json({ message: 'Weather API key not configured. Add WEATHER_API_KEY to .env' });
    }
    try {
        const [current, forecast] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&cnt=7`)
        ]);
        const [currentData, forecastData] = await Promise.all([current.json(), forecast.json()]);
        if (Number(currentData.cod) !== 200) return res.status(400).json({ message: currentData.message || 'Weather API error' });
        
        // Trigger live weather alert notifications
        if (req.user && forecastData.list) {
            const hasRain = forecastData.list.some(f => f.weather && f.weather.some(w => w.main.toLowerCase().includes('rain')));
            const maxTempObj = forecastData.list.reduce((max, f) => (f.main.temp > max.main.temp ? f : max), forecastData.list[0]);
            const maxTemp = maxTempObj.main.temp;
            
            if (hasRain) {
                await createNotificationHelper(
                    req.user._id,
                    'weather',
                    'Rain Alert',
                    `Rainfall predicted in the upcoming weather forecast for ${city}. You can adjust/delay your irrigation plan.`
                );
            }
            if (maxTemp > 35) {
                await createNotificationHelper(
                    req.user._id,
                    'weather',
                    'Extreme Heat Alert',
                    `Temperatures are expected to reach ${maxTemp.toFixed(1)}°C in ${city}. Monitor soil moisture and water crops frequently.`
                );
            }
        }

        res.json({ current: currentData, forecast: forecastData });
    } catch (error) {
        res.status(500).json({ message: 'Weather fetch failed', error: error.message });
    }
};

const irrigationSuggest = async (req, res) => {
    try {
        const response = await fetch(`${ML_SERVICE_URL}/irrigation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();

        // Trigger irrigation notification
        if (req.user && data.totalWaterNeeded) {
            await createNotificationHelper(
                req.user._id,
                'irrigation',
                'Irrigation Plan Generated',
                `Water requirement computed for ${req.body.crop || 'crop'}: ${data.totalWaterNeeded} L total (${data.dailyRequirement} L/day). Note: ${data.soilNote}`
            );
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error communicating with ML service', error: error.message });
    }
};

const marketAnalysis = async (req, res) => {
    try {
        const response = await fetch(`${ML_SERVICE_URL}/market`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error communicating with ML service', error: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const User = require('../models/User');
        const Notification = require('../models/Notification');
        const totalUsers = await User.countDocuments();
        
        let totalPredictions = 0;
        let totalSoilTests = 0;
        
        if (req.user) {
            totalPredictions = await Notification.countDocuments({ user: req.user._id, type: 'crop' });
            totalSoilTests = await Notification.countDocuments({ user: req.user._id, type: 'soil' });
        }

        res.json({ totalUsers, totalPredictions, totalSoilTests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const recommendCrop = async (req, res) => {
    try {
        const response = await fetch(`${ML_SERVICE_URL}/recommend-crop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();

        // Trigger crop recommendation notification
        if (req.user && data.recommended && data.recommended.length > 0) {
            const cropList = data.recommended.map(c => c.name).join(', ');
            await createNotificationHelper(
                req.user._id,
                'crop',
                'New Crop Recommendation',
                `AI recommended ${cropList} as the optimal crops for your land.`
            );
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error communicating with ML service', error: error.message });
    }
};

const predictYield = async (req, res) => {
    try {
        const response = await fetch(`${ML_SERVICE_URL}/predict-yield`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();

        // Trigger yield prediction notification
        if (req.user && data.predictedYield) {
            await createNotificationHelper(
                req.user._id,
                'crop',
                'Yield Prediction Calculated',
                `Expected yield for ${req.body.crop || 'crop'} is ${data.predictedYield} tons with ₹${data.estimatedProfit.toLocaleString()} estimated profit.`
            );
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error communicating with ML service', error: error.message });
    }
};

const cleanJsonString = (str) => {
    let cleaned = str.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/, '');
    }
    return cleaned.trim();
};

const analyzeSoil = async (req, res) => {
    const { N, P, K, humidity, temperature, moisture, soilType, crop } = req.body;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
        try {
            console.log("Attempting soil analysis with Gemini AI...");
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
            
            const prompt = `You are an expert agricultural AI. Analyze the following soil health parameters and planned cultivation conditions:
- Nitrogen (N): ${N || 50} (optimal: 50-80)
- Phosphorus (P): ${P || 50} (optimal: 30-60)
- Potassium (K): ${K || 50} (optimal: 30-60)
- Humidity: ${humidity || 60}%
- Temperature: ${temperature || 25}°C
- Soil Moisture: ${moisture || 40}%
- Soil Type: ${soilType || 'Loamy'}
- Target Crop: ${crop || 'Wheat'}

Provide:
1. Soil evaluation for Nitrogen, Phosphorus, Potassium ('Low', 'Medium', or 'High' classification).
2. Detail-oriented, highly specific fertilizer suggestions (e.g. application dosage of Urea/DAP/MOP or NPK blends, timing, methods) formatted as a list.
3. An assessment of crop disease risks based on current climate parameters (temperature and humidity) and crop type.

You MUST respond strictly with a valid JSON matching the following schema. Return only the raw JSON. Do not include markdown code block markers like \`\`\`json.
{
  "soilTest": {
    "Nitrogen": "Low" | "Medium" | "High",
    "Phosphorus": "Low" | "Medium" | "High",
    "Potassium": "Low" | "Medium" | "High"
  },
  "fertilizerSuggestions": ["String suggestion 1", "String suggestion 2", ...],
  "diseaseRisk": "String explaining risk details..."
}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (response.ok) {
                const jsonResult = await response.json();
                const rawText = jsonResult.candidates[0].content.parts[0].text;
                const data = JSON.parse(cleanJsonString(rawText));

                // Trigger soil analysis notification
                if (req.user && data.soilTest) {
                    const lowNutrients = Object.entries(data.soilTest)
                        .filter(([nutrient, level]) => level === 'Low')
                        .map(([nutrient]) => nutrient);
                    
                    if (lowNutrients.length > 0) {
                        await createNotificationHelper(
                            req.user._id,
                            'soil',
                            'Low Soil Nutrient Alert (AI)',
                            `Your soil is low in ${lowNutrients.join(', ')}. AI recommendations: ${data.fertilizerSuggestions.join('; ')}`
                        );
                    } else {
                        await createNotificationHelper(
                            req.user._id,
                            'soil',
                            'Soil Analysis Complete (AI)',
                            'Soil health analysis finished: All nutrients (N, P, K) are in healthy ranges!'
                        );
                    }
                }

                return res.json(data);
            } else {
                console.warn(`Gemini API responded with status ${response.status}. Falling back to ML service...`);
            }
        } catch (error) {
            console.error("Gemini Soil Analysis failed. Falling back to local ML service...", error);
        }
    }

    // Fallback to Flask ML Random Forest Model
    try {
        console.log("Using local Random Forest ML service fallback...");
        const response = await fetch(`${ML_SERVICE_URL}/analyze-soil`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();

        // Trigger soil analysis notification
        if (req.user && data.soilTest) {
            const lowNutrients = Object.entries(data.soilTest)
                .filter(([nutrient, level]) => level === 'Low')
                .map(([nutrient]) => nutrient);
            
            if (lowNutrients.length > 0) {
                await createNotificationHelper(
                    req.user._id,
                    'soil',
                    'Low Soil Nutrient Alert',
                    `Your soil is low in ${lowNutrients.join(', ')}. Action suggestions: ${data.fertilizerSuggestions.join('; ')}`
                );
            } else {
                await createNotificationHelper(
                    req.user._id,
                    'soil',
                    'Soil Analysis Complete',
                    'Soil health analysis finished: All nutrients (N, P, K) are in healthy ranges!'
                );
            }
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error communicating with ML service', error: error.message });
    }
};

module.exports = { recommendCrop, predictYield, analyzeSoil, getWeather, irrigationSuggest, marketAnalysis, getDashboardStats };
