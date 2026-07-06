import {
  Apple,
  BadgeIndianRupee,
  Bell,
  Calculator,
  CloudRain,
  Droplets,
  Facebook,
  Home,
  Languages,
  Leaf,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sprout,
  Store,
  Tractor,
  UserRound,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  MessageSquareCode
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FinanceRadar from './components/FinanceRadar';
import PestScanner from './components/PestScanner';
import WeatherCard from './components/WeatherCard';
import AIAssistant from './components/AIAssistant';
import SoilFertilizerCalculator from './components/SoilFertilizerCalculator';
import { languageOptions } from './i18n/config';
import {
  fetchEquipmentListings,
  fetchFinanceRegistry,
  fetchMandiTrends,
  type EquipmentListing,
  type FinanceRegistry,
  type MandiTrend
} from './services/financialService';
import {
  clearPersistedState,
  defaultProfile,
  loadPersistedState,
  savePersistedState,
  type AuthMethod,
  type AuthSession,
  type FarmerProfile
} from './services/storageService';
import { fetchSevenDayRainfallMatrix, type WeatherMatrix } from './services/weatherService';
import { lookupHydrologyMetrics, type WrisHydrologyMetrics } from './services/wrisWaterService';
import { getGeminiApiKey, saveGeminiApiKey } from './services/aiService';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type View =
  | 'dashboard'
  | 'money'
  | 'weather'
  | 'water'
  | 'pests'
  | 'market'
  | 'equipment'
  | 'yield'
  | 'settings'
  | 'assistant'
  | 'soil';

export default function App() {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState(loadPersistedState);
  const [profileDraft, setProfileDraft] = useState<FarmerProfile>(() => state.profile ?? defaultProfile);
  const [identifier, setIdentifier] = useState('');
  const [view, setView] = useState<View>('dashboard');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [weather, setWeather] = useState<WeatherMatrix | null>(null);
  const [water, setWater] = useState<WrisHydrologyMetrics | null>(null);
  const [finance, setFinance] = useState<FinanceRegistry | null>(null);
  const [mandi, setMandi] = useState<MandiTrend[]>([]);
  const [equipment, setEquipment] = useState<EquipmentListing[]>([]);
  const [fallbackActive, setFallbackActive] = useState(false);

  useEffect(() => {
    savePersistedState(state);
  }, [state]);

  useEffect(() => {
    if (state.profile?.language) {
      void i18n.changeLanguage(state.profile.language);
    }
  }, [i18n, state.profile?.language]);

  useEffect(() => {
    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  const loadData = async () => {
    try {
      setFallbackActive(false);
      const region = state.profile?.village || 'Local block';
      const lat = state.profile?.latitude;
      const lon = state.profile?.longitude;
      const [weatherData, waterData, financeData, mandiData, equipmentData] = await Promise.all([
        fetchSevenDayRainfallMatrix(region),
        lookupHydrologyMetrics(region, lat, lon),
        fetchFinanceRegistry(),
        fetchMandiTrends(),
        fetchEquipmentListings()
      ]);
      setWeather(weatherData);
      setWater(waterData);
      setFinance(financeData);
      setMandi(mandiData);
      setEquipment(equipmentData);
    } catch {
      setFallbackActive(true);
      const [weatherData, waterData, financeData] = await Promise.all([
        fetchSevenDayRainfallMatrix('Local block'),
        lookupHydrologyMetrics('Local block'),
        fetchFinanceRegistry()
      ]);
      setWeather(weatherData);
      setWater(waterData);
      setFinance(financeData);
    }
  };

  useEffect(() => {
    if (state.auth && state.profile) {
      void loadData();
    }
  }, [state.auth, state.profile]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view, state.auth, state.profile]);

  const signIn = (method: AuthMethod) => {
    const session: AuthSession = {
      method,
      identifier: identifier.trim() || `${method}-farmer`,
      signedInAt: new Date().toISOString()
    };
    setState((current) => ({ ...current, auth: session }));
  };

  const saveProfile = (profile: FarmerProfile) => {
    const cleanProfile = { ...profile, farmlandArea: Number(profile.farmlandArea) || 0 };
    setState((current) => ({ ...current, profile: cleanProfile }));
    setProfileDraft(cleanProfile);
    void i18n.changeLanguage(cleanProfile.language);
    setView('dashboard');
  };

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice.catch(() => undefined);
    setInstallPrompt(null);
  };

  // Localized sections
  const dashboardSections = useMemo(() => {
    return [
      { view: 'assistant' as View, title: t('aiAssistantTitle'), subtitle: t('aiAssistantSubtitle'), icon: MessageSquareCode, color: 'border-blue-200 bg-blue-50/60 hover:bg-blue-50 text-blue-950' },
      { view: 'pests' as View, title: t('pestsDiagnostics'), subtitle: t('pestsDiagnosticsSubtitle'), icon: Sprout, color: 'border-rose-200 bg-rose-50/60 hover:bg-rose-50 text-rose-950' },
      { view: 'soil' as View, title: t('fertilizerCalcTitle'), subtitle: t('fertilizerCalcSubtitle'), icon: Leaf, color: 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-950' },
      { view: 'money' as View, title: t('finance'), subtitle: t('readOnlyFinance'), icon: BadgeIndianRupee, color: 'border-amber-200 bg-amber-50/60 hover:bg-amber-50 text-amber-950' },
      { view: 'weather' as View, title: t('weather'), subtitle: t('tagline'), icon: CloudRain, color: 'border-sky-200 bg-sky-50/60 hover:bg-sky-50 text-sky-950' },
      { view: 'water' as View, title: t('waterSoil'), subtitle: t('soilAdvice'), icon: Droplets, color: 'border-blue-200 bg-blue-50/60 hover:bg-blue-50 text-blue-950' },
      { view: 'market' as View, title: t('mandiPrices'), subtitle: t('sell'), icon: Store, color: 'border-teal-200 bg-teal-50/60 hover:bg-teal-50 text-teal-950' },
      { view: 'equipment' as View, title: t('machineryShare'), subtitle: t('availableToday'), icon: Tractor, color: 'border-cyan-200 bg-cyan-50/60 hover:bg-cyan-50 text-cyan-950' },
      { view: 'yield' as View, title: t('yieldCalculator'), subtitle: t('calculate'), icon: Calculator, color: 'border-purple-200 bg-purple-50/60 hover:bg-purple-50 text-purple-950' },
      { view: 'settings' as View, title: t('settingsTitle'), subtitle: t('settingsSubtitle'), icon: Settings, color: 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 text-slate-950' }
    ];
  }, [t]);

  if (!state.auth) {
    return <SignInScreen identifier={identifier} setIdentifier={setIdentifier} signIn={signIn} isOnline={isOnline} />;
  }

  if (!state.profile) {
    return <ProfileScreen profile={profileDraft} setProfile={setProfileDraft} saveProfile={saveProfile} title={t('profileSetupTitle')} />;
  }

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-sky-100/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button type="button" onClick={() => setView('dashboard')} className="text-left focus:outline-none">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">{t('appName')}</p>
            <h1 className="text-lg font-black text-slate-950">
              {t('hiFarmer', { name: state.profile.name || 'Farmer' })}
            </h1>
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-800 sm:inline-flex">
              {t(state.profile.cropType)} · {state.profile.farmlandArea} {t('area')}
            </span>
            <button
              type="button"
              onClick={() => setView('settings')}
              className="tap-target rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {installPrompt && (
          <button
            type="button"
            onClick={() => void installApp()}
            className="mb-4 w-full rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-4 text-left font-black text-white shadow-md animate-pulse-subtle"
          >
            {t('install')}
          </button>
        )}

        {/* Connectivity details */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black border ${
            isOnline ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {isOnline ? t('online') : t('offline')}
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            className="tap-target inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-black text-white shadow-sm transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t('refresh')}
          </button>
        </div>

        {/* Views */}
        {view === 'dashboard' && (
          <Dashboard
            profile={state.profile}
            setView={setView}
            weather={weather}
            water={water}
            finance={finance}
            mandi={mandi}
            equipment={equipment}
            sections={dashboardSections}
          />
        )}
        {view === 'money' && finance && <MoneyDetail registry={finance} mandi={mandi} equipment={equipment} />}
        {view === 'weather' && weather && <WeatherCard region={weather.region} days={weather.days} fallbackActive={fallbackActive} />}
        {view === 'water' && water && <WaterSoilPanel water={water} />}
        {view === 'pests' && <PestScanner profile={state.profile} />}
        {view === 'market' && <MandiPanel trends={mandi} expanded />}
        {view === 'equipment' && <EquipmentPanel listings={equipment} expanded />}
        {view === 'yield' && <YieldCalculator profile={state.profile} />}
        {view === 'assistant' && <AIAssistant />}
        {view === 'soil' && <SoilFertilizerCalculator profile={state.profile} />}
        {view === 'settings' && (
          <SettingsScreen
            profile={state.profile}
            auth={state.auth}
            saveProfile={saveProfile}
            signOut={() => {
              clearPersistedState();
              setState({ auth: null, profile: null });
              setView('dashboard');
            }}
          />
        )}
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/60 bg-white/95 backdrop-blur-md shadow-lg">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 py-2">
          <TabButton active={view === 'dashboard'} label={t('tabHome')} icon={Home} onClick={() => setView('dashboard')} />
          <TabButton active={view === 'assistant'} label={t('tabAssistant')} icon={MessageSquareCode} onClick={() => setView('assistant')} />
          <TabButton active={view === 'pests'} label={t('pests')} icon={Sprout} onClick={() => setView('pests')} />
          <TabButton active={view === 'soil'} label={t('tabSoil')} icon={Leaf} onClick={() => setView('soil')} />
          <TabButton active={view === 'money'} label={t('tabMoney')} icon={BadgeIndianRupee} onClick={() => setView('money')} />
        </div>
      </nav>
    </main>
  );
}

// Sign In Component
function SignInScreen({
  identifier,
  setIdentifier,
  signIn,
  isOnline
}: {
  identifier: string;
  setIdentifier: (value: string) => void;
  signIn: (method: AuthMethod) => void;
  isOnline: boolean;
}) {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4 py-8">
      <section className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-6 shadow-premium">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
          <Sprout className="h-9 w-9" />
        </div>
        <h1 className="mt-5 text-center text-3xl font-black text-slate-900 tracking-tight">{t('appName')}</h1>
        <p className="mt-2 text-center text-sm font-semibold text-slate-500">{t('signInTitle')}</p>
        <div className={`mt-4 rounded-xl border p-3 text-center text-xs font-bold ${
          isOnline ? 'bg-sky-50 border-sky-100 text-sky-800' : 'bg-amber-50 border-amber-100 text-amber-800'
        }`}>
          {isOnline ? t('signInOnline') : t('signInOffline')}
        </div>
        <label className="mt-6 block text-xs font-black uppercase tracking-wider text-slate-500" htmlFor="signin-id">
          {t('mobileOrEmail')}
        </label>
        <input
          id="signin-id"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          className="tap-target mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={t('mobilePlaceholder')}
        />
        <div className="mt-5 grid gap-2">
          {signInMethods(t).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.method}
                type="button"
                onClick={() => signIn(item.method)}
                className={`tap-target inline-flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-black shadow-sm transition hover:opacity-95 ${item.tone}`}
              >
                <Icon className="h-5 w-5" />
                {t('continueWith')} {item.label}
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

const signInMethods = (t: any) => [
  { method: 'mobile' as AuthMethod, label: t('signInMethodOTP'), icon: Phone, tone: 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white' },
  { method: 'google' as AuthMethod, label: t('signInMethodGoogle'), icon: Mail, tone: 'bg-white text-slate-800 border border-slate-200' },
  { method: 'apple' as AuthMethod, label: t('signInMethodApple'), icon: Mail, tone: 'bg-slate-950 text-white' },
  { method: 'facebook' as AuthMethod, label: t('signInMethodFacebook'), icon: Facebook, tone: 'bg-blue-600 text-white' }
];

// Profile setup screen
function ProfileScreen({
  profile,
  setProfile,
  saveProfile,
  title
}: {
  profile: FarmerProfile;
  setProfile: (profile: FarmerProfile) => void;
  saveProfile: (profile: FarmerProfile) => void;
  title: string;
}) {
  const { t } = useTranslation();
  const canSave = profile.name.trim().length > 1 && profile.cropType.trim().length > 1 && Number(profile.farmlandArea) > 0;
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4 py-8">
      <section className="w-full max-w-2xl rounded-3xl border border-sky-100 bg-white p-6 shadow-premium">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">{t('profileSetupSubtitle')}</p>
        <ProfileForm profile={profile} setProfile={setProfile} />
        <button
          type="button"
          disabled={!canSave}
          onClick={() => saveProfile(profile)}
          className="tap-target mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 font-black text-white shadow-md transition disabled:from-slate-200 disabled:to-slate-300 disabled:shadow-none"
        >
          {t('saveAndOpen')}
        </button>
      </section>
    </main>
  );
}
function GPSDetector({
  profile,
  update
}: {
  profile: FarmerProfile;
  update: <K extends keyof FarmerProfile>(key: K, value: FarmerProfile[K]) => void;
}) {
  const { t } = useTranslation();
  const [searching, setSearching] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [success, setSuccess] = useState(false);

  const detect = () => {
    if (!navigator.geolocation) {
      setStatusText(t('aiSpeechUnsupported'));
      return;
    }
    setSearching(true);
    setStatusText(t('gpsSearching'));
    setSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        update('latitude', latitude);
        update('longitude', longitude);
        update('gpsDetected', true);
        
        let placeName = profile.village;
        if (!placeName || placeName.includes('°')) {
          if (latitude > 15 && latitude < 17 && longitude > 79 && longitude < 82) {
            placeName = 'Guntur Rural';
          } else if (latitude > 18 && latitude < 20 && longitude > 73 && longitude < 75) {
            placeName = 'Pune Block';
          } else if (latitude > 12 && latitude < 14 && longitude > 79 && longitude < 81) {
            placeName = 'Salem Block';
          } else if (latitude > 28 && latitude < 29 && longitude > 76 && longitude < 78) {
            placeName = 'Delhi Outer Block';
          } else {
            placeName = 'Krishi Block';
          }
        }
        update('village', placeName);
        setSearching(false);
        setSuccess(true);
        setStatusText(t('gpsSuccess'));
        setTimeout(() => setStatusText(''), 4000);
      },
      (err) => {
        setSearching(false);
        setSuccess(false);
        setStatusText(t('gpsPermissionDenied'));
        setTimeout(() => setStatusText(''), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="mt-2 flex flex-col gap-1">
      <button
        type="button"
        onClick={detect}
        disabled={searching}
        className={`tap-target inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black tracking-wider transition ${
          success
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
        }`}
      >
        <MapPin className="h-3.5 w-3.5" />
        {t('gpsDetect')}
      </button>
      {statusText && (
        <p className={`text-[10px] font-bold ${success ? 'text-emerald-700' : 'text-amber-700'}`}>
          {statusText}
        </p>
      )}
    </div>
  );
}

function ProfileForm({ profile, setProfile }: { profile: FarmerProfile; setProfile: (profile: FarmerProfile) => void }) {
  const { t } = useTranslation();
  const update = <K extends keyof FarmerProfile>(key: K, value: FarmerProfile[K]) => setProfile({ ...profile, [key]: value });
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <Field label={t('farmerName')} value={profile.name} onChange={(value) => update('name', value)} />
      <Field label={t('mobileNumber')} value={profile.mobile} onChange={(value) => update('mobile', value)} />
      
      <div className="block text-xs font-black uppercase tracking-wider text-slate-500">
        <label className="block">
          {t('villageBlock')}
          <input
            value={profile.village}
            onChange={(event) => update('village', event.target.value)}
            className="tap-target mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
        <GPSDetector profile={profile} update={update} />
      </div>

      <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
        {t('cropType')}
        <select
          value={profile.cropType}
          onChange={(event) => update('cropType', event.target.value)}
          className="tap-target mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="Paddy">{t('Paddy')}</option>
          <option value="Cotton">{t('Cotton')}</option>
          <option value="Red chilli">{t('Red chilli')}</option>
          <option value="Corn">{t('Corn')}</option>
          <option value="Wheat">{t('Wheat')}</option>
          <option value="Tomato">{t('Tomato')}</option>
        </select>
      </label>

      <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
        {t('farmlandAreaAcres')}
        <input
          type="number"
          min="0"
          step="0.25"
          value={profile.farmlandArea}
          onChange={(event) => update('farmlandArea', Number(event.target.value))}
          className="tap-target mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </label>

      <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
        {t('languageLabel')}
        <select
          value={profile.language}
          onChange={(event) => update('language', event.target.value)}
          className="tap-target mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {languageOptions.map((language) => (
            <option key={language.code} value={language.code}>
              {language.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="tap-target mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </label>
  );
}

// Dashboard Screen
function Dashboard({
  profile,
  setView,
  weather,
  water,
  finance,
  mandi,
  equipment,
  sections
}: {
  profile: FarmerProfile;
  setView: (view: View) => void;
  weather: WeatherMatrix | null;
  water: WrisHydrologyMetrics | null;
  finance: FinanceRegistry | null;
  mandi: MandiTrend[];
  equipment: EquipmentListing[];
  sections: Array<{ view: View; title: string; subtitle: string; icon: any; color: string }>;
}) {
  const { t } = useTranslation();
  const bestLoan = finance?.loans.find((loan) => loan.risk === 'safe');
  const rainChance = weather?.days[0]?.rainChance ?? 0;
  const sellCount = mandi.filter((trend) => trend.recommendation === 'sell').length;
  const availableEquipment = equipment.filter((item) => item.availableToday).length;

  return (
    <div className="space-y-5">
      {/* Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-800 to-emerald-700 p-5 text-white shadow-premium">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-sky-200">{profile.village || 'Local block'}</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">{t(profile.cropType)} {t('dashboardTitle')}</h2>
            <p className="mt-1.5 text-sm font-medium text-sky-100">{profile.farmlandArea} {t('dashboardSubtitle')}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
            <Bell className="h-6 w-6 text-white" />
          </div>
        </div>
      </section>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickStat label={t('rainToday')} value={`${rainChance}%`} tone="blue" />
        <QuickStat label={t('bestLoan')} value={bestLoan ? `${bestLoan.annualRatePercent}%` : '4%'} tone="green" />
        <QuickStat label={t('sellSignals')} value={`${sellCount}`} tone="yellow" />
        <QuickStat label={t('toolsNearby')} value={`${availableEquipment}`} tone="blue" />
      </div>

      {/* Main Sections Navigation Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.view}
              type="button"
              onClick={() => setView(section.view)}
              className={`flex flex-col justify-between aspect-square rounded-2xl border p-4 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${section.color}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="mt-4 text-md font-black leading-snug">{section.title}</h3>
                <p className="mt-1 text-[10px] font-bold opacity-75 line-clamp-2 leading-normal">{section.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {water && <WaterSoilPanel water={water} compact />}
    </div>
  );
}

function QuickStat({ label, value, tone }: { label: string; value: string; tone: 'green' | 'blue' | 'yellow' }) {
  const colors = {
    blue: 'bg-sky-50 border border-sky-100 text-sky-950',
    green: 'bg-emerald-50 border border-emerald-100 text-emerald-950',
    yellow: 'bg-amber-50 border border-amber-100 text-amber-950'
  };
  const valColors = {
    blue: 'text-sky-800',
    green: 'text-emerald-800',
    yellow: 'text-amber-800'
  };

  return (
    <div className={`rounded-2xl p-4 ${colors[tone]}`}>
      <p className="text-xs font-black text-slate-500">{label}</p>
      <p className={`mt-1.5 text-2xl font-black ${valColors[tone]}`}>{value}</p>
    </div>
  );
}

// Money Detail view
function MoneyDetail({ registry, mandi, equipment }: { registry: FinanceRegistry; mandi: MandiTrend[]; equipment: EquipmentListing[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FinanceRadar registry={registry} />
      <OptionPanel
        title={t('moneyOptions')}
        options={[
          [t('lowestInterestLoan'), t('compareKcc')],
          [t('machineryCost'), t('lowestListedRent', { rate: Math.min(...equipment.map((item) => item.hourlyRate)) })],
          [t('cropPrices'), t('cropsWithSellSignals', { count: mandi.filter((item) => item.recommendation === 'sell').length })],
          [t('insuranceCheck'), t('trackWeatherRisk')],
          [t('inputBudget'), t('compareNeem')],
          [t('repaymentCalendar'), t('planReminders')]
        ]}
      />
    </div>
  );
}

function OptionPanel({ title, options }: { title: string; options: Array<[string, string]> }) {
  return (
    <section className="glass-card rounded-2xl border border-sky-100 p-5 shadow-premium">
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
      <div className="mt-4 grid gap-2">
        {options.map(([heading, body], index) => (
          <button key={heading} type="button" className="tap-target rounded-xl border border-slate-100 bg-white p-4.5 text-left transition hover:bg-slate-50/50">
            <p className="font-black text-slate-900">{index + 1}. {heading}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500 leading-relaxed">{body}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

// Water soil panel
function WaterSoilPanel({ water, compact = false }: { water: WrisHydrologyMetrics; compact?: boolean }) {
  const { t } = useTranslation();
  const waterCritical = water.status === 'critical';
  return (
    <section className="glass-card rounded-2xl border border-sky-100 p-5 shadow-premium">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{water.block}</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">{t('waterSoil')}</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
          <Droplets className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatusTile label={t('groundwater')} value={`${water.groundwaterDepthMeters} m`} critical={waterCritical} />
        <StatusTile label={t('reservoir')} value={`${water.reservoirCapacityPercent}%`} critical={water.reservoirCapacityPercent < 35} />
        {!compact && <StatusTile label={t('canalRelease')} value={`${water.canalReleaseCusecs}`} critical={water.canalReleaseCusecs < 60} />}
        {!compact && <StatusTile label={t('soilMoisture')} value={`${water.soilMoisturePercent}%`} critical={water.soilMoisturePercent < 25} />}
      </div>
      <p className={`mt-4 rounded-xl p-4 text-sm font-semibold leading-relaxed ${
        waterCritical ? 'bg-red-50 border border-red-100 text-red-900' : 'bg-emerald-50 border border-emerald-100 text-emerald-950'
      }`}>
        {waterCritical ? t('soilAdvice') : t('irrigationAdvice')}
      </p>
    </section>
  );
}

function StatusTile({ label, value, critical }: { label: string; value: string; critical: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${critical ? 'bg-red-50 text-red-950' : 'bg-sky-50/50 text-sky-950'}`}>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className={`mt-1.5 text-2xl font-black ${critical ? 'text-red-700' : 'text-sky-800'}`}>{value}</p>
    </div>
  );
}

// Mandi panel
function MandiPanel({ trends, expanded = false }: { trends: MandiTrend[]; expanded?: boolean }) {
  const { t } = useTranslation();
  return (
    <section className="glass-card rounded-2xl border border-sky-100 p-5 shadow-premium">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">{t('mandiPrices')}</h2>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Store className="h-5 w-5" />
        </div>
      </div>
      <div className={expanded ? 'mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3' : 'mt-4 space-y-2'}>
        {trends.map((trend) => (
          <div key={trend.crop} className={`rounded-2xl border p-4 ${
            trend.recommendation === 'sell' ? 'border-emerald-100 bg-emerald-50/20' : 'border-amber-100 bg-amber-50/20'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-black text-slate-900">{t(trend.crop)}</p>
              <p className={`font-black text-sm ${trend.sevenDayChangePercent > 0 ? 'text-emerald-800' : 'text-amber-800'}`}>
                {trend.sevenDayChangePercent > 0 ? '+' : ''}{trend.sevenDayChangePercent}%
              </p>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-500">{t(trend.market)} · Rs {trend.pricePerQuintal}/q</p>
            <p className={`mt-3 inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
              trend.recommendation === 'sell' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {trend.recommendation === 'sell' ? t('sell') : t('hold')}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Equipment panel
function EquipmentPanel({ listings, expanded = false }: { listings: EquipmentListing[]; expanded?: boolean }) {
  const { t } = useTranslation();
  return (
    <section className="glass-card rounded-2xl border border-sky-100 p-5 shadow-premium">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">{t('machineryShare')}</h2>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
          <Tractor className="h-5 w-5" />
        </div>
      </div>
      <div className={expanded ? 'mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3' : 'mt-4 space-y-2'}>
        {listings.map((listing) => (
          <div key={listing.equipment} className={`rounded-2xl border p-4 ${
            listing.availableToday ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100 bg-slate-50/50'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-black text-slate-900">{t(listing.equipment)}</p>
              <p className="font-black text-slate-800 text-sm">Rs {listing.hourlyRate}/hr</p>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-500">{t(listing.village)} · {t('safe')} {listing.trustScore}%</p>
            <p className={`mt-3 inline-flex items-center gap-1 text-xs font-bold ${
              listing.availableToday ? 'text-emerald-800' : 'text-slate-600'
            }`}>
              {listing.availableToday && <PackageCheck className="h-3.5 w-3.5" />}
              {listing.availableToday ? t('availableToday') : t('bookReady')}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Yield calculator
function YieldCalculator({ profile }: { profile: FarmerProfile }) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState(profile.cropType || 'Paddy');
  const [area, setArea] = useState(profile.farmlandArea || 2);
  const [price, setPrice] = useState(2300);
  const baseYield = crop.toLowerCase().includes('cotton') ? 7.5 : crop.toLowerCase().includes('chilli') ? 18 : 24;
  const projected = Math.max(0, area * baseYield * 0.92);
  const revenue = projected * price;
  return (
    <section className="glass-card rounded-2xl border border-sky-100 p-5 shadow-premium">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900">{t('yieldCalculator')}</h2>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
          <Calculator className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field label={t('crop')} value={crop} onChange={setCrop} />
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
          {t('area')}
          <input type="number" min="0" step="0.25" value={area} onChange={(event) => setArea(Number(event.target.value))} className="tap-target mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </label>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
          {t('rsPerQuintal')}
          <input type="number" min="0" value={price} onChange={(event) => setPrice(Number(event.target.value))} className="tap-target mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </label>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <QuickStat label={t('expectedYieldLabel')} value={`${projected.toFixed(1)} q`} tone="green" />
        <QuickStat label={t('grossValue')} value={`Rs ${Math.round(revenue).toLocaleString('en-IN')}`} tone="blue" />
      </div>
    </section>
  );
}

// Settings Screen
function SettingsScreen({
  profile,
  auth,
  saveProfile,
  signOut
}: {
  profile: FarmerProfile;
  auth: AuthSession;
  saveProfile: (profile: FarmerProfile) => void;
  signOut: () => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(profile);
  const [apiKey, setApiKey] = useState(() => getGeminiApiKey() || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveApiKey = () => {
    saveGeminiApiKey(apiKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="glass-card rounded-2xl border border-sky-100 p-5 shadow-premium">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('settingsTitle')}</h2>
        <p className="text-sm font-semibold text-slate-500">{t('settingsSubtitle')}</p>
        
        {/* API Key management */}
        <div className="mt-5 border-b border-slate-100 pb-5">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
            {t('geminiApiKey')}
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AI_zaSy..."
              className="tap-target mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <p className="mt-1.5 text-[11px] font-semibold leading-normal text-slate-400">
            {t('apiKeyHelp')}
          </p>
          <button
            type="button"
            onClick={handleSaveApiKey}
            className="tap-target mt-3 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-black text-white"
          >
            {t('saveApiKey')}
          </button>
          {saveSuccess && (
            <span className="ml-3 text-xs font-bold text-emerald-600">{t('apiKeySaved')}</span>
          )}
        </div>

        <ProfileForm profile={draft} setProfile={setDraft} />
        
        <button
          type="button"
          onClick={() => saveProfile(draft)}
          className="tap-target mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 font-black text-white shadow-md transition"
        >
          {t('saveSettings')}
        </button>
      </section>

      <section className="glass-card rounded-2xl border border-sky-100 p-5 shadow-premium flex flex-col justify-between">
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <UserRound className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-lg font-black text-slate-900">{t('accountTitle')}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {t('signedInWith', {
              method: (() => {
                const keyMap: Record<string, string> = {
                  mobile: 'signInMethodOTP',
                  google: 'signInMethodGoogle',
                  apple: 'signInMethodApple',
                  facebook: 'signInMethodFacebook',
                  email: 'signInMethodEmail'
                };
                return t(keyMap[auth.method] || auth.method);
              })(),
              id: auth.identifier
            })}
          </p>
          <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-bold text-emerald-950 flex gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0" />
            <p className="leading-normal">{t('appDataStoredLocally')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="tap-target mt-6 w-full rounded-xl bg-red-600 hover:bg-red-700 px-4 py-3 font-black text-white shadow-sm transition"
        >
          {t('signOutAndClear')}
        </button>
      </section>
    </div>
  );
}

// Tab bar button
function TabButton({ active, label, icon: Icon, onClick }: { active: boolean; label: string; icon: any; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap-target flex flex-col items-center justify-center rounded-xl py-1 transition-all ${
        active
          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm'
          : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="mt-0.5 text-[9px] font-black tracking-wide leading-none">{label}</span>
    </button>
  );
}
