import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, Upload, Phone, MapPin, Volume2, VolumeX, ShieldAlert, CheckCircle, Info, Trash2 } from 'lucide-react';
import { diagnoseCropDisease, type DiseaseDiagnosis } from '../services/aiService';
import { fetchNearbyPesticideShops, type PesticideShop } from '../services/mapService';
import { defaultProfile, type FarmerProfile } from '../services/storageService';

export default function PestScanner({ profile = defaultProfile }: { profile?: FarmerProfile }) {
  const { t, i18n } = useTranslation();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [diagnosis, setDiagnosis] = useState<DiseaseDiagnosis | null>(null);
  const [shops, setShops] = useState<PesticideShop[]>([]);
  const [ttsActive, setTtsActive] = useState(false);

  // Clean up URL object on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      window.speechSynthesis?.cancel();
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      // Clear old diagnosis on new upload
      setDiagnosis(null);
      setShops([]);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setDiagnosis(null);
    setShops([]);
  };

  const handleDiagnose = async () => {
    if (!image) return;
    setLoading(true);
    setDiagnosis(null);
    setShops([]);
    window.speechSynthesis?.cancel();
    setTtsActive(false);

    try {
      // 1. Run AI diagnosis (falling back to smart local heuristics if no key)
      const diagResult = await diagnoseCropDisease(
        image,
        description,
        i18n.language,
        profile.cropType
      );
      setDiagnosis(diagResult);

      // 2. Lookup pesticide shops near farmer's village
      const shopsResult = await fetchNearbyPesticideShops(profile.village, i18n.language, profile.latitude, profile.longitude);
      setShops(shopsResult);
    } catch {
      // Diagnostic failure
    } finally {
      setLoading(false);
    }
  };

  const speakDiagnosis = () => {
    if (!window.speechSynthesis || !diagnosis) return;

    if (ttsActive) {
      window.speechSynthesis.cancel();
      setTtsActive(false);
      return;
    }

    const textToSpeak = `${t('diseaseName')}: ${diagnosis.disease}. ${t('severity')}: ${t(diagnosis.severity)}. ${t('preventiveMeasures')}: ${diagnosis.preventiveMeasures}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

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
    <section className="space-y-4">
      {/* Input panel */}
      <div className="glass-card rounded-2xl border border-sky-100 p-5 shadow-premium">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-sm">
              <Bug className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{t('pestsDiagnostics')}</h2>
              <p className="text-xs font-semibold text-slate-500">{t('pestsDiagnosticsSubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* File Picker */}
          <div>
            {!imagePreview ? (
              <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50">
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="mt-2 text-sm font-bold text-slate-600">{t('uploadPhoto')}</span>
                <span className="mt-1 text-xs text-slate-400">PNG, JPG, Camera snap</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="scanner-container relative h-48 rounded-2xl border border-slate-200 bg-black overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Crop preview"
                  className="h-full w-full object-contain"
                />
                {loading && <div className="scanner-line"></div>}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={loading}
                  className="absolute bottom-2 right-2 rounded-lg bg-red-600 p-2 text-white shadow-sm transition disabled:bg-slate-400"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Symptom descriptions */}
          <div className="flex flex-col justify-between gap-3">
            <label className="block text-sm font-black text-slate-700">
              {t('selectSymptom')}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('symptomsPlaceholder')}
                disabled={loading}
                className="tap-target mt-1.5 w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-semibold text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                rows={4}
              />
            </label>

            <button
              type="button"
              onClick={handleDiagnose}
              disabled={!image || loading}
              className="tap-target w-full rounded-xl bg-gradient-to-br from-rose-600 to-red-600 px-4 py-3 font-black text-white shadow-md transition hover:from-rose-700 hover:to-red-700 disabled:from-slate-200 disabled:to-slate-300 disabled:shadow-none"
            >
              {loading ? t('diagnosingLoader') : t('diagnoseButton')}
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics outcome */}
      {diagnosis && (
        <div className="glass-card rounded-2xl border border-sky-100 p-5 shadow-premium">
          <div className="flex items-start justify-between gap-3 border-b border-sky-100/50 pb-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
                diagnosis.severity === 'critical' ? 'bg-red-600' : diagnosis.severity === 'warning' ? 'bg-amber-500' : 'bg-emerald-600'
              }`}>
                {diagnosis.severity === 'critical' ? <ShieldAlert className="h-5 w-5" /> : diagnosis.severity === 'warning' ? <Info className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">{t('diseaseName')}</p>
                <h3 className="text-lg font-black text-slate-900">{diagnosis.disease}</h3>
              </div>
            </div>
            <button
              type="button"
              onClick={speakDiagnosis}
              className={`tap-target flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                ttsActive
                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              aria-label="Speak diagnosis"
            >
              {ttsActive ? <VolumeX className="h-5 w-5 animate-pulse" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>

          <div className="mt-4">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider bg-slate-100">
              <span className={`h-2.5 w-2.5 rounded-full ${
                diagnosis.severity === 'critical' ? 'bg-red-600' : diagnosis.severity === 'warning' ? 'bg-amber-500' : 'bg-emerald-600'
              }`}></span>
              {t(diagnosis.severity)}
            </div>
            <h4 className="mt-4 text-sm font-black uppercase tracking-wider text-slate-600">{t('preventiveMeasures')}</h4>
            <p className="mt-2 text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-line">
              {diagnosis.preventiveMeasures}
            </p>
          </div>
        </div>
      )}

      {/* Pesticide shops section */}
      {shops.length > 0 && (
        <div className="glass-card rounded-2xl border border-sky-100 p-5 shadow-premium">
          <h3 className="text-lg font-black text-slate-900 border-b border-sky-100/50 pb-3">{t('nearbyShops')}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {shops.map((shop, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-4 flex flex-col justify-between ${
                  shop.status === 'open'
                    ? 'border-emerald-100 bg-emerald-50/20'
                    : 'border-slate-100 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-slate-900 leading-tight">{shop.name}</h4>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-xs font-black text-slate-600 shadow-sm">
                      {shop.distance}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{shop.address}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${
                      shop.status === 'open' ? 'bg-emerald-600' : 'bg-slate-400'
                    }`}></span>
                    <span className="text-xs font-bold text-slate-600">
                      {shop.status === 'open' ? t('availableToday') : t('bookReady')}
                    </span>
                    <span className="text-xs font-bold text-slate-400">· {shop.rating} ★</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                  <a
                    href={shop.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-target flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 text-xs font-black text-white shadow-sm"
                  >
                    <MapPin className="h-4 w-4" />
                    {t('getDirections')}
                  </a>
                  <a
                    href={`tel:${shop.phone}`}
                    className="tap-target flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                    aria-label="Call shop"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
