import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, ChevronLeft, ChevronRight, Loader2, Wand2, Plus, Trash2, Edit3, Link, FileText, Brain, Zap, Eye, RotateCcw, ArrowRight, Upload, X, Layers, Sun, Moon, Palette, Type, Maximize2, Minimize2, MessageSquare, Target, BarChart3, TrendingUp, BookOpen, GraduationCap, ClipboardList, Trophy, Mic, CheckCircle2, Lightbulb, Star, Rocket, Shield, Globe, Heart, PieChart, ArrowUpRight, Users, Briefcase, Clock, GitBranch } from 'lucide-react';
import PptxGenJS from 'pptxgenjs';

const STYLES = [
  { id: 'business', label: '商业演讲', icon: Mic, color: '#3b82f6' },
  { id: 'review', label: '述职汇报', icon: BarChart3, color: '#10b981' },
  { id: 'pitch', label: '投融资路演', icon: TrendingUp, color: '#f59e0b' },
  { id: 'training', label: '培训课件', icon: BookOpen, color: '#8b5cf6' },
  { id: 'academic', label: '学术汇报', icon: GraduationCap, color: '#06b6d4' },
  { id: 'project', label: '项目总结', icon: ClipboardList, color: '#ec4899' },
  { id: 'compete', label: '竞聘演讲', icon: Trophy, color: '#ef4444' },
];
const SLIDE_TYPES = [
  { value: 'title', label: '封面' }, { value: 'agenda', label: '议程' }, { value: 'content', label: '内容' },
  { value: 'data', label: '数据' }, { value: 'timeline', label: '时间线' }, { value: 'two-column', label: '双栏' }, { value: 'closing', label: '结束' },
];
const ICONS = [MessageSquare, Target, Lightbulb, Star, Rocket, Shield, Globe, Heart, CheckCircle2, Users, BarChart3, TrendingUp, Layers, PieChart, ArrowUpRight, Briefcase];
const THEMES = [
  { name: '深海蓝', accent: '#22d3ee', bg: '#0c1222' },
  { name: '极光绿', accent: '#34d399', bg: '#0a1a14' },
  { name: '玫瑰金', accent: '#fb7185', bg: '#1a0c14' },
  { name: '琥珀橙', accent: '#fbbf24', bg: '#1a150c' },
  { name: '幻紫', accent: '#a78bfa', bg: '#120c1a' },
];

// ── Hooks ──
function useTypewriter(text, speed = 10, on = true) {
  const [d, setD] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!text || !on) { setD(text || ''); setDone(true); return; }
    setD(''); setDone(false); let i = 0;
    const t = setInterval(() => { i = Math.min(i + Math.floor(Math.random() * 3) + 2, text.length); setD(text.substring(0, i)); if (i >= text.length) { clearInterval(t); setDone(true); } }, speed);
    return () => clearInterval(t);
  }, [text, speed, on]);
  return { d, done };
}

// ── ThinkingPanel ──
function ThinkingPanel({ text, isLoading, title }) {
  const { d, done } = useTypewriter(text, 10, !!text);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [d]);
  return (
    <div className="h-full flex flex-col bg-[#060d18] rounded-2xl border border-cyan-900/20 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-cyan-900/20 flex items-center gap-2">
        <Brain className="w-4 h-4 text-cyan-500" />
        <span className="text-cyan-400 font-mono text-sm">{title}</span>
        {(isLoading || (!done && text)) && <Loader2 className="w-3 h-3 text-cyan-500 animate-spin ml-auto" />}
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {isLoading && !text && <div className="flex items-center gap-2 text-cyan-500"><Loader2 className="w-4 h-4 animate-spin" /><span>AI 分析中...</span></div>}
        {d && d.split('\n').map((l, i) => {
          if (l.startsWith('### ')) return <h3 key={i} className="text-cyan-300 font-bold mt-3 mb-1">{l.slice(4)}</h3>;
          if (l.startsWith('## ')) return <h2 key={i} className="text-cyan-200 font-bold mt-4 mb-1">{l.slice(3)}</h2>;
          if (l.match(/^\d+\.\s/)) return <p key={i} className="text-cyan-400 ml-2 my-0.5">{l.replace(/\*\*/g, '')}</p>;
          if (l.startsWith('- ')) return <p key={i} className="text-cyan-400/70 ml-4 my-0.5">› {l.slice(2)}</p>;
          if (!l.trim()) return <br key={i} />;
          return <p key={i} className="text-cyan-400/60 my-0.5">{l.replace(/\*\*/g, '')}</p>;
        })}
        {!done && text && <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-0.5" />}
      </div>
    </div>
  );
}

