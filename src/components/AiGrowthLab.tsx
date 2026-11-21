import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Mic,
  Send,
  Square,
  Upload,
  Volume2,
} from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import {
  formatAudioDataUrl,
  validateAuditInput,
  validateGrowthPlanInput,
} from '../utils/aiHelpers';
import type { ChatTurn, GroundingSource, GrowthPlanResult } from '../utils/aiHelpers';
import type { ServiceOption } from '../utils/quoteLogic';
import {
  KineticHeading,
  MagneticButton,
  SpringAudioVisualizer,
} from './MotionPrimitives';

interface AiGrowthLabProps {
  onApplyPlanToQuote: (payload: {
    services: ServiceOption[];
    businessName: string;
    industry: string;
    notes?: string;
  }) => void;
}

type LabTab = 'blueprint' | 'audit' | 'advisor';
type VoiceOption = 'Kore' | 'Puck' | 'Charon' | 'Zephyr';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Could not read audio file.'));
    reader.readAsDataURL(blob);
  });
}

function deriveDomainLabel(urlString: string): string {
  const trimmed = urlString.trim();
  if (!trimmed) return '';
  try {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(normalized).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

export function AiGrowthLab({ onApplyPlanToQuote }: AiGrowthLabProps) {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<LabTab>('blueprint');

  // Tab 1: Campaign Blueprint + TTS Voiceover + Voice Brief
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState(t.aiLab.cityDefault);
  const [goal, setGoal] = useState('');
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<GrowthPlanResult | null>(null);

  const [voiceName, setVoiceName] = useState<VoiceOption>('Kore');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [transcribeNote, setTranscribeNote] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Tab 2: Grounded Site & Market Audit
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [marketQuery, setMarketQuery] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [auditSources, setAuditSources] = useState<GroundingSource[]>([]);
  const [auditGrounded, setAuditGrounded] = useState<boolean>(true);

  // Tab 3: Streaming Advisor Chat
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([
    {
      role: 'model',
      text: t.aiLab.advisorGreeting,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatStreaming, setChatStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Sync untouched initial greeting when user toggles language
  useEffect(() => {
    setChatHistory((prev) => {
      if (prev.length === 1 && prev[0].role === 'model' && prev[0].text !== t.aiLab.advisorGreeting) {
        return [{ role: 'model', text: t.aiLab.advisorGreeting }];
      }
      return prev;
    });
  }, [t.aiLab.advisorGreeting]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop();
      }
    };
  }, []);

  const handleGeneratePlan = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const check = validateGrowthPlanInput({ businessName, industry, city, goal });
    if (!check.valid) {
      setPlanError(check.error ?? 'Please fill in all fields.');
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlanLoading(true);
    setPlanError(null);
    setVoiceAudioUrl(null);
    setVoicePlaying(false);
    setVoiceError(null);

    try {
      const res = await fetch('/api/ai/growth-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, industry, city, goal }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        plan?: GrowthPlanResult;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.plan) {
        throw new Error(data.error || 'Could not generate growth plan.');
      }
      setPlanResult(data.plan);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleGenerateVoiceover = async () => {
    if (!planResult?.videoScript.spokenScript) return;
    setVoiceLoading(true);
    setVoicePlaying(false);
    setVoiceError(null);

    try {
      const res = await fetch('/api/ai/voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptText: planResult.videoScript.spokenScript,
          voice: voiceName,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        audioBase64?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.audioBase64) {
        throw new Error(data.error || 'Could not generate voiceover audio.');
      }
      setVoiceAudioUrl(formatAudioDataUrl(data.audioBase64));
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : 'Voiceover generation failed.');
    } finally {
      setVoiceLoading(false);
    }
  };

  const sendAudioForTranscription = async (blob: Blob, mimeType: string) => {
    setTranscribeLoading(true);
    setPlanError(null);
    try {
      const audioBase64 = await blobToBase64(blob);
      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        transcript?: string;
        businessName?: string;
        industry?: string;
        goal?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not transcribe audio.');
      }
      if (data.businessName) setBusinessName(data.businessName);
      if (data.industry) setIndustry(data.industry);
      if (data.goal) setGoal(data.goal);
      setTranscribeNote(
        data.transcript
          ? `${t.aiLab.heardPrefix} "${data.transcript}"`
          : t.aiLab.noSpeech
      );
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Audio transcription failed.');
    } finally {
      setTranscribeLoading(false);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording && recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setPlanError(t.aiLab.micUnavailable);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        void sendAudioForTranscription(blob, recorder.mimeType || 'audio/webm');
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setTranscribeNote(t.aiLab.micListening);
    } catch {
      setPlanError(t.aiLab.micDenied);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await sendAudioForTranscription(file, file.type || 'audio/mp3');
    e.target.value = '';
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateAuditInput({ websiteUrl, marketQuery });
    if (!check.valid) {
      setAuditError(check.error ?? 'Please enter a URL or market topic.');
      return;
    }

    setAuditLoading(true);
    setAuditError(null);
    setAuditReport(null);
    setAuditSources([]);
    setAuditGrounded(true);

    try {
      const res = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl, marketQuery }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        report?: string;
        sources?: GroundingSource[];
        grounded?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.report) {
        throw new Error(data.error || 'Could not complete audit.');
      }
      setAuditReport(data.report);
      setAuditSources(Array.isArray(data.sources) ? data.sources : []);
      setAuditGrounded(data.grounded !== false);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : 'Audit request failed.');
    } finally {
      setAuditLoading(false);
    }
  };

  const sendAdvisorMessage = async (textOverride?: string) => {
    const prompt = (textOverride ?? chatInput).trim();
    if (!prompt || chatStreaming) return;

    const priorHistory = [...chatHistory];
    setChatHistory((prev) => [...prev, { role: 'user', text: prompt }, { role: 'model', text: '' }]);
    setChatInput('');
    setChatStreaming(true);
    setChatError(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: priorHistory, message: prompt }),
      });
      if (!res.ok || !res.body) {
        throw new Error('Could not reach Growvia Advisor.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const rawEvent of events) {
          const line = rawEvent.trim();
          if (!line.startsWith('data:')) continue;
          const payload = JSON.parse(line.slice(5).trim()) as {
            chunk?: string;
            done?: boolean;
            error?: string;
          };
          if (payload.error) {
            throw new Error(payload.error);
          }
          if (payload.chunk) {
            setChatHistory((prev) => {
              const next = [...prev];
              const lastIdx = next.length - 1;
              if (lastIdx >= 0 && next[lastIdx].role === 'model') {
                next[lastIdx] = {
                  role: 'model',
                  text: next[lastIdx].text + payload.chunk,
                };
              }
              return next;
            });
          }
        }
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Advisor stream interrupted.');
      setChatHistory((prev) => {
        const next = [...prev];
        if (next[next.length - 1]?.role === 'model' && !next[next.length - 1].text) {
          next.pop();
        }
        return next;
      });
    } finally {
      setChatStreaming(false);
    }
  };

  const userAdvisorTurns = chatHistory.filter((turn) => turn.role === 'user');
  const latestAdvisorPrompt =
    userAdvisorTurns.length > 0 ? userAdvisorTurns[userAdvisorTurns.length - 1].text : '';

  return (
    <section
      id="ai-lab"
      className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1480px] mx-auto scroll-mt-24"
      aria-labelledby="ai-lab-heading"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-[740px] lg:max-w-[680px]">
          <p className="eyebrow">{t.aiLab.eyebrow}</p>
          <KineticHeading
            id="ai-lab-heading"
            className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] leading-[1.06] font-extrabold text-[var(--ink)]"
            segments={[
              { text: t.aiLab.headingLead },
              { text: t.aiLab.headingHighlight, highlight: true },
              { text: t.aiLab.headingEnd },
            ]}
          />
          <p className="mt-4 text-[18px] leading-[1.6] text-[var(--muted)]">
            {t.aiLab.subtitle}
          </p>
        </div>

        {/* Responsive Mode Tabs: wrap cleanly on narrow phones, single-row pill on sm+ */}
        <div className="w-full sm:w-auto max-w-full rounded-[22px] sm:rounded-full bg-[var(--sage-tint)] border border-[var(--border)] card-gloss p-1.5 self-start lg:self-auto">
          <div
            role="tablist"
            aria-label={t.aiLab.tablistAria}
            className="flex flex-wrap sm:inline-flex sm:flex-nowrap items-center justify-center gap-1 sm:gap-1.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'blueprint'}
              onClick={() => setActiveTab('blueprint')}
              className={`min-h-[40px] rounded-full px-3 sm:px-4 py-2 text-[12.5px] sm:text-[14px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'blueprint'
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {t.aiLab.tabs.blueprint}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'audit'}
              onClick={() => setActiveTab('audit')}
              className={`min-h-[40px] rounded-full px-3 sm:px-4 py-2 text-[12.5px] sm:text-[14px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {t.aiLab.tabs.audit}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'advisor'}
              onClick={() => setActiveTab('advisor')}
              className={`min-h-[40px] rounded-full px-3 sm:px-4 py-2 text-[12.5px] sm:text-[14px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'advisor'
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {t.aiLab.tabs.advisor}
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Surface */}
      <div
        className="mt-10 rounded-[32px] glass-panel border border-[var(--border)] p-6 sm:p-10 lg:p-12 relative overflow-hidden"
        style={{
          backgroundImage: 'var(--lab-wash)',
        }}
      >
        {/* TAB 1: CAMPAIGN BLUEPRINT + TTS + VOICE BRIEF */}
        {activeTab === 'blueprint' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[var(--border)]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold text-[var(--muted)] mr-1">
                  {t.aiLab.presetsLabel}
                </span>
                {t.aiLab.presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setBusinessName(preset.businessName);
                      setIndustry(preset.industry);
                      setCity(preset.city);
                      setGoal(preset.goal);
                      setPlanError(null);
                    }}
                    className="rounded-full bg-[var(--sage-tint)] border border-[var(--border)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--ink)] hover:border-[#F26B1D] transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Voice Brief Controls (Audio Transcription) */}
              <div className="flex items-center gap-2.5">
                {(isRecording || transcribeLoading) && (
                  <div className="px-2 py-1 rounded-full bg-[var(--sage-tint)] border border-[var(--border)] flex items-center">
                    <SpringAudioVisualizer active={isRecording} barCount={7} tone="light" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleToggleRecording}
                  disabled={transcribeLoading}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold border inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isRecording
                      ? 'bg-[#F26B1D] text-[#1A2E20] border-[#F26B1D]'
                      : 'bg-[var(--bg)] text-[var(--ink)] border-[var(--border)] hover:border-[#F26B1D]'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      <span>{t.aiLab.stopRecording}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{transcribeLoading ? t.aiLab.transcribing : t.aiLab.voiceBrief}</span>
                    </>
                  )}
                </button>

                <label className="rounded-full px-3.5 py-1.5 text-[13px] font-bold border bg-[var(--bg)] text-[var(--ink)] border-[var(--border)] hover:border-[#F26B1D] inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.aiLab.uploadAudio}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {transcribeNote && (
              <p className="mt-3 text-[13.5px] text-[var(--muted)]">{transcribeNote}</p>
            )}

            <form onSubmit={handleGeneratePlan} noValidate className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="ai-business-name"
                    className="block text-[14px] font-bold text-[var(--ink)] mb-1.5"
                  >
                    {t.aiLab.businessNameLabel}
                  </label>
                  <input
                    id="ai-business-name"
                    type="text"
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      setPlanError(null);
                    }}
                    placeholder={t.aiLab.businessNamePlaceholder}
                    className="w-full rounded-[16px] bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ai-industry"
                    className="block text-[14px] font-bold text-[var(--ink)] mb-1.5"
                  >
                    {t.aiLab.industryLabel}
                  </label>
                  <input
                    id="ai-industry"
                    type="text"
                    value={industry}
                    onChange={(e) => {
                      setIndustry(e.target.value);
                      setPlanError(null);
                    }}
                    placeholder={t.aiLab.industryPlaceholder}
                    className="w-full rounded-[16px] bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ai-city"
                    className="block text-[14px] font-bold text-[var(--ink)] mb-1.5"
                  >
                    {t.aiLab.cityLabel}
                  </label>
                  <input
                    id="ai-city"
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setPlanError(null);
                    }}
                    placeholder={t.aiLab.cityPlaceholder}
                    className="w-full rounded-[16px] bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                <div className="flex-1">
                  <label
                    htmlFor="ai-goal"
                    className="block text-[14px] font-bold text-[var(--ink)] mb-1.5"
                  >
                    {t.aiLab.goalLabel}
                  </label>
                  <input
                    id="ai-goal"
                    type="text"
                    value={goal}
                    onChange={(e) => {
                      setGoal(e.target.value);
                      setPlanError(null);
                    }}
                    placeholder={t.aiLab.goalPlaceholder}
                    className="w-full rounded-[16px] bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                  />
                </div>

                <MagneticButton
                  type="submit"
                  disabled={planLoading}
                  className="btn-orange px-7 py-3.5 text-[15.5px] disabled:opacity-70"
                >
                  {planLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  <span>{planLoading ? t.aiLab.buildingPlanBtn : t.aiLab.buildPlanBtn}</span>
                </MagneticButton>
              </div>

              {planError && (
                <p
                  role="alert"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--error-text)]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{planError}</span>
                </p>
              )}
            </form>

            {planResult && (
              <div className="mt-8 pt-8 border-t border-[var(--border)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[24px] bg-[var(--sage-tint)] border border-[var(--border)] p-5">
                  <div>
                    <p className="text-[13px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      {t.aiLab.strategySummary}
                    </p>
                    <p className="mt-1 text-[16px] text-[var(--ink)] leading-relaxed">
                      {planResult.summary}
                    </p>
                  </div>
                  <MagneticButton
                    type="button"
                    onClick={() =>
                      onApplyPlanToQuote({
                        services: planResult.recommendedServices,
                        businessName: businessName.trim(),
                        industry: industry.trim(),
                        notes: goal.trim()
                          ? `AI Growth Plan (${city.trim()}): ${goal.trim()}`
                          : undefined,
                      })
                    }
                    className="btn-orange px-6 py-3 text-[14.5px] shrink-0"
                  >
                    <span>{t.aiLab.sendPlanToQuote}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </MagneticButton>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Meta Ad Angle */}
                  <div className="rounded-[24px] bg-[var(--bg)] border border-[var(--border)] p-6">
                    <p className="text-[13px] font-bold uppercase tracking-wider text-[#F26B1D]">
                      {t.aiLab.metaCardLabel}
                    </p>
                    <h3 className="mt-2 text-[1.2rem] font-bold text-[var(--ink)]">
                      {planResult.metaAd.hook}
                    </h3>
                    <p className="mt-2.5 text-[15.5px] text-[var(--muted)] leading-relaxed">
                      {planResult.metaAd.primaryText}
                    </p>
                    <p className="mt-4 text-[13.5px] font-bold text-[var(--ink)]">
                      {t.aiLab.suggestedButton} {planResult.metaAd.cta}
                    </p>
                  </div>

                  {/* Google Search Ad */}
                  <div className="rounded-[24px] bg-[var(--bg)] border border-[var(--border)] p-6">
                    <p className="text-[13px] font-bold uppercase tracking-wider text-[#F26B1D]">
                      {t.aiLab.googleCardLabel}
                    </p>
                    <p className="mt-2 font-display font-bold text-[1.15rem] text-[#2E6B45] dark:text-[#9BC094]">
                      {planResult.googleAd.headline1} | {planResult.googleAd.headline2}
                    </p>
                    <p className="mt-2 text-[15px] text-[var(--muted)] leading-relaxed">
                      {planResult.googleAd.description}
                    </p>
                    <p className="mt-4 text-[13.5px] text-[var(--ink)]">
                      <span className="font-bold">{t.aiLab.localKeywords} </span>
                      <span className="text-[var(--muted)]">
                        {planResult.googleAd.keywords.join(' · ')}
                      </span>
                    </p>
                  </div>

                  {/* 30s Video Script + TTS Voiceover */}
                  <div className="rounded-[24px] bg-[var(--bg)] border border-[var(--border)] p-6">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-bold uppercase tracking-wider text-[#F26B1D]">
                        {t.aiLab.videoCardLabel}
                      </p>
                      <span className="text-[13px] font-bold text-[var(--muted)] tabular-nums">
                        {planResult.videoScript.durationLabel}
                      </span>
                    </div>
                    <h3 className="mt-2 text-[1.15rem] font-bold text-[var(--ink)]">
                      {planResult.videoScript.title}
                    </h3>
                    <p className="mt-2.5 text-[15px] text-[var(--ink)] leading-relaxed bg-[var(--surface)] border border-[var(--border)] rounded-[16px] p-4">
                      &ldquo;{planResult.videoScript.spokenScript}&rdquo;
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2.5">
                      <label htmlFor="ai-voice-select" className="sr-only">
                        {t.aiLab.voiceSelectLabel}
                      </label>
                      <select
                        id="ai-voice-select"
                        value={voiceName}
                        onChange={(e) => setVoiceName(e.target.value as VoiceOption)}
                        className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-3.5 py-2 text-[13.5px] font-bold text-[var(--ink)]"
                      >
                        <option value="Kore">{t.aiLab.voices.Kore}</option>
                        <option value="Puck">{t.aiLab.voices.Puck}</option>
                        <option value="Charon">{t.aiLab.voices.Charon}</option>
                        <option value="Zephyr">{t.aiLab.voices.Zephyr}</option>
                      </select>

                      <button
                        type="button"
                        onClick={handleGenerateVoiceover}
                        disabled={voiceLoading}
                        className="btn-outline px-4 py-2 text-[13.5px]"
                      >
                        {voiceLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Volume2 className="w-4 h-4" aria-hidden="true" />
                        )}
                        <span>{voiceLoading ? t.aiLab.generatingAudio : t.aiLab.listenVoiceover}</span>
                      </button>
                    </div>

                    {voiceError && (
                      <p
                        role="alert"
                        className="mt-2.5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--error-text)]"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{voiceError}</span>
                      </p>
                    )}

                    {voiceAudioUrl && (
                      <div className="mt-3 flex items-center gap-3 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] px-3 py-2">
                        <SpringAudioVisualizer active={voicePlaying} barCount={9} tone="light" />
                        <audio
                          ref={audioRef}
                          controls
                          src={voiceAudioUrl}
                          onPlay={() => setVoicePlaying(true)}
                          onPause={() => setVoicePlaying(false)}
                          onEnded={() => setVoicePlaying(false)}
                          className="w-full h-9"
                        />
                      </div>
                    )}
                  </div>

                  {/* Website Conversion Checklist */}
                  <div className="rounded-[24px] bg-[var(--bg)] border border-[var(--border)] p-6">
                    <p className="text-[13px] font-bold uppercase tracking-wider text-[#F26B1D]">
                      {t.aiLab.websiteCardLabel}
                    </p>
                    <h3 className="mt-2 text-[1.15rem] font-bold text-[var(--ink)]">
                      {planResult.websiteTips.heroHeadline}
                    </h3>
                    <ul className="mt-3 space-y-2 text-[15px] text-[var(--muted)]">
                      {planResult.websiteTips.conversionChecklist.map((tip) => (
                        <li key={tip} className="flex items-start gap-2.5">
                          <span
                            className="w-2 h-2 rounded-full bg-[#F26B1D] mt-2 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 05 · Ontario Local SEO & Service Areas */}
                <div className="rounded-[24px] bg-[var(--bg)] border border-[var(--border)] p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#F26B1D] shrink-0" aria-hidden="true" />
                      <p className="text-[13px] font-bold uppercase tracking-wider text-[#F26B1D]">
                        {t.aiLab.localSeoCardLabel}
                      </p>
                    </div>
                    {planResult.localSeo.searchPhrases[0] && (
                      <button
                        type="button"
                        onClick={() => {
                          setMarketQuery(planResult.localSeo.searchPhrases[0]);
                          setAuditError(null);
                          setActiveTab('audit');
                        }}
                        className="text-[13.5px] font-bold text-[var(--ink)] border-b-2 border-[#F26B1D] self-start sm:self-auto hover:text-[#2E6B45] transition-colors cursor-pointer"
                      >
                        {t.aiLab.checkInAudit} &rarr;
                      </button>
                    )}
                  </div>

                  <p className="mt-2.5 text-[15px] text-[var(--ink)] leading-relaxed">
                    {planResult.localSeo.mapPackTip}
                  </p>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                        {t.aiLab.targetAreas}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {planResult.localSeo.nearbyCities.map((area) => (
                          <span
                            key={area}
                            className="rounded-full bg-[var(--sage-tint)] border border-[var(--border)] px-3 py-1 text-[13px] font-medium text-[var(--ink)]"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                        {t.aiLab.searchPhrases}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {planResult.localSeo.searchPhrases.map((phrase) => (
                          <span
                            key={phrase}
                            className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-3 py-1 text-[13px] font-medium text-[var(--muted)]"
                          >
                            {phrase}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GROUNDED SITE & LOCAL MARKET AUDIT */}
        {activeTab === 'audit' && (
          <div>
            <form onSubmit={handleRunAudit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="ai-audit-url"
                    className="block text-[14px] font-bold text-[var(--ink)] mb-1.5"
                  >
                    {t.aiLab.auditUrlLabel}
                  </label>
                  <input
                    id="ai-audit-url"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => {
                      setWebsiteUrl(e.target.value);
                      setAuditError(null);
                    }}
                    placeholder={t.aiLab.auditUrlPlaceholder}
                    className="w-full rounded-[16px] bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ai-audit-query"
                    className="block text-[14px] font-bold text-[var(--ink)] mb-1.5"
                  >
                    {t.aiLab.auditQueryLabel}
                  </label>
                  <input
                    id="ai-audit-query"
                    type="text"
                    value={marketQuery}
                    onChange={(e) => {
                      setMarketQuery(e.target.value);
                      setAuditError(null);
                    }}
                    placeholder={t.aiLab.auditQueryPlaceholder}
                    className="w-full rounded-[16px] bg-[var(--bg)] border border-[var(--border)] px-4 py-3 text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-[14px] text-[var(--muted)] inline-flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#2E6B45] dark:text-[#9BC094]" aria-hidden="true" />
                  <span>{t.aiLab.auditGroundingHint}</span>
                </p>

                <MagneticButton
                  type="submit"
                  disabled={auditLoading}
                  className="btn-orange px-7 py-3.5 text-[15.5px] disabled:opacity-70"
                >
                  {auditLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  <span>{auditLoading ? t.aiLab.scanningMarketBtn : t.aiLab.runAuditBtn}</span>
                </MagneticButton>
              </div>

              {auditError && (
                <p
                  role="alert"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--error-text)]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{auditError}</span>
                </p>
              )}
            </form>

            {auditReport && (
              <div className="mt-8 pt-8 border-t border-[var(--border)] space-y-5">
                {!auditGrounded && (
                  <p className="text-[13.5px] font-medium text-[var(--muted)]">
                    {t.aiLab.auditFallbackNote}
                  </p>
                )}
                <div className="rounded-[24px] bg-[var(--bg)] border border-[var(--border)] p-6 whitespace-pre-wrap text-[15.5px] leading-[1.65] text-[var(--ink)]">
                  {auditReport}
                </div>

                {auditSources.length > 0 && (
                  <div>
                    <p className="text-[13px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      {t.aiLab.groundedSources}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {auditSources.map((src) => (
                        <a
                          key={src.url}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sage-tint)] border border-[var(--border)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--ink)] hover:border-[#F26B1D] transition-colors"
                        >
                          <span className="max-w-[240px] truncate">{src.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-[var(--sage-tint)] border border-[var(--border)] p-5">
                  <p className="text-[15px] font-medium text-[var(--ink)]">
                    {t.aiLab.auditCtaPrompt}
                  </p>
                  <MagneticButton
                    type="button"
                    onClick={() =>
                      onApplyPlanToQuote({
                        services: ['Website', 'Google Ads'],
                        businessName: deriveDomainLabel(websiteUrl),
                        industry: '',
                        notes: [
                          websiteUrl.trim() ? `Site: ${websiteUrl.trim()}` : '',
                          marketQuery.trim() ? `Market focus: ${marketQuery.trim()}` : '',
                        ]
                          .filter(Boolean)
                          .join(' · '),
                      })
                    }
                    className="btn-orange px-6 py-3 text-[14.5px] shrink-0"
                  >
                    <span>{t.aiLab.auditToQuoteBtn}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </MagneticButton>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STREAMING GROWVIA ADVISOR */}
        {activeTab === 'advisor' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-5">
              {t.aiLab.advisorStarters.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={chatStreaming}
                  onClick={() => void sendAdvisorMessage(q)}
                  className="rounded-full bg-[var(--sage-tint)] border border-[var(--border)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--ink)] hover:border-[#F26B1D] transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            <div
              aria-live="polite"
              className="rounded-[24px] bg-[var(--bg)] border border-[var(--border)] p-5 space-y-3.5 max-h-[340px] overflow-y-auto"
            >
              {chatHistory.map((turn, idx) => (
                <div
                  key={`${turn.role}-${idx}`}
                  className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[20px] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap ${
                      turn.role === 'user'
                        ? 'bg-[#1F4D33] text-[#EEF0E4]'
                        : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)]'
                    }`}
                  >
                    {turn.text || (chatStreaming ? t.aiLab.advisorThinking : '')}
                  </div>
                </div>
              ))}
            </div>

            {chatError && (
              <p
                role="alert"
                className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--error-text)]"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{chatError}</span>
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendAdvisorMessage();
              }}
              className="mt-4 flex flex-col sm:flex-row gap-3"
            >
              <label htmlFor="ai-advisor-input" className="sr-only">
                {t.aiLab.advisorInputAria}
              </label>
              <input
                id="ai-advisor-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t.aiLab.advisorPlaceholder}
                className="flex-1 rounded-full bg-[var(--bg)] border border-[var(--border)] px-5 py-3 text-[15.5px] text-[var(--ink)] placeholder:text-[var(--muted)]/60"
              />
              <MagneticButton
                type="submit"
                disabled={chatStreaming || !chatInput.trim()}
                className="btn-orange px-6 py-3 text-[15px] disabled:opacity-60"
              >
                <span>{chatStreaming ? t.aiLab.advisorSending : t.aiLab.advisorSend}</span>
                <Send className="w-4 h-4" aria-hidden="true" />
              </MagneticButton>
            </form>

            {userAdvisorTurns.length > 0 && (
              <div className="mt-5 pt-5 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                <p className="text-[14.5px] text-[var(--muted)]">
                  {t.aiLab.advisorCtaPrompt}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onApplyPlanToQuote({
                      services: [],
                      businessName: '',
                      industry: '',
                      notes: latestAdvisorPrompt
                        ? `Advisor question: ${latestAdvisorPrompt}`
                        : undefined,
                    })
                  }
                  className="btn-outline px-5 py-2.5 text-[14px]"
                >
                  <span>{t.aiLab.advisorCustomQuoteBtn}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
