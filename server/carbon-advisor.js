import NodeCache from 'node-cache';

const adviceCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Build a prompt string from the user's emission profile.
 * @param {{ totalKg: number, bySector: Object<string, number> }} userProfile
 * @returns {string}
 */
const buildPrompt = (userProfile) => {
  const lines = [
    'You are GreenPulse, a friendly carbon reduction advisor.',
    `The user emits ${userProfile.totalKg.toFixed(1)} kg CO2e total.`,
    'Breakdown by sector:',
  ];
  const sectors = userProfile.bySector || {};
  for (const [sector, kg] of Object.entries(sectors)) {
    lines.push(`  - ${sector}: ${kg.toFixed(1)} kg`);
  }
  lines.push('');
  lines.push('Give exactly 5 short, specific, actionable tips to reduce their footprint.');
  lines.push('Return ONLY a JSON array of 5 strings. No markdown.');
  return lines.join('\n');
};

/**
 * Generate mock advice when no API key is available.
 * @param {{ totalKg: number, bySector: Object<string, number> }} userProfile
 * @returns {string[]}
 */
export const generateMockAdvice = (userProfile) => {
  const tips = [];
  const sectors = userProfile.bySector || {};

  if ((sectors.commute || 0) > 50) {
    tips.push('Consider cycling or using public transit for short trips under 5km.');
    tips.push('Combine multiple errands into a single driving trip to cut fuel use.');
  }
  if ((sectors.diet || 0) > 30) {
    tips.push('Swap one red meat meal per week with a plant-based option.');
    tips.push('Buy seasonal local produce to reduce transport emissions from food.');
  }
  if ((sectors.household || 0) > 40) {
    tips.push('Switch to LED lighting and unplug devices on standby.');
    tips.push('Lower your thermostat by 2°C — saves up to 300 kg CO2 annually.');
  }
  if ((sectors.consumption || 0) > 20) {
    tips.push('Choose second-hand clothing or extend garment life by 9 months.');
    tips.push('Repair electronics instead of replacing them when possible.');
  }

  while (tips.length < 5) {
    tips.push('Track your activities daily to identify your biggest emission sources.');
  }

  return tips.slice(0, 5);
};

/**
 * Get personalized eco-advice from Gemini AI or fallback to mock.
 * Results are cached for 5 minutes to avoid redundant API calls.
 * @param {{ totalKg: number, bySector: Object<string, number> }} userProfile
 * @returns {Promise<string[]>}
 */
export const obtainEcoAdvice = async (userProfile) => {
  const cacheKey = `advice_${Math.round(userProfile.totalKg)}_${Object.values(userProfile.bySector || {}).map(Math.round).join('_')}`;

  const cached = adviceCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const mockResult = generateMockAdvice(userProfile);
    adviceCache.set(cacheKey, mockResult);
    return mockResult;
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = buildPrompt(userProfile);
    const response = await model.generateContent(prompt);
    const text = response.response.text();

    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) {
      adviceCache.set(cacheKey, parsed);
      return parsed;
    }

    const fallback = generateMockAdvice(userProfile);
    adviceCache.set(cacheKey, fallback);
    return fallback;
  } catch (err) {
    console.error('[GreenPulse AI]', err.message);
    const fallback = generateMockAdvice(userProfile);
    adviceCache.set(cacheKey, fallback);
    return fallback;
  }
};
