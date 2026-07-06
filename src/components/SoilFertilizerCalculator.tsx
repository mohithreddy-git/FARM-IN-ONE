import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Sprout, Leaf, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { type FarmerProfile } from '../services/storageService';

export default function SoilFertilizerCalculator({ profile }: { profile: FarmerProfile }) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState(profile.cropType || 'Paddy');
  const [area, setArea] = useState(profile.farmlandArea || 2);
  const [soilType, setSoilType] = useState<'alluvial' | 'black' | 'red' | 'laterite'>('alluvial');
  const [ttsActive, setTtsActive] = useState(false);

  // Compute recommendations (50kg bags)
  let ureaPerAcre = 1.2;
  let dapPerAcre = 1.0;
  let mopPerAcre = 0.8;

  const cropLower = crop.toLowerCase();
  if (cropLower.includes('cotton') || cropLower.includes('कपास') || cropLower.includes('పత్తి') || cropLower.includes('பருத்தி') || cropLower.includes('कापूस')) {
    ureaPerAcre = 1.5;
    dapPerAcre = 1.2;
    mopPerAcre = 1.0;
  } else if (cropLower.includes('chilli') || cropLower.includes('chili') || cropLower.includes('मिर्च') || cropLower.includes('మిర్చి') || cropLower.includes('மிளகாய்') || cropLower.includes('मिरची')) {
    ureaPerAcre = 1.8;
    dapPerAcre = 1.4;
    mopPerAcre = 1.2;
  } else if (cropLower.includes('paddy') || cropLower.includes('rice') || cropLower.includes('धान') || cropLower.includes('వరి') || cropLower.includes('நெல்') || cropLower.includes('भात')) {
    ureaPerAcre = 1.3;
    dapPerAcre = 1.0;
    mopPerAcre = 0.7;
  } else if (cropLower.includes('corn') || cropLower.includes('maize') || cropLower.includes('मक्का') || cropLower.includes('మొక్కజొన్న') || cropLower.includes('சோளம்') || cropLower.includes('मका')) {
    ureaPerAcre = 1.4;
    dapPerAcre = 0.9;
    mopPerAcre = 0.6;
  } else if (cropLower.includes('wheat') || cropLower.includes('गेहूं') || cropLower.includes('గోధుమ') || cropLower.includes('கோதுமை') || cropLower.includes('गहू')) {
    ureaPerAcre = 1.2;
    dapPerAcre = 0.8;
    mopPerAcre = 0.5;
  } else if (cropLower.includes('tomato') || cropLower.includes('टमाटर') || cropLower.includes('టమోటా') || cropLower.includes('தக்காளி') || cropLower.includes('टोमॅटो')) {
    ureaPerAcre = 1.6;
    dapPerAcre = 1.3;
    mopPerAcre = 1.1;
  }

  // Adjustments based on soil type
  if (soilType === 'black') {
    // Rich in potash, reduce MOP
    mopPerAcre *= 0.8;
  } else if (soilType === 'red') {
    // Nitrogen & phosphorus deficient
    ureaPerAcre *= 1.15;
    dapPerAcre *= 1.15;
  } else if (soilType === 'laterite') {
    // Acidic, low fertility
    dapPerAcre *= 1.1;
    ureaPerAcre *= 1.1;
  }

  const totalUrea = Math.max(0, area * ureaPerAcre);
  const totalDap = Math.max(0, area * dapPerAcre);
  const totalMop = Math.max(0, area * mopPerAcre);

  const speakAdvice = () => {
    if (!window.speechSynthesis) return;

    if (ttsActive) {
      window.speechSynthesis.cancel();
      setTtsActive(false);
      return;
    }

    // Generate plain-text guidance for TTS
    const adviceText = `${t('fertilizerCalcTitle')}. ${t('crop')}: ${t(crop)}. ${t('area')}: ${area} ${t('expectedYieldLabel')}. ${t('soilType')}: ${t(soilType)}. ${t('ureaBags')}: ${totalUrea.toFixed(1)}. ${t('dapBags')}: ${totalDap.toFixed(1)}. ${t('mopBags')}: ${totalMop.toFixed(1)}. ${t('fertilizerAdvice')}`;
    
    const utterance = new SpeechSynthesisUtterance(adviceText);
    
    // Set matching TTS voice language
    const voices = window.speechSynthesis.getVoices();
    const langMapping: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      mr: 'mr-IN'
    };
    const targetLang = langMapping[profile.language] || 'en-IN';
    utterance.lang = targetLang;

    const matchedVoice = voices.find((voice) => voice.lang.includes(targetLang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      setTtsActive(false);
    };

    setTtsActive(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="glass-card rounded-2xl border border-sky-100 p-5 shadow-premium">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{t('fertilizerCalcTitle')}</h2>
            <p className="text-xs font-semibold text-slate-500">{t('fertilizerCalcSubtitle')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={speakAdvice}
          className={`tap-target flex h-10 w-10 items-center justify-center rounded-lg border transition ${
            ttsActive
              ? 'bg-rose-50 text-rose-600 border-rose-100'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
          aria-label="Speak advice"
        >
          {ttsActive ? <VolumeX className="h-5 w-5 animate-pulse" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-black text-slate-700">
          {t('crop')}
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="tap-target mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Paddy">{t('Paddy')}</option>
            <option value="Cotton">{t('Cotton')}</option>
            <option value="Red chilli">{t('Red chilli')}</option>
            <option value="Corn">{t('Corn')}</option>
            <option value="Wheat">{t('Wheat')}</option>
            <option value="Tomato">{t('Tomato')}</option>
          </select>
        </label>

        <label className="block text-sm font-black text-slate-700">
          {t('area')}
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={area}
            onChange={(e) => setArea(Number(e.target.value) || 0)}
            className="tap-target mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        <label className="block text-sm font-black text-slate-700">
          {t('soilType')}
          <select
            value={soilType}
            onChange={(e) => setSoilType(e.target.value as any)}
            className="tap-target mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="alluvial">{t('alluvial')}</option>
            <option value="black">{t('black')}</option>
            <option value="red">{t('red')}</option>
            <option value="laterite">{t('laterite')}</option>
          </select>
        </label>
      </div>

      <div className="mt-6 border-t border-sky-100/50 pt-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-indigo-700">{t('fertilizerResult')}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-center">
            <Leaf className="mx-auto h-7 w-7 text-indigo-600" />
            <p className="mt-2 text-xs font-bold text-slate-500">{t('ureaBags')}</p>
            <p className="mt-1 text-3xl font-black text-indigo-900">{totalUrea.toFixed(1)}</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-center">
            <Sprout className="mx-auto h-7 w-7 text-emerald-600" />
            <p className="mt-2 text-xs font-bold text-slate-500">{t('dapBags')}</p>
            <p className="mt-1 text-3xl font-black text-emerald-900">{totalDap.toFixed(1)}</p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 text-center">
            <Leaf className="mx-auto h-7 w-7 text-amber-600" />
            <p className="mt-2 text-xs font-bold text-slate-500">{t('mopBags')}</p>
            <p className="mt-1 text-3xl font-black text-amber-900">{totalMop.toFixed(1)}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-indigo-50/80 border border-indigo-100/30 p-4 flex gap-3 items-start">
        <HelpCircle className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-indigo-950 leading-relaxed">
          {t('fertilizerAdvice')}
        </p>
      </div>
    </section>
  );
}
