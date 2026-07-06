import { BadgeIndianRupee, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FinanceRegistry } from '../services/financialService';

export interface FinanceRadarProps {
  registry: FinanceRegistry;
}

export default function FinanceRadar({ registry }: FinanceRadarProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-lg border border-green-200 bg-white p-4 shadow-field">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-green-700">{t('readOnlyFinance')}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{t('finance')}</h2>
        </div>
        <BadgeIndianRupee className="h-8 w-8 text-green-700" aria-hidden="true" />
      </div>

      <div className="mt-4 space-y-2">
        {registry.loans.map((loan) => (
          <div
            key={loan.name}
            className={
              loan.risk === 'critical'
                ? 'rounded-lg border border-red-300 bg-red-50 p-3'
                : loan.risk === 'safe'
                  ? 'rounded-lg border border-green-300 bg-green-50 p-3'
                  : 'rounded-lg border border-yellow-300 bg-yellow-50 p-3'
            }
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-slate-900">{t(loan.name)}</p>
              <span className={loan.risk === 'critical' ? 'text-2xl font-black text-red-700' : 'text-2xl font-black text-green-800'}>
                {loan.annualRatePercent}%
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-700">
              {loan.risk === 'critical' ? <TriangleAlert className="h-4 w-4 text-red-700" /> : <ShieldCheck className="h-4 w-4 text-green-700" />}
              {t(loan.source)}
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-5 text-sm font-black uppercase tracking-wide text-slate-600">{t('organicInputs')}</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {registry.organicInputs.map((input) => (
          <div key={`${input.item}-${input.supplier}`} className={input.risk === 'critical' ? 'rounded-md bg-red-100 p-3' : 'rounded-md bg-green-100 p-3'}>
            <p className="font-bold text-slate-900">{t(input.item)}</p>
            <p className="text-sm text-slate-700">{t(input.supplier)}</p>
            <p className={input.risk === 'critical' ? 'mt-1 font-black text-red-700' : 'mt-1 font-black text-green-800'}>
              Rs {input.pricePerUnit}/{t(input.unit)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
