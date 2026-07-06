import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Sprout, AlertCircle } from 'lucide-react';
import { askGeminiAgent, isFarmingRelated } from '../services/aiService';

// Type definitions for browser speech recognition
type SpeechRecognitionResultList = {
  [index: number]: {
    [index: number]: {
      transcript: string;
    };
  };
  length: number;
};

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface WebkitSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export default function AIAssistant() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>(() => {
    // Welcome message
    return [
      {
        sender: 'bot',
        text: t('aiAssistantSubtitle')
      }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsMessage, setTtsMessage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<WebkitSpeechRecognitionInstance | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => WebkitSpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => WebkitSpeechRecognitionInstance }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Match active app language
      const langMapping: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        mr: 'mr-IN'
      };
      rec.lang = langMapping[i18n.language] || 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [i18n.language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(t('aiSpeechUnsupported'));
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis?.cancel(); // stop TTS
      setTtsMessage(null);
      
      // Update speech recognition language on start to sync with dynamic selector
      const langMapping: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        mr: 'mr-IN'
      };
      recognitionRef.current.lang = langMapping[i18n.language] || 'en-IN';
      
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
      }
    }
  };

  const handleSend = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query) return;

    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setLoading(true);

    // Stop speaking any active speech
    window.speechSynthesis?.cancel();
    setTtsMessage(null);

    // Filter agriculture questions
    if (!isFarmingRelated(query)) {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: t('aiFarmingOnly') }
      ]);
      return;
    }

    try {
      const response = await askGeminiAgent(query, i18n.language);
      setMessages((prev) => [...prev, { sender: 'bot', text: response }]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'bot', text: t('aiNoResponse') }]);
    } finally {
      setLoading(false);
    }
  };

  // Text to Speech logic
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    if (ttsMessage === text) {
      // Toggle off if clicking current playing
      window.speechSynthesis.cancel();
      setTtsMessage(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Attempt to set a native voice for the selected language
    const voices = window.speechSynthesis.getVoices();
    const langMapping: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      mr: 'mr-IN'
    };
    const targetLang = langMapping[i18n.language] || 'en-IN';
    utterance.lang = targetLang;

    const matchedVoice = voices.find((voice) => voice.lang.includes(targetLang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      setTtsMessage(null);
    };

    setTtsMessage(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="glass-card flex h-[calc(100vh-170px)] flex-col rounded-2xl border border-sky-100 shadow-premium">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-sky-100 bg-gradient-to-r from-blue-700/10 via-indigo-700/5 to-transparent p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
          <Sprout className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">{t('aiAssistantTitle')}</h2>
          <p className="text-xs font-semibold text-slate-500">{t('onlineFeatureNote')}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message bubble */}
              <div className="relative group">
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                      : 'bg-white border border-slate-100 text-slate-800'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* TTS Speaker icon on bot messages */}
                  {msg.sender === 'bot' && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.text)}
                      className={`mt-2 flex items-center gap-1 text-xs font-bold rounded-md px-2 py-1 transition ${
                        ttsMessage === msg.text 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                      }`}
                    >
                      {ttsMessage === msg.text ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                      {ttsMessage === msg.text ? t('aiAudioMute') : t('aiAudioSpeak')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading/Thinking message */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2.5 max-w-[85%]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-sky-100 bg-white/70 p-4">
        {isListening && (
          <div className="mb-3 flex items-center justify-between rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-rose-700 text-sm font-bold animate-pulse-subtle">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-rose-600" />
              <span>{t('aiListening')}</span>
            </div>
            <div className="soundwave">
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
            </div>
            <button
              type="button"
              onClick={toggleListening}
              className="text-xs bg-rose-600 text-white rounded px-2.5 py-1"
            >
              {t('aiStopListening')}
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          {/* Voice recognition mic button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`tap-target flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
              isListening
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100'
            }`}
            aria-label="Voice input"
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Text input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('aiPlaceholder')}
            className="tap-target flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim()}
            className="tap-target flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md transition disabled:from-slate-200 disabled:to-slate-300 disabled:shadow-none"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </section>
  );
}