// ── Template Upload ──
function TemplateUpload({ templates, setTemplates }) {
  const slots = [
    { key: 'cover', label: '封面模板', sub: '首页' },
    { key: 'middle', label: '内容模板', sub: '中间页' },
    { key: 'ending', label: '尾页模板', sub: '结束页' },
  ];
  const handleUpload = (key, file) => {
    const r = new FileReader();
    r.onload = (e) => setTemplates(p => ({ ...p, [key]: { dataUrl: e.target.result, name: file.name } }));
    r.readAsDataURL(file);
  };
  return (
    <div className="grid grid-cols-3 gap-3">
      {slots.map(s => {
        const inputRef = React.createRef();
        const tmpl = templates[s.key];
        return (
          <div key={s.key} className="flex flex-col items-center">
            <div onClick={() => inputRef.current?.click()}
              className={`w-full aspect-video rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all ${tmpl ? 'border-cyan-500/40' : 'border-white/[0.08] hover:border-cyan-500/20'}`}>
              {tmpl ? (
                <>
                  <img src={tmpl.dataUrl} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <button onClick={e => { e.stopPropagation(); setTemplates(p => ({ ...p, [s.key]: null })); }} className="p-1.5 bg-red-500/80 rounded-full"><X className="w-3 h-3 text-white" /></button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Upload className="w-4 h-4 mx-auto mb-1 text-white/15" />
                  <div className="text-[10px] text-white/20">{s.sub}</div>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(s.key, e.target.files[0]); e.target.value = ''; }} />
            <span className="text-[10px] text-white/25 mt-1.5">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Mind Map Outline ──
function MindMapOutline({ outline, setOutline, onConfirm, isGenerating }) {
  if (!outline) return null;
  const up = (fn) => setOutline(fn(outline));
  const setTitle = (v) => up(o => ({ ...o, title: v }));
  const setSlideField = (i, f, v) => up(o => { const s = [...o.slides]; s[i] = { ...s[i], [f]: v }; return { ...o, slides: s }; });
  const setBullet = (si, bi, v) => up(o => { const s = [...o.slides]; const b = [...(s[si].bullets || [])]; b[bi] = v; s[si] = { ...s[si], bullets: b }; return { ...o, slides: s }; });
  const addBullet = (si) => up(o => { const s = [...o.slides]; s[si] = { ...s[si], bullets: [...(s[si].bullets || []), '新要点'] }; return { ...o, slides: s }; });
  const rmBullet = (si, bi) => up(o => { const s = [...o.slides]; s[si] = { ...s[si], bullets: (s[si].bullets || []).filter((_, j) => j !== bi) }; return { ...o, slides: s }; });
  const addSlide = () => up(o => ({ ...o, slides: [...o.slides, { type: 'content', headline: '新页面', bullets: ['要点: 详细说明'] }] }));
  const rmSlide = (i) => up(o => o.slides.length <= 1 ? o : { ...o, slides: o.slides.filter((_, j) => j !== i) });
  const moveSlide = (i, d) => up(o => { const n = i + d; if (n < 0 || n >= o.slides.length) return o; const s = [...o.slides]; [s[i], s[n]] = [s[n], s[i]]; return { ...o, slides: s }; });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-1 mb-3">
        <GitBranch className="w-4 h-4 text-cyan-500" />
        <span className="text-sm font-medium text-white/50">思维导图大纲</span>
        <span className="text-xs text-white/20 ml-auto">{outline.slides.length} 页</span>
      </div>
      <div className="flex-1 overflow-auto pr-1">
        {/* Root */}
        <div className="flex items-center mb-3 pl-1">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex-shrink-0" />
          <div className="w-4 h-px bg-cyan-500/30" />
          <input value={outline.title} onChange={e => setTitle(e.target.value)} className="bg-cyan-500/10 text-white font-bold text-sm px-3 py-1.5 rounded-lg border border-cyan-500/20 focus:outline-none focus:border-cyan-500/50 flex-1 min-w-0" />
        </div>
        {/* Branches */}
        <div className="ml-[7px] border-l-2 border-cyan-500/15 pl-5 space-y-1">
          {outline.slides.map((slide, si) => {
            const typeInfo = SLIDE_TYPES.find(t => t.value === slide.type);
            return (
              <div key={si} className="relative group/slide">
                <div className="absolute -left-5 top-3.5 w-5 border-t-2 border-cyan-500/15" />
                <div className="bg-white/[0.025] rounded-xl border border-white/[0.05] p-3 mb-1 hover:border-white/[0.1] transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-500/40 flex-shrink-0" />
                    <select value={slide.type} onChange={e => setSlideField(si, 'type', e.target.value)} className="text-[10px] bg-cyan-500/10 text-cyan-400 rounded px-1.5 py-0.5 border-0 focus:outline-none cursor-pointer">
                      {SLIDE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <input value={slide.headline} onChange={e => setSlideField(si, 'headline', e.target.value)} className="bg-transparent text-white text-sm font-semibold focus:outline-none flex-1 min-w-0 border-b border-transparent focus:border-cyan-500/30" />
                    <div className="flex gap-0.5 opacity-0 group-hover/slide:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => moveSlide(si, -1)} disabled={si === 0} className="text-white/20 hover:text-white text-xs disabled:opacity-20 px-1">↑</button>
                      <button onClick={() => moveSlide(si, 1)} disabled={si === outline.slides.length - 1} className="text-white/20 hover:text-white text-xs disabled:opacity-20 px-1">↓</button>
                      <button onClick={() => rmSlide(si)} className="text-red-400/40 hover:text-red-400 px-1"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  {slide.type === 'title' && <input value={slide.subheadline || ''} onChange={e => setSlideField(si, 'subheadline', e.target.value)} className="bg-transparent text-white/30 text-xs ml-5 focus:outline-none w-full border-b border-transparent focus:border-cyan-500/20" placeholder="副标题" />}
                  {['content', 'agenda', 'closing'].includes(slide.type) && slide.bullets && (
                    <div className="ml-4 mt-1.5 border-l border-white/[0.04] pl-3 space-y-1">
                      {slide.bullets.map((b, bi) => (
                        <div key={bi} className="flex items-center gap-1.5 group/b">
                          <div className="w-1 h-1 rounded-full bg-cyan-500/25 flex-shrink-0" />
                          <input value={b} onChange={e => setBullet(si, bi, e.target.value)} className="bg-transparent text-white/50 text-xs focus:outline-none flex-1 min-w-0 border-b border-transparent focus:border-cyan-500/20" />
                          <button onClick={() => rmBullet(si, bi)} className="opacity-0 group-hover/b:opacity-100 text-red-400/40 hover:text-red-400 transition-opacity"><X className="w-2.5 h-2.5" /></button>
                        </div>
                      ))}
                      <button onClick={() => addBullet(si)} className="text-[10px] text-white/15 hover:text-cyan-400 ml-2.5 transition-colors">+ 要点</button>
                    </div>
                  )}
                  {slide.type === 'data' && (slide.metrics || []).map((m, mi) => (
                    <div key={mi} className="flex gap-2 ml-5 mt-1">
                      <input value={m.label} onChange={e => { const ms = [...(slide.metrics||[])]; ms[mi] = {...ms[mi], label: e.target.value}; setSlideField(si, 'metrics', ms); }} className="flex-1 bg-transparent text-white/40 text-xs focus:outline-none border-b border-transparent focus:border-cyan-500/20" placeholder="指标" />
                      <input value={m.value} onChange={e => { const ms = [...(slide.metrics||[])]; ms[mi] = {...ms[mi], value: e.target.value}; setSlideField(si, 'metrics', ms); }} className="w-16 bg-transparent text-cyan-400 text-xs font-bold focus:outline-none border-b border-transparent focus:border-cyan-500/20" placeholder="数值" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <button onClick={addSlide} className="w-full py-2.5 border border-dashed border-white/[0.06] rounded-xl text-white/15 hover:text-cyan-400 hover:border-cyan-500/20 flex items-center justify-center gap-1.5 text-xs transition-all mt-1">
            <Plus className="w-3.5 h-3.5" /> 添加页面
          </button>
        </div>
      </div>
      <div className="pt-3 mt-3 border-t border-white/[0.05]">
        <button onClick={onConfirm} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-cyan-500/20 transition-all text-sm">
          {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />生成中...</> : <><Zap className="w-4 h-4" />确认大纲，生成 PPT</>}
        </button>
      </div>
    </div>
  );
}

// ── Slide Renderer (dark theme, golden-ratio, cards) ──
function SlideRenderer({ slide, theme, si = 0, total = 1, templateBg, fontSize = 1 }) {
  const accent = theme?.accent || '#22d3ee';
  const fs = fontSize;
  const getIcon = (i) => { const I = ICONS[(si * 5 + i) % ICONS.length]; return <I className="w-6 h-6" style={{ color: accent }} />; };

  // Detect card layout: 2-4 bullets with "title: desc" format
  const isCards = slide.type === 'content' && slide.bullets?.length >= 2 && slide.bullets?.length <= 4 &&
    slide.bullets.every(b => /^.+[：:].+/.test(b));

  const layouts = {
    title: (
      <div className="flex flex-col items-center justify-center h-full text-center px-[10%]">
        <div className="w-12 h-0.5 rounded mb-5 opacity-60" style={{ background: accent }} />
        <h1 className="font-extrabold text-white mb-3 leading-tight tracking-tight" style={{ fontSize: `${2.2 * fs}rem` }}>{slide.headline}</h1>
        {slide.subheadline && <p className="font-medium opacity-70" style={{ color: accent, fontSize: `${1 * fs}rem` }}>{slide.subheadline}</p>}
        <div className="w-12 h-0.5 rounded mt-5 opacity-60" style={{ background: accent }} />
      </div>
    ),

    agenda: (
      <div className="flex flex-col h-full" style={{ padding: '6% 7%' }}>
        <h2 className="font-bold mb-[5%]" style={{ color: accent, fontSize: `${1.6 * fs}rem` }}>{slide.headline}</h2>
        <div className="flex-1 flex flex-col justify-center gap-[3%]">
          {slide.bullets?.map((b, i) => (
            <div key={i} className="flex items-center gap-[3%] p-[2.5%] rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}88)`, fontSize: `${0.8 * fs}rem` }}>{i + 1}</div>
              <span className="text-white/80 font-medium" style={{ fontSize: `${0.85 * fs}rem` }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    ),

    data: (
      <div className="flex flex-col h-full" style={{ padding: '6% 7%' }}>
        <h2 className="font-bold mb-[5%]" style={{ color: accent, fontSize: `${1.6 * fs}rem` }}>{slide.headline}</h2>
        <div className="flex-1 grid gap-[3%] content-center" style={{ gridTemplateColumns: `repeat(${Math.min(slide.metrics?.length || 3, 3)}, 1fr)` }}>
          {slide.metrics?.map((m, i) => (
            <div key={i} className="text-center p-[8%] rounded-xl border" style={{ background: `${accent}08`, borderColor: `${accent}15` }}>
              <div className="font-extrabold mb-1" style={{ color: accent, fontSize: `${2 * fs}rem` }}>{m.value}</div>
              <div className="font-semibold text-white/70" style={{ fontSize: `${0.8 * fs}rem` }}>{m.label}</div>
              {m.description && <div className="text-white/30 mt-1" style={{ fontSize: `${0.65 * fs}rem` }}>{m.description}</div>}
            </div>
          ))}
        </div>
      </div>
    ),

    timeline: (
      <div className="flex flex-col h-full" style={{ padding: '6% 7%' }}>
        <h2 className="font-bold mb-[6%]" style={{ color: accent, fontSize: `${1.6 * fs}rem` }}>{slide.headline}</h2>
        <div className="flex-1 flex items-center">
          <div className="w-full flex items-start justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-px" style={{ background: `${accent}30` }} />
            {slide.items?.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10 flex-1 px-[1%]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2 mb-3" style={{ background: `${accent}15`, borderColor: accent, fontSize: `${0.7 * fs}rem` }}>{i + 1}</div>
                <div className="font-bold mb-1" style={{ color: accent, fontSize: `${0.7 * fs}rem` }}>{item.phase}</div>
                <div className="font-medium text-white/70" style={{ fontSize: `${0.7 * fs}rem` }}>{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    'two-column': (
      <div className="flex flex-col h-full" style={{ padding: '6% 7%' }}>
        <h2 className="font-bold mb-[4%]" style={{ color: accent, fontSize: `${1.6 * fs}rem` }}>{slide.headline}</h2>
        <div className="flex-1 grid grid-cols-2 gap-[3%]">
          {[{ t: slide.leftTitle, b: slide.leftBullets }, { t: slide.rightTitle, b: slide.rightBullets }].map((col, ci) => (
            <div key={ci} className="p-[6%] rounded-xl border" style={{ background: `${accent}06`, borderColor: `${accent}12` }}>
              <h3 className="font-bold mb-[6%]" style={{ color: accent, fontSize: `${0.95 * fs}rem` }}>{col.t}</h3>
              <div className="space-y-[5%]">
                {col.b?.map((b, i) => (
                  <div key={i} className="flex items-start gap-[5%]">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: accent }} />
                    <span className="text-white/70" style={{ fontSize: `${0.75 * fs}rem` }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    closing: (
      <div className="flex flex-col items-center justify-center h-full text-center px-[12%]">
        <h1 className="font-extrabold text-white mb-2" style={{ fontSize: `${2 * fs}rem` }}>{slide.headline}</h1>
        {slide.subheadline && <p className="font-medium mb-5 opacity-70" style={{ color: accent, fontSize: `${0.95 * fs}rem` }}>{slide.subheadline}</p>}
        {slide.bullets?.map((b, i) => (
          <div key={i} className="flex items-center gap-2 mb-1"><ArrowRight className="w-4 h-4" style={{ color: accent }} /><span className="text-white/70" style={{ fontSize: `${0.85 * fs}rem` }}>{b}</span></div>
        ))}
      </div>
    ),
  };

  // Card layout for content
  const cardLayout = (
    <div className="flex flex-col h-full" style={{ padding: '5% 6%' }}>
      <h2 className="font-extrabold mb-[4%]" style={{ color: accent, fontSize: `${1.6 * fs}rem` }}>{slide.headline}</h2>
      <div className="flex-1 grid gap-[2.5%] content-center" style={{ gridTemplateColumns: `repeat(${Math.min(slide.bullets?.length || 3, 3)}, 1fr)` }}>
        {slide.bullets?.map((b, i) => {
          const parts = b.match(/^(.+?)[：:]\s*(.+)$/);
          const title = parts ? parts[1] : b;
          const desc = parts ? parts[2] : '';
          return (
            <div key={i} className="rounded-xl border p-[8%] flex flex-col items-center text-center" style={{ background: `rgba(255,255,255,0.025)`, borderColor: `${accent}18` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-[10%]" style={{ background: `${accent}12` }}>{getIcon(i)}</div>
              <div className="font-bold text-white/90 mb-[5%]" style={{ fontSize: `${0.85 * fs}rem` }}>{title}</div>
              {desc && <div className="text-white/45 leading-relaxed" style={{ fontSize: `${0.65 * fs}rem` }}>{desc}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );

  // List layout for content
  const listLayout = (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col" style={{ padding: '5% 6%' }}>
        <h2 className="font-extrabold mb-[5%]" style={{ color: accent, fontSize: `${1.6 * fs}rem` }}>{slide.headline}</h2>
        <div className="flex-1 flex flex-col justify-center gap-[4%]">
          {slide.bullets?.map((b, i) => {
            const parts = b.match(/^(.+?)[：:]\s*(.+)$/);
            return (
              <div key={i} className="flex items-start gap-[3%]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accent}10` }}>{getIcon(i)}</div>
                <div className="flex-1 min-w-0">
                  {parts ? (<><div className="font-bold text-white/85" style={{ fontSize: `${0.85 * fs}rem` }}>{parts[1]}</div><div className="text-white/40 mt-0.5" style={{ fontSize: `${0.7 * fs}rem` }}>{parts[2]}</div></>) :
                    <div className="text-white/70" style={{ fontSize: `${0.8 * fs}rem` }}>{b}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-[35%] hidden md:flex items-center justify-center p-[3%]">
        <div className="w-full h-[75%] rounded-2xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}08, ${accent}03)` }}>
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.07]">{React.cloneElement(getIcon(si), { className: 'w-24 h-24' })}</div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${accent} 1px, transparent 1px)`, backgroundSize: '14px 14px' }} />
        </div>
      </div>
    </div>
  );

  const contentRender = slide.type === 'content' ? (isCards ? cardLayout : listLayout) : (layouts[slide.type] || listLayout);

  return (
    <div className="aspect-video rounded-2xl shadow-2xl overflow-hidden relative" style={{ background: templateBg ? undefined : `linear-gradient(155deg, ${theme?.bg || '#0c1222'} 0%, #111b30 50%, ${theme?.bg || '#0e1526'} 100%)` }}>
      {templateBg && <img src={templateBg} className="absolute inset-0 w-full h-full object-cover" alt="" />}
      <div className={`absolute inset-0 ${templateBg ? 'bg-black/40' : ''}`}>
        <div className="absolute top-0 left-0 right-0 h-0.5 opacity-60" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        {/* Decorative gradient patch */}
        <div className="absolute top-0 right-0 w-[35%] h-[45%] opacity-[0.06] rounded-bl-[50%]" style={{ background: `radial-gradient(ellipse, ${accent}, transparent 70%)` }} />
        <div className="absolute bottom-3 left-4 text-[10px] text-white/15 font-mono">{String(si + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>
        {contentRender}
      </div>
    </div>
  );
}

// ── Slide Viewer ──
function SlideViewer({ pptData, templates, onReset, onExport, exporting }) {
  const [cur, setCur] = useState(0);
  const [themeIdx, setThemeIdx] = useState(0);
  const [fontSize, setFontSize] = useState(1);

  useEffect(() => {
    const h = (e) => { if (e.key === 'ArrowRight') setCur(p => Math.min(p + 1, (pptData?.slides?.length || 1) - 1)); if (e.key === 'ArrowLeft') setCur(p => Math.max(p - 1, 0)); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [pptData]);

  if (!pptData) return null;
  const theme = { ...pptData.theme, accent: THEMES[themeIdx].accent, bg: THEMES[themeIdx].bg };
  const slide = pptData.slides[cur];

  // Determine template background
  let tmplBg = null;
  if (slide.type === 'title' && templates?.cover?.dataUrl) tmplBg = templates.cover.dataUrl;
  else if (slide.type === 'closing' && templates?.ending?.dataUrl) tmplBg = templates.ending.dataUrl;
  else if (templates?.middle?.dataUrl && slide.type !== 'title' && slide.type !== 'closing') tmplBg = templates.middle.dataUrl;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div><h2 className="text-base font-bold text-white">{pptData.title}</h2><p className="text-[10px] text-white/20">{pptData.slides.length} 页 · 方向键翻页</p></div>
        <div className="flex gap-2">
          <button onClick={onReset} className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/40 rounded-lg text-xs transition-colors"><RotateCcw className="w-3 h-3" />重做</button>
          <button onClick={() => onExport(pptData, theme, templates)} disabled={exporting} className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 shadow-lg shadow-cyan-500/20">
            {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}{exporting ? '导出...' : '导出 PPTX'}
          </button>
        </div>
      </div>

      {/* Layout controls */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3 h-3 text-white/20" />
          {THEMES.map((t, i) => (
            <button key={i} onClick={() => setThemeIdx(i)} className={`w-4 h-4 rounded-full border-2 transition-all ${themeIdx === i ? 'border-white scale-110' : 'border-transparent'}`} style={{ background: t.accent }} title={t.name} />
          ))}
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1">
          <Type className="w-3 h-3 text-white/20" />
          {[0.85, 1, 1.15].map((s, i) => (
            <button key={i} onClick={() => setFontSize(s)} className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${fontSize === s ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}>{['S', 'M', 'L'][i]}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        {/* Thumbnails */}
        <div className="w-24 flex-shrink-0 overflow-y-auto space-y-1.5 pr-1">
          {pptData.slides.map((s, i) => (
            <button key={i} onClick={() => setCur(i)} className={`w-full aspect-video rounded-lg overflow-hidden border-2 transition-all ${cur === i ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-white/[0.04] hover:border-white/[0.08]'}`}>
              <div className="w-full h-full p-1" style={{ background: `linear-gradient(155deg, ${THEMES[themeIdx].bg}, #111b30)` }}>
                <div className="text-[8px] font-medium truncate text-white/50">{s.headline}</div>
                <div className="text-[8px] text-white/15 font-mono">{i + 1}</div>
              </div>
            </button>
          ))}
        </div>
        {/* Main slide */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="relative flex-1">
            <SlideRenderer slide={slide} theme={theme} si={cur} total={pptData.slides.length} templateBg={tmplBg} fontSize={fontSize} />
            <div className="absolute top-3 left-0 right-0 flex items-center justify-center gap-3">
              <span className="text-xs text-white/20">Slide {cur + 1} of {pptData.slides.length}</span>
            </div>
            <button onClick={() => setCur(p => Math.max(p - 1, 0))} disabled={cur === 0} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-lg text-white disabled:opacity-10 transition-all border border-white/10"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCur(p => Math.min(p + 1, pptData.slides.length - 1))} disabled={cur === pptData.slides.length - 1} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-lg text-white disabled:opacity-10 transition-all border border-white/10"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5">{pptData.slides.map((_, i) => <button key={i} onClick={() => setCur(i)} className={`h-1 rounded-full transition-all ${cur === i ? 'bg-cyan-500 w-5' : 'bg-white/10 w-1.5'}`} />)}</div>
        </div>
      </div>
    </div>
  );
}

// ── PPTX Export ──
async function exportPPTX(pptData, theme, templates) {
  const pptx = new PptxGenJS();
  pptx.title = pptData.title;
  const bgHex = (theme.bg || '#0c1222').replace('#', '');
  const ac = (theme.accent || '#22d3ee').replace('#', '');
  pptx.defineSlideMaster({ title: 'M', background: { color: bgHex } });

  for (const [idx, slide] of pptData.slides.entries()) {
    const s = pptx.addSlide({ masterName: 'M' });
    let tmplBg = null;
    if (slide.type === 'title' && templates?.cover?.dataUrl) tmplBg = templates.cover.dataUrl;
    else if (slide.type === 'closing' && templates?.ending?.dataUrl) tmplBg = templates.ending.dataUrl;
    else if (templates?.middle?.dataUrl && slide.type !== 'title' && slide.type !== 'closing') tmplBg = templates.middle.dataUrl;
    if (tmplBg) { try { s.background = { data: tmplBg }; } catch {} }

    if (slide.type === 'title') {
      s.addText(slide.headline, { x: 0.5, y: 2.2, w: 9, h: 1.5, fontSize: 44, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Microsoft YaHei' });
      if (slide.subheadline) s.addText(slide.subheadline, { x: 0.5, y: 3.7, w: 9, h: 0.7, fontSize: 22, color: ac, align: 'center', fontFace: 'Microsoft YaHei' });
    } else if (slide.type === 'closing') {
      s.addText(slide.headline, { x: 0.5, y: 2, w: 9, h: 1, fontSize: 40, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Microsoft YaHei' });
      if (slide.subheadline) s.addText(slide.subheadline, { x: 0.5, y: 3.2, w: 9, h: 0.6, fontSize: 20, color: ac, align: 'center', fontFace: 'Microsoft YaHei' });
    } else if (slide.type === 'data') {
      s.addText(slide.headline, { x: 0.5, y: 0.4, w: 9, h: 0.7, fontSize: 28, bold: true, color: ac, fontFace: 'Microsoft YaHei' });
      (slide.metrics || []).forEach((m, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        s.addText(m.value, { x: 0.5 + col * 3.2, y: 1.6 + row * 2, w: 2.8, h: 0.8, fontSize: 32, bold: true, color: ac, align: 'center', fontFace: 'Microsoft YaHei' });
        s.addText(m.label, { x: 0.5 + col * 3.2, y: 2.4 + row * 2, w: 2.8, h: 0.4, fontSize: 14, color: 'AAAAAA', align: 'center', fontFace: 'Microsoft YaHei' });
      });
    } else {
      s.addText(slide.headline, { x: 0.5, y: 0.4, w: 9, h: 0.7, fontSize: 28, bold: true, color: ac, fontFace: 'Microsoft YaHei' });
      (slide.bullets || []).forEach((b, i) => {
        const parts = b.match(/^(.+?)[：:]\s*(.+)$/);
        if (parts) {
          s.addText(parts[1], { x: 0.8, y: 1.3 + i * 1.2, w: 8, h: 0.4, fontSize: 18, bold: true, color: 'DDDDDD', fontFace: 'Microsoft YaHei' });
          s.addText(parts[2], { x: 0.8, y: 1.7 + i * 1.2, w: 8, h: 0.5, fontSize: 14, color: '888888', fontFace: 'Microsoft YaHei' });
        } else {
          s.addText(`•  ${b}`, { x: 0.8, y: 1.4 + i * 0.9, w: 8, h: 0.7, fontSize: 16, color: 'CCCCCC', valign: 'top', fontFace: 'Microsoft YaHei' });
        }
      });
    }
  }
  await pptx.writeFile({ fileName: `${pptData.title || 'GenSlides'}.pptx` });
}

// ── Main App ──
export default function App() {
  const [phase, setPhase] = useState('input');
  const [selectedStyle, setSelectedStyle] = useState('business');
  const [content, setContent] = useState('');
  const [urls, setUrls] = useState('');
  const [prompt, setPrompt] = useState('');
  const [templates, setTemplates] = useState({ cover: null, middle: null, ending: null });
  const [thinkingText, setThinkingText] = useState('');
  const [outline, setOutline] = useState(null);
  const [genThinking, setGenThinking] = useState('');
  const [pptData, setPptData] = useState(null);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const styleLabel = STYLES.find(s => s.id === selectedStyle)?.label || '商业演讲';

  const getTemplateInfo = () => {
    const parts = [];
    if (templates.cover) parts.push('封面模板');
    if (templates.middle) parts.push('内容页模板');
    if (templates.ending) parts.push('尾页模板');
    return parts.length ? `用户上传了${parts.join('、')}` : '';
  };

  const generateOutline = async () => {
    if (!content.trim() && !prompt.trim()) { setError('请输入内容或需求描述'); return; }
    setPhase('outlining'); setError(null); setThinkingText(''); setOutline(null);
    try {
      const res = await fetch('/api/generate-outline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, style: styleLabel, content, urls, templateInfo: getTemplateInfo() }) });
      const raw = await res.text(); let result; try { result = JSON.parse(raw); } catch { throw new Error('服务器响应异常，请重试'); }
      if (!res.ok) throw new Error(result.error || '生成失败');
      setThinkingText(result.thinking || '分析完成。');
      if (result.outline) { if (!result.outline.theme?.accent) result.outline.theme = { primary: '#e2e8f0', accent: '#22d3ee', background: '#0c1222' }; setOutline(result.outline); setTimeout(() => setPhase('editing'), 500); }
      else throw new Error('未能生成大纲');
    } catch (err) { setError(err.message); setPhase('input'); }
  };

  const generatePPT = async () => {
    if (!outline) return;
    setPhase('generating'); setGenThinking(''); setPptData(null); setError(null);
    try {
      const res = await fetch('/api/generate-ppt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outline, style: styleLabel, templateInfo: getTemplateInfo() }) });
      const raw = await res.text(); let result; try { result = JSON.parse(raw); } catch { throw new Error('服务器响应异常，请重试'); }
      if (!res.ok) throw new Error(result.error || '生成失败');
      setGenThinking(result.thinking || '生成完成。');
      const final = result.pptData || outline;
      if (!final.theme?.accent) final.theme = { primary: '#e2e8f0', accent: '#22d3ee', background: '#0c1222' };
      setPptData(final); setTimeout(() => setPhase('preview'), 500);
    } catch (err) { setError(err.message || '生成失败'); }
  };

  const handleExport = async (data, theme, tmpls) => { setExporting(true); try { await exportPPTX(data, theme, tmpls); } catch (e) { alert('导出失败: ' + e.message); } setExporting(false); };
  const resetAll = () => { setPhase('input'); setThinkingText(''); setOutline(null); setGenThinking(''); setPptData(null); setError(null); };

  const steps = [{ k: 'input', l: '输入', i: FileText }, { k: 'outline', l: '大纲', i: Brain }, { k: 'generate', l: '生成', i: Zap }, { k: 'preview', l: '预览', i: Eye }];
  const stepIdx = phase === 'input' ? 0 : ['outlining', 'editing'].includes(phase) ? 1 : phase === 'generating' ? 2 : 3;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(160deg, #050a12, #0c1222 30%, #0f172a 70%, #050a12)' }}>
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/[0.05] px-5 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"><Layers className="w-4 h-4 text-white" /></div>
            <div><h1 className="text-base font-bold text-white tracking-tight">GenSlides</h1><p className="text-[9px] text-white/15 tracking-widest uppercase">AI Presentation Studio</p></div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {steps.map((s, i) => (<React.Fragment key={s.k}>{i > 0 && <div className={`w-5 h-px ${i <= stepIdx ? 'bg-cyan-500/40' : 'bg-white/[0.04]'}`} />}<div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition-all ${i === stepIdx ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30' : i < stepIdx ? 'text-cyan-500/40' : 'text-white/10'}`}><s.i className="w-3 h-3" /><span className="hidden lg:inline">{s.l}</span></div></React.Fragment>))}
          </div>
          {phase !== 'input' && <button onClick={resetAll} className="text-white/15 hover:text-white/50 text-xs flex items-center gap-1 transition-colors"><RotateCcw className="w-3 h-3" />重新开始</button>}
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {/* ── Input Phase ── */}
        {phase === 'input' && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 pt-10 pb-20">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight leading-tight">
                  Create Slide Deck from<br /><span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">your documents and notes</span>
                </h2>
              </div>

              {/* Main input */}
              <div className="relative mb-5">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden focus-within:border-cyan-500/25 transition-colors">
                  <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full h-40 bg-transparent px-5 pt-5 pb-14 text-white placeholder-white/15 focus:outline-none resize-none text-base leading-relaxed" placeholder="粘贴你的文字内容、项目资料、工作总结等原始材料..." />
                  <div className="absolute bottom-3 right-3">
                    <button onClick={generateOutline} disabled={!content.trim() && !prompt.trim()} className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white disabled:opacity-15 hover:shadow-lg hover:shadow-cyan-500/30 transition-all"><ArrowRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Template upload */}
              <div className="mb-5">
                <label className="text-[11px] font-medium text-white/20 mb-2.5 flex items-center gap-1.5 tracking-wider uppercase"><Upload className="w-3 h-3" /> PPT 模板 <span className="text-white/10 normal-case tracking-normal">（可选：上传封面/内容/尾页截图）</span></label>
                <TemplateUpload templates={templates} setTemplates={setTemplates} />
              </div>

              {/* Style selector */}
              <div className="mb-5">
                <label className="text-[11px] font-medium text-white/20 mb-2.5 block tracking-wider uppercase">PPT 场景</label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {STYLES.map(s => { const I = s.icon; return (
                    <button key={s.id} onClick={() => setSelectedStyle(s.id)} className={`p-2.5 rounded-xl border text-center transition-all ${selectedStyle === s.id ? 'bg-white/[0.05] border-cyan-500/30 ring-1 ring-cyan-500/20' : 'bg-white/[0.015] border-white/[0.03] hover:border-white/[0.06]'}`}>
                      <I className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                      <div className="text-[11px] font-medium text-white/60">{s.label}</div>
                    </button>
                  ); })}
                </div>
              </div>

              {/* Extra inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
                  <label className="text-[10px] text-white/20 mb-1.5 flex items-center gap-1"><Link className="w-3 h-3" />参考链接<span className="text-white/10">（可选）</span></label>
                  <input value={urls} onChange={e => setUrls(e.target.value)} className="w-full bg-transparent text-white/60 text-sm focus:outline-none placeholder-white/10" placeholder="https://..." />
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
                  <label className="text-[10px] text-white/20 mb-1.5 flex items-center gap-1"><Edit3 className="w-3 h-3" />额外需求<span className="text-white/10">（可选）</span></label>
                  <input value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-transparent text-white/60 text-sm focus:outline-none placeholder-white/10" placeholder="例如：10页，面向CTO..." />
                </div>
              </div>

              {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-red-300 text-sm">{error}</div>}

              <button onClick={generateOutline} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-semibold shadow-xl shadow-cyan-500/20 transition-all text-base">
                <Wand2 className="w-5 h-5" /> 生成 PPT 大纲
              </button>
              <p className="text-center text-white/8 text-[10px] mt-5">Powered by Gemini · 免费使用</p>
            </div>
          </div>
        )}

        {/* ── Outline Phase ── */}
        {['outlining', 'editing'].includes(phase) && (
          <div className="h-full flex">
            <div className="w-[38%] p-3 flex flex-col border-r border-white/[0.04]">
              <ThinkingPanel text={thinkingText} isLoading={phase === 'outlining'} title="AI 分析过程" />
            </div>
            <div className="w-[62%] p-4 flex flex-col overflow-hidden">
              {phase === 'outlining' && !outline ? <div className="flex-1 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-cyan-500" /></div> :
                outline && <MindMapOutline outline={outline} setOutline={setOutline} onConfirm={generatePPT} isGenerating={phase === 'generating'} />}
              {error && <div className="mt-2 p-2.5 bg-red-500/10 border border-red-500/15 rounded-xl text-red-300 text-sm">{error}</div>}
            </div>
          </div>
        )}

        {/* ── Generate + Preview Phase ── */}
        {['generating', 'preview'].includes(phase) && (
          <div className="h-full flex">
            <div className="w-[38%] p-3 flex flex-col border-r border-white/[0.04]">
              <ThinkingPanel text={genThinking} isLoading={phase === 'generating'} title="PPT 生成过程" />
            </div>
            <div className="w-[62%] p-4 flex flex-col overflow-hidden">
              {phase === 'generating' && !pptData && !error ? <div className="flex-1 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-cyan-500" /></div> : null}
              {error && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-sm">
                    <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-red-300 text-sm mb-3">⚠️ {error}</div>
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => { setError(null); setPhase('editing'); }} className="px-3 py-1.5 bg-white/5 text-white/40 rounded-lg text-xs"><Edit3 className="w-3 h-3 inline mr-1" />修改大纲</button>
                      <button onClick={() => { setError(null); generatePPT(); }} className="px-3 py-1.5 bg-cyan-500/15 text-cyan-400 rounded-lg text-xs"><RotateCcw className="w-3 h-3 inline mr-1" />重试</button>
                    </div>
                  </div>
                </div>
              )}
              {pptData && <SlideViewer pptData={pptData} templates={templates} onReset={resetAll} onExport={handleExport} exporting={exporting} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
