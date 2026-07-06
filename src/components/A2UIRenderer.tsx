import { useTranslation } from 'react-i18next';
import FinanceRadar, { type FinanceRadarProps } from './FinanceRadar';
import PestScanner from './PestScanner';
import WeatherCard, { type WeatherCardProps } from './WeatherCard';

type TrustedNode =
  | { type: 'WeatherCard'; props: WeatherCardProps }
  | { type: 'FinanceRadar'; props: FinanceRadarProps }
  | { type: 'PestScanner'; props: Record<string, never> };

interface A2UIRendererProps {
  nodes: unknown[];
}

const allowedProps: Record<TrustedNode['type'], string[]> = {
  WeatherCard: ['region', 'days', 'fallbackActive'],
  FinanceRadar: ['registry'],
  PestScanner: []
};

const unsafeKeys = new Set(['dangerouslySetInnerHTML', 'script', 'style', 'href', 'srcDoc']);

function hasExecutableShape(value: unknown): boolean {
  if (typeof value === 'function') return true;
  if (typeof value === 'string') {
    return /<script|javascript:|onerror=|onload=|eval\(|new Function/i.test(value);
  }
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value as Record<string, unknown>).some(([key, child]) => {
    if (unsafeKeys.has(key) || /^on[A-Z]/.test(key)) return true;
    return hasExecutableShape(child);
  });
}

function sanitizeNode(node: unknown): TrustedNode | null {
  if (!node || typeof node !== 'object' || hasExecutableShape(node)) return null;
  const record = node as { type?: unknown; props?: unknown };
  if (record.type !== 'WeatherCard' && record.type !== 'FinanceRadar' && record.type !== 'PestScanner') return null;
  if (!record.props || typeof record.props !== 'object' || Array.isArray(record.props)) return null;

  const type = record.type;
  const propKeys = Object.keys(record.props);
  if (propKeys.some((key) => !allowedProps[type].includes(key))) return null;

  if (type === 'PestScanner') return { type: 'PestScanner', props: {} };
  return record as TrustedNode;
}

export default function A2UIRenderer({ nodes }: A2UIRendererProps) {
  const { t } = useTranslation();
  const trusted = nodes.map(sanitizeNode);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-field">
      <h2 className="text-xl font-bold text-slate-950">{t('trustedLayout')}</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {trusted.map((node, index) => {
          if (!node) {
            return (
              <div key={`rejected-${index}`} className="rounded-lg border border-red-300 bg-red-50 p-3 font-bold text-red-700">
                {t('a2uiRejected')}
              </div>
            );
          }
          if (node.type === 'WeatherCard') return <WeatherCard key={`weather-${index}`} {...node.props} />;
          if (node.type === 'FinanceRadar') return <FinanceRadar key={`finance-${index}`} {...node.props} />;
          return <PestScanner key={`pest-${index}`} />;
        })}
      </div>
    </section>
  );
}
