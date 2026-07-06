import { CloudRain, SunMedium, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RainDay, RiskLevel } from '../services/weatherService';

const riskClass: Record<RiskLevel, string> = {
  safe: 'bg-green-100 text-green-800 border-green-300',
  warning: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  critical: 'bg-red-100 text-red-800 border-red-300'
};

export interface WeatherCardProps {
  region: string;
  days: RainDay[];
  fallbackActive?: boolean;
}

export default function WeatherCard({ region, days, fallbackActive = false }: WeatherCardProps) {
  const { t } = useTranslation();
  const headline = days[0];

  return (
    <section className="rounded-lg border border-sky-200 bg-white p-4 shadow-field">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-agro-blue">{region}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{t('weather')}</h2>
        </div>
        <CloudRain className="h-8 w-8 text-agro-blue" aria-hidden="true" />
      </div>

      {fallbackActive && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {t('networkFallback')}
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric label={t('rainChance')} value={`${headline.rainChance}%`} tone={headline.rainChance > 70 ? 'green' : 'blue'} />
        <Risk label={t('heatRisk')} value={headline.heatRisk} />
        <Risk label={t('stormRisk')} value={headline.stormRisk} />
      </div>

      <div className="mt-4 rounded-lg bg-sky-50 p-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <SunMedium className="h-4 w-4 text-yellow-600" aria-hidden="true" />
          {t('cropAction')}
        </div>
        <p className="mt-1 text-sm text-slate-700">{t(headline.action)}</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {days.slice(1).map((day) => (
          <div key={day.day} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
            <span className="font-semibold text-slate-800">{t(day.day)}</span>
            <span className={day.stormRisk === 'critical' ? 'font-bold text-red-700' : 'font-bold text-green-700'}>
              {day.rainfallMm} mm
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'green' | 'blue' }) {
  return (
    <div className={tone === 'green' ? 'rounded-lg bg-green-100 p-3' : 'rounded-lg bg-sky-100 p-3'}>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <p className={tone === 'green' ? 'mt-1 text-2xl font-black text-green-800' : 'mt-1 text-2xl font-black text-sky-800'}>
        {value}
      </p>
    </div>
  );
}

function Risk({ label, value }: { label: string; value: RiskLevel }) {
  const { t } = useTranslation();
  return (
    <div className={`rounded-lg border p-3 ${riskClass[value]}`}>
      <div className="flex items-center gap-1 text-xs font-semibold">
        {value !== 'safe' && <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />}
        {label}
      </div>
      <p className="mt-1 text-lg font-black">{t(value)}</p>
    </div>
  );
}
