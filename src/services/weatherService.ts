export type RiskLevel = 'safe' | 'warning' | 'critical';

export interface RainDay {
  day: string;
  rainChance: number;
  rainfallMm: number;
  heatRisk: RiskLevel;
  stormRisk: RiskLevel;
  action: string;
}

export interface WeatherMatrix {
  region: string;
  generatedAt: string;
  days: RainDay[];
}

const fallbackWeather: WeatherMatrix = {
  region: 'Local block',
  generatedAt: new Date().toISOString(),
  days: [
    { day: 'today', rainChance: 72, rainfallMm: 18, heatRisk: 'safe', stormRisk: 'warning', action: 'weatherAction1' },
    { day: 'tomorrow', rainChance: 38, rainfallMm: 5, heatRisk: 'warning', stormRisk: 'safe', action: 'weatherAction2' },
    { day: 'day3', rainChance: 84, rainfallMm: 31, heatRisk: 'safe', stormRisk: 'critical', action: 'weatherAction3' },
    { day: 'day4', rainChance: 26, rainfallMm: 0, heatRisk: 'warning', stormRisk: 'safe', action: 'weatherAction4' },
    { day: 'day5', rainChance: 44, rainfallMm: 7, heatRisk: 'safe', stormRisk: 'safe', action: 'weatherAction5' },
    { day: 'day6', rainChance: 19, rainfallMm: 0, heatRisk: 'critical', stormRisk: 'safe', action: 'weatherAction6' },
    { day: 'day7', rainChance: 63, rainfallMm: 13, heatRisk: 'safe', stormRisk: 'warning', action: 'weatherAction7' }
  ]
};

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === 'safe' || value === 'warning' || value === 'critical';
}

function validateWeatherMatrix(value: unknown): WeatherMatrix {
  if (!value || typeof value !== 'object') throw new Error('Weather payload is not an object');
  const candidate = value as WeatherMatrix;
  if (typeof candidate.region !== 'string' || !Array.isArray(candidate.days) || candidate.days.length !== 7) {
    throw new Error('Weather matrix schema mismatch');
  }
  candidate.days.forEach((day) => {
    if (
      typeof day.day !== 'string' ||
      typeof day.rainChance !== 'number' ||
      typeof day.rainfallMm !== 'number' ||
      typeof day.action !== 'string' ||
      !isRiskLevel(day.heatRisk) ||
      !isRiskLevel(day.stormRisk)
    ) {
      throw new Error('Weather day schema mismatch');
    }
  });
  return candidate;
}

export async function fetchSevenDayRainfallMatrix(region = 'Local block'): Promise<WeatherMatrix> {
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    const payload = { ...fallbackWeather, region, generatedAt: new Date().toISOString() };
    return validateWeatherMatrix(payload);
  } catch (traceback) {
    return correctiveWeatherMiddleware(traceback, region);
  }
}

export function correctiveWeatherMiddleware(_traceback: unknown, region: string): WeatherMatrix {
  return {
    ...fallbackWeather,
    region,
    generatedAt: new Date().toISOString()
  };
}
