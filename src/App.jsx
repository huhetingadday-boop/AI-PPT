import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, ChevronLeft, ChevronRight, Loader2, Wand2, Plus, Trash2, Edit3, Link, FileText, Brain, Zap, Eye, RotateCcw, ArrowRight, Upload, X, Layers, Palette, Type, MessageSquare, Target, BarChart3, TrendingUp, BookOpen, GraduationCap, ClipboardList, Trophy, Mic, CheckCircle2, Lightbulb, Star, Rocket, Shield, Globe, Heart, PieChart, ArrowUpRight, Users, Briefcase, Clock, GitBranch, Image, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import PptxGenJS from 'pptxgenjs';

/* ═══════════════════════ Constants ═══════════════════════ */
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
const BG_PRESETS = ['#0c1222', '#0f172a', '#1a1a2e', '#1e1b4b', '#0c4a6e', '#ffffff', '#f8fafc', '#fef3c7'];
const isLightColor = (hex) => { if (!hex || hex.length < 7) return false; const c = hex.replace('#', ''); const r = parseInt(c.substr(0, 2), 16) || 0; const g = parseInt(c.substr(2, 2), 16) || 0; const b = parseInt(c.substr(4, 2), 16) || 0; return (r * 299 + g * 587 + b * 114) / 1000 > 140; };

/* ═══════════════════════ Hooks ═══════════════════════ */
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

/* ═══════════════════════ ThinkingPanel ═══════════════════════ */
function ThinkingPanel({ text, isLoading, title }) {
  const { d, done } = useTypewriter(text, 10, !!text);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [d]);
  return (
    <div className="h-full flex flex-col bg-[#060d18] rounded-2xl border border-cyan-900/20 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-cyan-900/20 flex items-center gap-2">
        <Brain className="w-4 h-4 text-cyan-500" /><span className="text-cyan-400 font-mono text-sm">{title}</span>
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

/* ═══════════════════════ TemplateUpload ═══════════════════════ */
function TemplateUpload({ templates, setTemplates }) {
  const slots = [{ key: 'cover', label: '封面模板', sub: '首页' }, { key: 'middle', label: '内容模板', sub: '中间页' }, { key: 'ending', label: '尾页模板', sub: '结束页' }];
  const handleUpload = (key, file) => { const r = new FileReader(); r.onload = (e) => setTemplates(p => ({ ...p, [key]: { dataUrl: e.target.result, name: file.name } })); r.readAsDataURL(file); };
  return (
    <div className="grid grid-cols-3 gap-3">
      {slots.map(s => {
        const inputRef = React.createRef(); const tmpl = templates[s.key];
        return (
          <div key={s.key} className="flex flex-col items-center">
            <div onClick={() => inputRef.current?.click()} className={`w-full aspect-video rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all ${tmpl ? 'border-cyan-500/40' : 'border-white/[0.08] hover:border-cyan-500/20'}`}>
              {tmpl ? (<><img src={tmpl.dataUrl} className="w-full h-full object-cover" alt="" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><button onClick={e => { e.stopPropagation(); setTemplates(p => ({ ...p, [s.key]: null })); }} className="p-1.5 bg-red-500/80 rounded-full"><X className="w-3 h-3 text-white" /></button></div></>) : (<div className="text-center"><Upload className="w-4 h-4 mx-auto mb-1 text-white/15" /><div className="text-[10px] text-white/20">{s.sub}</div></div>)}
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(s.key, e.target.files[0]); e.target.value = ''; }} />
            <span className="text-[10px] text-white/25 mt-1.5">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════ MindMapOutline ═══════════════════════ */
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
      <div className="flex items-center gap-2 px-1 mb-3"><GitBranch className="w-4 h-4 text-cyan-500" /><span className="text-sm font-medium text-white/50">思维导图大纲</span><span className="text-xs text-white/20 ml-auto">{outline.slides.length} 页</span></div>
      <div className="flex-1 overflow-auto pr-1">
        <div className="flex items-center mb-3 pl-1"><div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex-shrink-0" /><div className="w-4 h-px bg-cyan-500/30" /><input value={outline.title} onChange={e => setTitle(e.target.value)} className="bg-cyan-500/10 text-white font-bold text-sm px-3 py-1.5 rounded-lg border border-cyan-500/20 focus:outline-none focus:border-cyan-500/50 flex-1 min-w-0" /></div>
        <div className="ml-[7px] border-l-2 border-cyan-500/15 pl-5 space-y-1">
          {outline.slides.map((slide, si) => (
            <div key={si} className="relative group/slide">
              <div className="absolute -left-5 top-3.5 w-5 border-t-2 border-cyan-500/15" />
              <div className="bg-white/[0.025] rounded-xl border border-white/[0.05] p-3 mb-1 hover:border-white/[0.1] transition-all">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-500/40 flex-shrink-0" />
                  <select value={slide.type} onChange={e => setSlideField(si, 'type', e.target.value)} className="text-[10px] bg-cyan-500/10 text-cyan-400 rounded px-1.5 py-0.5 border-0 focus:outline-none cursor-pointer">{SLIDE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
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
                    {slide.bullets.map((b, bi) => (<div key={bi} className="flex items-center gap-1.5 group/b"><div className="w-1 h-1 rounded-full bg-cyan-500/25 flex-shrink-0" /><input value={b} onChange={e => setBullet(si, bi, e.target.value)} className="bg-transparent text-white/50 text-xs focus:outline-none flex-1 min-w-0 border-b border-transparent focus:border-cyan-500/20" /><button onClick={() => rmBullet(si, bi)} className="opacity-0 group-hover/b:opacity-100 text-red-400/40 hover:text-red-400 transition-opacity"><X className="w-2.5 h-2.5" /></button></div>))}
                    <button onClick={() => addBullet(si)} className="text-[10px] text-white/15 hover:text-cyan-400 ml-2.5 transition-colors">+ 要点</button>
                  </div>
                )}
                {slide.type === 'data' && (slide.metrics || []).map((m, mi) => (<div key={mi} className="flex gap-2 ml-5 mt-1"><input value={m.label} onChange={e => { const ms = [...(slide.metrics||[])]; ms[mi] = {...ms[mi], label: e.target.value}; setSlideField(si, 'metrics', ms); }} className="flex-1 bg-transparent text-white/40 text-xs focus:outline-none border-b border-transparent focus:border-cyan-500/20" placeholder="指标" /><input value={m.value} onChange={e => { const ms = [...(slide.metrics||[])]; ms[mi] = {...ms[mi], value: e.target.value}; setSlideField(si, 'metrics', ms); }} className="w-16 bg-transparent text-cyan-400 text-xs font-bold focus:outline-none border-b border-transparent focus:border-cyan-500/20" placeholder="数值" /></div>))}
              </div>
            </div>
          ))}
          <button onClick={addSlide} className="w-full py-2.5 border border-dashed border-white/[0.06] rounded-xl text-white/15 hover:text-cyan-400 hover:border-cyan-500/20 flex items-center justify-center gap-1.5 text-xs transition-all mt-1"><Plus className="w-3.5 h-3.5" /> 添加页面</button>
        </div>
      </div>
      <div className="pt-3 mt-3 border-t border-white/[0.05]"><button onClick={onConfirm} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-cyan-500/20 transition-all text-sm">{isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />生成中...</> : <><Zap className="w-4 h-4" />确认大纲，生成 PPT</>}</button></div>
    </div>
  );
}

/* ═══════════════════════ EditableText ═══════════════════════ */
function EditableText({ value, onChange, style, className }) {
  const ref = useRef(null);
  const focused = useRef(false);
  useEffect(() => { if (ref.current && !focused.current) ref.current.textContent = value || ''; }, [value]);
  return (
    <div ref={ref} contentEditable suppressContentEditableWarning
      style={{ ...style, outline: 'none' }}
      className={`${className || ''} cursor-text transition-shadow hover:ring-1 hover:ring-cyan-500/25 hover:rounded-sm focus:ring-2 focus:ring-cyan-500/50 focus:bg-black/[0.04] focus:rounded-sm`}
      onFocus={() => { focused.current = true; }}
      onBlur={(e) => { focused.current = false; const t = e.target.textContent || ''; if (t !== value) onChange(t); }}
    />
  );
}

/* ═══════════════════════ SlideRenderer (with editable mode) ═══════════════════════ */
function SlideRenderer({ slide, theme, si = 0, total = 1, templateBg, fontSize = 1, editable = false, onUpdate }) {
  const accent = theme?.accent || '#22d3ee';
  const fs = fontSize;
  const hasTmpl = !!(templateBg || slide.bgImage);
  const lightBg = slide.bgColor ? isLightColor(slide.bgColor) : hasTmpl;

  const c = lightBg
    ? { h1: '#1a1a2e', h2: accent, body: '#1e293b', sub: '#64748b', muted: '#94a3b8', cardBg: 'rgba(0,0,0,0.03)', cardBorder: 'rgba(0,0,0,0.08)', iconBg: `${accent}15` }
    : { h1: '#ffffff', h2: accent, body: 'rgba(255,255,255,0.8)', sub: 'rgba(255,255,255,0.5)', muted: 'rgba(255,255,255,0.25)', cardBg: 'rgba(255,255,255,0.025)', cardBorder: `${accent}18`, iconBg: `${accent}10` };

  const safe = hasTmpl ? { padding: '10% 8% 8% 8%' } : { padding: '5% 6%' };
  const getIcon = (i) => { const I = ICONS[(si * 5 + i) % ICONS.length]; return <I className="w-5 h-5" style={{ color: accent }} />; };

  // ── Helpers for editable mode ──
  const upS = (f, v) => onUpdate?.({ ...slide, [f]: v });
  const upB = (i, v) => onUpdate?.({ ...slide, bullets: (slide.bullets || []).map((b, j) => j === i ? v : b) });
  const Txt = (value, onChange, sty, cls) => editable && onChange
    ? <EditableText value={value} onChange={onChange} style={sty} className={cls} />
    : <div style={sty} className={cls}>{value}</div>;

  const isCards = slide.type === 'content' && slide.bullets?.length >= 2 && slide.bullets?.length <= 4 && slide.bullets.every(b => /^.+[：:].+/.test(b));

  // ── Bullet renderer (shared by agenda/content/closing) ──
  const renderBulletParts = (b, i, titleStyle, descStyle) => {
    const parts = b.match(/^(.+?)[：:]\s*(.+)$/);
    if (parts) return (<>
      {Txt(parts[1], v => upB(i, `${v}：${parts[2]}`), titleStyle, 'font-bold leading-snug')}
      {Txt(parts[2], v => upB(i, `${parts[1]}：${v}`), descStyle, 'mt-0.5 leading-relaxed')}
    </>);
    return Txt(b, v => upB(i, v), { ...titleStyle, fontWeight: 'normal' }, 'leading-relaxed');
  };

  // ── Layouts ──
  const layouts = {
    title: (
      <div className="flex flex-col items-center justify-center h-full text-center" style={{ padding: hasTmpl ? '12% 10%' : '5% 10%' }}>
        {!hasTmpl && <div className="w-12 h-0.5 rounded mb-5 opacity-60" style={{ background: accent }} />}
        {Txt(slide.headline, v => upS('headline', v), { color: c.h1, fontSize: `${2.2 * fs}rem` }, 'font-extrabold mb-3 leading-tight tracking-tight')}
        {Txt(slide.subheadline || '', v => upS('subheadline', v), { color: c.sub, fontSize: `${1 * fs}rem` }, 'font-medium')}
        {!hasTmpl && <div className="w-12 h-0.5 rounded mt-5 opacity-60" style={{ background: accent }} />}
      </div>
    ),

    agenda: (
      <div className="flex flex-col h-full" style={safe}>
        {Txt(slide.headline, v => upS('headline', v), { color: c.h2, fontSize: `${1.5 * fs}rem` }, 'font-bold mb-[4%]')}
        <div className="flex-1 flex flex-col justify-center gap-[2.5%] overflow-hidden">
          {slide.bullets?.map((b, i) => (
            <div key={i} className="flex items-center gap-[3%] p-[2%] rounded-xl" style={{ background: c.cardBg }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold flex-shrink-0" style={{ background: accent, color: '#fff', fontSize: `${0.7 * fs}rem` }}>{i + 1}</div>
              <div className="flex-1 min-w-0">{renderBulletParts(b, i, { color: c.body, fontSize: `${0.78 * fs}rem` }, { color: c.sub, fontSize: `${0.65 * fs}rem` })}</div>
            </div>
          ))}
        </div>
      </div>
    ),

    data: (
      <div className="flex flex-col h-full" style={safe}>
        {Txt(slide.headline, v => upS('headline', v), { color: c.h2, fontSize: `${1.5 * fs}rem` }, 'font-bold mb-[4%]')}
        <div className="flex-1 grid gap-[3%] content-center" style={{ gridTemplateColumns: `repeat(${Math.min(slide.metrics?.length || 3, 3)}, 1fr)` }}>
          {slide.metrics?.map((m, i) => (
            <div key={i} className="text-center p-[8%] rounded-xl border" style={{ background: c.cardBg, borderColor: c.cardBorder }}>
              {Txt(m.value, v => onUpdate?.({ ...slide, metrics: slide.metrics.map((mm, j) => j === i ? { ...mm, value: v } : mm) }), { color: accent, fontSize: `${2 * fs}rem` }, 'font-extrabold mb-1')}
              {Txt(m.label, v => onUpdate?.({ ...slide, metrics: slide.metrics.map((mm, j) => j === i ? { ...mm, label: v } : mm) }), { color: c.body, fontSize: `${0.8 * fs}rem` }, 'font-semibold')}
            </div>
          ))}
        </div>
      </div>
    ),

    timeline: (
      <div className="flex flex-col h-full" style={safe}>
        {Txt(slide.headline, v => upS('headline', v), { color: c.h2, fontSize: `${1.5 * fs}rem` }, 'font-bold mb-[5%]')}
        <div className="flex-1 flex items-center">
          <div className="w-full flex items-start justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-px" style={{ background: `${accent}40` }} />
            {slide.items?.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10 flex-1 px-[1%]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 mb-3" style={{ background: hasTmpl ? accent : `${accent}15`, borderColor: accent, color: hasTmpl ? '#fff' : c.body, fontSize: `${0.7 * fs}rem` }}>{i + 1}</div>
                {Txt(item.phase, v => onUpdate?.({ ...slide, items: slide.items.map((t, j) => j === i ? { ...t, phase: v } : t) }), { color: accent, fontSize: `${0.7 * fs}rem` }, 'font-bold mb-1')}
                {Txt(item.title, v => onUpdate?.({ ...slide, items: slide.items.map((t, j) => j === i ? { ...t, title: v } : t) }), { color: c.sub, fontSize: `${0.7 * fs}rem` }, 'font-medium')}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    'two-column': (
      <div className="flex flex-col h-full" style={safe}>
        {Txt(slide.headline, v => upS('headline', v), { color: c.h2, fontSize: `${1.5 * fs}rem` }, 'font-bold mb-[3%]')}
        <div className="flex-1 grid grid-cols-2 gap-[3%]">
          {[{ tk: 'leftTitle', bk: 'leftBullets' }, { tk: 'rightTitle', bk: 'rightBullets' }].map(({ tk, bk }, ci) => (
            <div key={ci} className="p-[5%] rounded-xl border" style={{ background: c.cardBg, borderColor: c.cardBorder }}>
              {Txt(slide[tk], v => upS(tk, v), { color: accent, fontSize: `${0.9 * fs}rem` }, 'font-bold mb-[5%]')}
              <div className="space-y-[4%]">
                {(slide[bk] || []).map((b, i) => (
                  <div key={i} className="flex items-start gap-[4%]">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: accent }} />
                    {Txt(b, v => upS(bk, (slide[bk] || []).map((bb, j) => j === i ? v : bb)), { color: c.body, fontSize: `${0.75 * fs}rem` }, '')}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    closing: (
      <div className="flex flex-col items-center justify-center h-full text-center" style={{ padding: hasTmpl ? '12% 10%' : '5% 10%' }}>
        {Txt(slide.headline, v => upS('headline', v), { color: c.h1, fontSize: `${2 * fs}rem` }, 'font-extrabold mb-2')}
        {Txt(slide.subheadline || '', v => upS('subheadline', v), { color: c.sub, fontSize: `${0.95 * fs}rem` }, 'font-medium mb-5')}
        {slide.bullets?.map((b, i) => (<div key={i} className="flex items-center gap-2 mb-1"><ArrowRight className="w-4 h-4" style={{ color: accent }} />{Txt(b, v => upB(i, v), { color: c.body, fontSize: `${0.85 * fs}rem` }, '')}</div>))}
      </div>
    ),
  };

  // Card layout
  const cardLayout = (
    <div className="flex flex-col h-full" style={safe}>
      {Txt(slide.headline, v => upS('headline', v), { color: c.h2, fontSize: `${1.5 * fs}rem` }, 'font-extrabold mb-[3%]')}
      <div className="flex-1 grid gap-[2.5%] content-center" style={{ gridTemplateColumns: `repeat(${Math.min(slide.bullets?.length || 3, 3)}, 1fr)` }}>
        {slide.bullets?.map((b, i) => {
          const parts = b.match(/^(.+?)[：:]\s*(.+)$/);
          const title = parts ? parts[1] : b; const desc = parts ? parts[2] : '';
          return (
            <div key={i} className="rounded-xl border p-[6%] flex flex-col items-center text-center overflow-hidden" style={{ background: c.cardBg, borderColor: c.cardBorder }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-[6%] flex-shrink-0" style={{ background: c.iconBg }}>{getIcon(i)}</div>
              {Txt(title, v => upB(i, desc ? `${v}：${desc}` : v), { color: lightBg ? c.h1 : 'rgba(255,255,255,0.9)', fontSize: `${0.72 * fs}rem` }, 'font-bold mb-[3%] leading-snug')}
              {desc && Txt(desc, v => upB(i, `${title}：${v}`), { color: c.sub, fontSize: `${0.55 * fs}rem` }, 'leading-relaxed')}
            </div>
          );
        })}
      </div>
    </div>
  );

  // List layout
  const listLayout = (
    <div className={hasTmpl ? 'flex flex-col h-full' : 'flex h-full'} style={hasTmpl ? safe : undefined}>
      <div className={hasTmpl ? 'h-full flex flex-col' : 'flex-1 flex flex-col'} style={hasTmpl ? undefined : { padding: '5% 6%' }}>
        {Txt(slide.headline, v => upS('headline', v), { color: c.h2, fontSize: `${1.5 * fs}rem` }, 'font-extrabold mb-[3%]')}
        <div className="flex-1 flex flex-col justify-center gap-[2.5%] overflow-hidden">
          {slide.bullets?.map((b, i) => (
            <div key={i} className="flex items-start gap-[2.5%]">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: c.iconBg }}>{getIcon(i)}</div>
              <div className="flex-1 min-w-0">{renderBulletParts(b, i, { color: lightBg ? c.h1 : 'rgba(255,255,255,0.85)', fontSize: `${0.75 * fs}rem` }, { color: c.sub, fontSize: `${0.6 * fs}rem` })}</div>
            </div>
          ))}
        </div>
      </div>
      {!hasTmpl && (
        <div className="w-[35%] hidden md:flex items-center justify-center p-[3%]">
          {slide.userImage ? <img src={slide.userImage} className="w-full h-[85%] object-contain rounded-2xl" alt="" /> : (
            <div className="w-full h-[75%] rounded-2xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}08, ${accent}03)` }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.07]">{React.cloneElement(getIcon(si), { className: 'w-24 h-24' })}</div>
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${accent} 1px, transparent 1px)`, backgroundSize: '14px 14px' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );

  const contentRender = slide.type === 'content' ? (isCards ? cardLayout : listLayout) : (layouts[slide.type] || listLayout);

  const slideBg = slide.bgColor || (hasTmpl ? '#ffffff' : `linear-gradient(155deg, ${theme?.bg || '#0c1222'} 0%, #111b30 50%, ${theme?.bg || '#0e1526'} 100%)`);
  const slideBgImg = slide.bgImage || templateBg;

  return (
    <div className="aspect-video rounded-2xl shadow-2xl overflow-hidden relative" style={{ background: slideBg }}>
      {slideBgImg && <img src={slideBgImg} className="absolute inset-0 w-full h-full object-cover" alt="" />}
      {hasTmpl && slide.userImage && <div className="absolute right-[4%] bottom-[12%] w-[28%] h-[50%] rounded-xl overflow-hidden shadow-lg"><img src={slide.userImage} className="w-full h-full object-contain" alt="" /></div>}
      <div className="absolute inset-0">
        {!hasTmpl && !slide.bgColor && <>
          <div className="absolute top-0 left-0 right-0 h-0.5 opacity-60" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
          <div className="absolute top-0 right-0 w-[35%] h-[45%] opacity-[0.06] rounded-bl-[50%]" style={{ background: `radial-gradient(ellipse, ${accent}, transparent 70%)` }} />
          <div className="absolute bottom-3 left-4 text-[10px] text-white/15 font-mono">{String(si + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>
        </>}
        {contentRender}
      </div>
    </div>
  );
}

/* ═══════════════════════ PropertyPanel ═══════════════════════ */
function PropertyPanel({ slide, si, total, onUpdate, onDelete, onDuplicate, onMoveUp, onMoveDown, onAddSlide }) {
  const bgRef = useRef(null);
  const imgRef = useRef(null);
  if (!slide) return null;
  const upF = (f, v) => onUpdate({ ...slide, [f]: v });
  const upB = (i, v) => onUpdate({ ...slide, bullets: (slide.bullets || []).map((b, j) => j === i ? v : b) });
  const addB = () => onUpdate({ ...slide, bullets: [...(slide.bullets || []), '新要点：详细说明'] });
  const rmB = (i) => onUpdate({ ...slide, bullets: (slide.bullets || []).filter((_, j) => j !== i) });
  const upM = (i, f, v) => onUpdate({ ...slide, metrics: (slide.metrics || []).map((m, j) => j === i ? { ...m, [f]: v } : m) });
  const addM = () => onUpdate({ ...slide, metrics: [...(slide.metrics || []), { label: '指标', value: '0', description: '' }] });
  const rmM = (i) => onUpdate({ ...slide, metrics: (slide.metrics || []).filter((_, j) => j !== i) });
  const fileToData = (file, cb) => { const r = new FileReader(); r.onload = e => cb(e.target.result); r.readAsDataURL(file); };

  return (
    <div className="w-60 flex-shrink-0 bg-[#060d18] border-l border-white/[0.05] flex flex-col text-white/60">
      {/* Header */}
      <div className="p-3 border-b border-white/[0.05] flex items-center justify-between">
        <span className="text-[10px] text-white/20">第 {si + 1} 页</span>
        <select value={slide.type} onChange={e => upF('type', e.target.value)} className="text-[10px] bg-cyan-500/10 text-cyan-400 rounded px-2 py-0.5 border-0 focus:outline-none">{SLIDE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* ── Background ── */}
        <div>
          <label className="text-[9px] text-white/20 uppercase tracking-wider mb-2 flex items-center gap-1"><Palette className="w-3 h-3" />背景</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {BG_PRESETS.map(clr => (<button key={clr} onClick={() => upF('bgColor', clr)} className={`w-5 h-5 rounded-full border-2 transition-all ${slide.bgColor === clr ? 'border-cyan-400 scale-110' : 'border-white/10'}`} style={{ background: clr }} />))}
            <label className="w-5 h-5 rounded-full border-2 border-white/10 overflow-hidden cursor-pointer relative">
              <input type="color" value={slide.bgColor || '#0c1222'} onChange={e => upF('bgColor', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="w-full h-full" style={{ background: 'conic-gradient(red,yellow,lime,aqua,blue,magenta,red)' }} />
            </label>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => bgRef.current?.click()} className="flex-1 text-[10px] px-2 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.05] hover:border-white/[0.1] flex items-center justify-center gap-1"><Upload className="w-3 h-3" />背景图</button>
            {(slide.bgColor || slide.bgImage) && <button onClick={() => { upF('bgColor', undefined); upF('bgImage', undefined); }} className="px-2 py-1.5 text-red-400/40 hover:text-red-400 rounded-lg border border-white/[0.05]"><X className="w-3 h-3" /></button>}
          </div>
          <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) fileToData(e.target.files[0], d => upF('bgImage', d)); e.target.value = ''; }} />
        </div>

        {/* ── Content ── */}
        <div>
          <label className="text-[9px] text-white/20 uppercase tracking-wider mb-2 flex items-center gap-1"><Edit3 className="w-3 h-3" />内容</label>
          <div className="mb-2"><span className="text-[8px] text-white/10">标题</span><input value={slide.headline || ''} onChange={e => upF('headline', e.target.value)} className="w-full mt-0.5 px-2 py-1.5 bg-white/[0.03] text-white text-[11px] rounded-lg border border-white/[0.05] focus:border-cyan-500/30 focus:outline-none" /></div>
          {['title', 'closing'].includes(slide.type) && (<div className="mb-2"><span className="text-[8px] text-white/10">副标题</span><input value={slide.subheadline || ''} onChange={e => upF('subheadline', e.target.value)} className="w-full mt-0.5 px-2 py-1.5 bg-white/[0.03] text-white/50 text-[11px] rounded-lg border border-white/[0.05] focus:border-cyan-500/30 focus:outline-none" /></div>)}

          {['content', 'agenda', 'closing'].includes(slide.type) && (
            <div className="space-y-1.5">
              <span className="text-[8px] text-white/10">要点</span>
              {(slide.bullets || []).map((b, i) => (<div key={i} className="flex gap-1"><textarea value={b} onChange={e => upB(i, e.target.value)} rows={2} className="flex-1 px-2 py-1 bg-white/[0.03] text-white/50 text-[10px] rounded-lg border border-white/[0.05] focus:border-cyan-500/30 focus:outline-none resize-none leading-relaxed" /><button onClick={() => rmB(i)} className="text-white/10 hover:text-red-400 self-start mt-1"><X className="w-3 h-3" /></button></div>))}
              <button onClick={addB} className="w-full text-[10px] text-white/15 hover:text-cyan-400 py-1 border border-dashed border-white/[0.06] rounded-lg hover:border-cyan-500/20 flex items-center justify-center gap-1"><Plus className="w-3 h-3" />添加</button>
            </div>
          )}

          {slide.type === 'data' && (
            <div className="space-y-1.5">
              <span className="text-[8px] text-white/10">指标</span>
              {(slide.metrics || []).map((m, i) => (<div key={i} className="p-1.5 bg-white/[0.02] rounded-lg border border-white/[0.04] space-y-1"><div className="flex gap-1"><input value={m.label} onChange={e => upM(i, 'label', e.target.value)} placeholder="指标名" className="flex-1 px-1.5 py-0.5 bg-white/[0.03] text-white/50 text-[10px] rounded border border-white/[0.05] focus:outline-none" /><input value={m.value} onChange={e => upM(i, 'value', e.target.value)} placeholder="数值" className="w-14 px-1.5 py-0.5 bg-white/[0.03] text-cyan-400 text-[10px] font-bold rounded border border-white/[0.05] focus:outline-none" /><button onClick={() => rmM(i)} className="text-white/10 hover:text-red-400"><X className="w-2.5 h-2.5" /></button></div></div>))}
              <button onClick={addM} className="w-full text-[10px] text-white/15 hover:text-cyan-400 py-1 border border-dashed border-white/[0.06] rounded-lg hover:border-cyan-500/20 flex items-center justify-center gap-1"><Plus className="w-3 h-3" />添加</button>
            </div>
          )}

          {slide.type === 'two-column' && ['left', 'right'].map(side => (
            <div key={side} className="mb-2">
              <span className="text-[8px] text-white/10">{side === 'left' ? '左栏' : '右栏'}标题</span>
              <input value={slide[`${side}Title`] || ''} onChange={e => upF(`${side}Title`, e.target.value)} className="w-full mt-0.5 px-2 py-1 bg-white/[0.03] text-white/50 text-[10px] rounded-lg border border-white/[0.05] focus:outline-none" />
              {(slide[`${side}Bullets`] || []).map((b, i) => (<div key={i} className="flex gap-1 mt-1"><input value={b} onChange={e => upF(`${side}Bullets`, (slide[`${side}Bullets`]||[]).map((bb, j) => j === i ? e.target.value : bb))} className="flex-1 px-1.5 py-0.5 bg-white/[0.03] text-white/40 text-[10px] rounded border border-white/[0.05] focus:outline-none" /></div>))}
            </div>
          ))}

          {slide.type === 'timeline' && (
            <div className="space-y-1">
              <span className="text-[8px] text-white/10">时间节点</span>
              {(slide.items || []).map((item, i) => (<div key={i} className="flex gap-1"><input value={item.phase} onChange={e => upF('items', (slide.items||[]).map((t, j) => j === i ? { ...t, phase: e.target.value } : t))} placeholder="阶段" className="w-12 px-1 py-0.5 bg-white/[0.03] text-cyan-400 text-[9px] rounded border border-white/[0.05] focus:outline-none" /><input value={item.title} onChange={e => upF('items', (slide.items||[]).map((t, j) => j === i ? { ...t, title: e.target.value } : t))} placeholder="内容" className="flex-1 px-1 py-0.5 bg-white/[0.03] text-white/40 text-[9px] rounded border border-white/[0.05] focus:outline-none" /></div>))}
            </div>
          )}
        </div>

        {/* ── Image ── */}
        <div>
          <label className="text-[9px] text-white/20 uppercase tracking-wider mb-2 flex items-center gap-1"><Image className="w-3 h-3" />插图</label>
          {slide.userImage ? (
            <div className="relative"><img src={slide.userImage} className="w-full aspect-video object-cover rounded-lg" alt="" /><button onClick={() => upF('userImage', undefined)} className="absolute top-1 right-1 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"><X className="w-2.5 h-2.5 text-white" /></button></div>
          ) : (
            <button onClick={() => imgRef.current?.click()} className="w-full py-2.5 bg-white/[0.02] text-white/15 rounded-lg border border-dashed border-white/[0.06] hover:border-cyan-500/20 hover:text-cyan-400 flex items-center justify-center gap-1 text-[10px]"><Upload className="w-3 h-3" />上传图片</button>
          )}
          <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) fileToData(e.target.files[0], d => upF('userImage', d)); e.target.value = ''; }} />
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="p-3 border-t border-white/[0.05] space-y-1.5">
        <div className="flex gap-1.5">
          <button onClick={onMoveUp} disabled={si === 0} className="flex-1 text-[10px] py-1.5 bg-white/[0.03] text-white/20 rounded-lg disabled:opacity-20 flex items-center justify-center gap-0.5 hover:text-white/40"><ChevronUp className="w-3 h-3" />上移</button>
          <button onClick={onMoveDown} disabled={si >= total - 1} className="flex-1 text-[10px] py-1.5 bg-white/[0.03] text-white/20 rounded-lg disabled:opacity-20 flex items-center justify-center gap-0.5 hover:text-white/40"><ChevronDown className="w-3 h-3" />下移</button>
        </div>
        <div className="flex gap-1.5">
          <button onClick={onDuplicate} className="flex-1 text-[10px] py-1.5 bg-white/[0.03] text-white/20 rounded-lg hover:text-cyan-400 flex items-center justify-center gap-0.5"><Copy className="w-3 h-3" />复制</button>
          <button onClick={onDelete} disabled={total <= 1} className="flex-1 text-[10px] py-1.5 bg-white/[0.03] text-red-400/30 rounded-lg hover:text-red-400 disabled:opacity-20 flex items-center justify-center gap-0.5"><Trash2 className="w-3 h-3" />删除</button>
        </div>
        <button onClick={onAddSlide} className="w-full text-[10px] py-1.5 bg-cyan-500/10 text-cyan-400/60 rounded-lg hover:bg-cyan-500/15 hover:text-cyan-400 flex items-center justify-center gap-0.5"><Plus className="w-3 h-3" />添加新页</button>
      </div>
    </div>
  );
}

/* ═══════════════════════ SlideEditor ═══════════════════════ */
function SlideEditor({ pptData, setPptData, templates, onReset, onExport, exporting }) {
  const [cur, setCur] = useState(0);
  const [themeIdx, setThemeIdx] = useState(0);
  const [fontSize, setFontSize] = useState(1);

  useEffect(() => {
    const h = (e) => { if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.contentEditable === 'true') return; if (e.key === 'ArrowRight') setCur(p => Math.min(p + 1, (pptData?.slides?.length || 1) - 1)); if (e.key === 'ArrowLeft') setCur(p => Math.max(p - 1, 0)); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [pptData]);

  if (!pptData) return null;

  const updateSlide = (idx, ns) => setPptData(prev => ({ ...prev, slides: prev.slides.map((s, i) => i === idx ? ns : s) }));
  const deleteSlide = (idx) => { if (pptData.slides.length <= 1) return; setPptData(prev => ({ ...prev, slides: prev.slides.filter((_, i) => i !== idx) })); setCur(p => Math.min(p, pptData.slides.length - 2)); };
  const duplicateSlide = (idx) => { setPptData(prev => ({ ...prev, slides: [...prev.slides.slice(0, idx + 1), JSON.parse(JSON.stringify(prev.slides[idx])), ...prev.slides.slice(idx + 1)] })); setCur(idx + 1); };
  const moveSlide = (idx, dir) => { const n = idx + dir; if (n < 0 || n >= pptData.slides.length) return; setPptData(prev => { const s = [...prev.slides]; [s[idx], s[n]] = [s[n], s[idx]]; return { ...prev, slides: s }; }); setCur(n); };
  const addSlide = () => { setPptData(prev => ({ ...prev, slides: [...prev.slides, { type: 'content', headline: '新页面', bullets: ['要点：详细说明'] }] })); setCur(pptData.slides.length); };

  const theme = { ...pptData.theme, accent: THEMES[themeIdx].accent, bg: THEMES[themeIdx].bg };
  const slide = pptData.slides[cur];
  if (!slide) { setCur(0); return null; }

  let tmplBg = null;
  if (slide.type === 'title' && templates?.cover?.dataUrl) tmplBg = templates.cover.dataUrl;
  else if (slide.type === 'closing' && templates?.ending?.dataUrl) tmplBg = templates.ending.dataUrl;
  else if (templates?.middle?.dataUrl && slide.type !== 'title' && slide.type !== 'closing') tmplBg = templates.middle.dataUrl;

  return (
    <div className="h-full flex">
      {/* ── Left: Thumbnails ── */}
      <div className="w-[76px] flex-shrink-0 bg-[#050a12] border-r border-white/[0.04] flex flex-col">
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
          {pptData.slides.map((s, i) => (
            <button key={i} onClick={() => setCur(i)} className={`w-full aspect-video rounded-lg overflow-hidden border-2 transition-all relative ${cur === i ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-white/[0.04] hover:border-white/[0.08]'}`}>
              <div className="w-full h-full p-1" style={{ background: s.bgColor || `linear-gradient(155deg, ${THEMES[themeIdx].bg}, #111b30)` }}>
                <div className="text-[6px] font-medium truncate" style={{ color: s.bgColor && isLightColor(s.bgColor) ? '#1a1a2e' : 'rgba(255,255,255,0.5)' }}>{s.headline}</div>
              </div>
              <div className="absolute bottom-0.5 right-1 text-[6px] text-white/15 font-mono">{i + 1}</div>
            </button>
          ))}
        </div>
        <div className="p-1.5 border-t border-white/[0.04]"><button onClick={addSlide} className="w-full aspect-video rounded-lg border border-dashed border-white/[0.06] flex items-center justify-center text-white/15 hover:text-cyan-400 hover:border-cyan-500/20 transition-all"><Plus className="w-3 h-3" /></button></div>
      </div>

      {/* ── Center: Main Slide Editor ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1a]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Palette className="w-3 h-3 text-white/15" />
            {THEMES.map((t, i) => (<button key={i} onClick={() => setThemeIdx(i)} className={`w-4 h-4 rounded-full border-2 transition-all ${themeIdx === i ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`} style={{ background: t.accent }} title={t.name} />))}
            <div className="w-px h-4 bg-white/10 mx-1" />
            <Type className="w-3 h-3 text-white/15" />
            {[0.85, 1, 1.15].map((s, i) => (<button key={i} onClick={() => setFontSize(s)} className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${fontSize === s ? 'bg-white/10 text-white' : 'text-white/15 hover:text-white/30'}`}>{['S', 'M', 'L'][i]}</button>))}
            <div className="w-px h-4 bg-white/10 mx-1" />
            <span className="text-[10px] text-white/10">点击幻灯片上的文字即可编辑</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onReset} className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/30 rounded-lg text-[10px] transition-colors"><RotateCcw className="w-3 h-3" />重做</button>
            <button onClick={() => onExport(pptData, theme, templates)} disabled={exporting} className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-[10px] font-medium disabled:opacity-50 shadow-lg shadow-cyan-500/20">
              {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}{exporting ? '导出...' : '导出 PPTX'}
            </button>
          </div>
        </div>

        {/* Slide Area */}
        <div className="flex-1 flex items-center justify-center p-6 min-h-0">
          <div className="w-full max-w-4xl">
            <SlideRenderer slide={slide} theme={theme} si={cur} total={pptData.slides.length} templateBg={tmplBg} fontSize={fontSize} editable={true} onUpdate={(ns) => updateSlide(cur, ns)} />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 pb-3 flex-shrink-0">
          <button onClick={() => setCur(Math.max(0, cur - 1))} disabled={cur === 0} className="text-white/15 disabled:opacity-10 hover:text-white/30"><ChevronLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-1.5">{pptData.slides.map((_, i) => <button key={i} onClick={() => setCur(i)} className={`h-1 rounded-full transition-all ${cur === i ? 'bg-cyan-500 w-5' : 'bg-white/10 w-1.5 hover:bg-white/20'}`} />)}</div>
          <button onClick={() => setCur(Math.min(pptData.slides.length - 1, cur + 1))} disabled={cur === pptData.slides.length - 1} className="text-white/15 disabled:opacity-10 hover:text-white/30"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* ── Right: Property Panel ── */}
      <PropertyPanel slide={slide} si={cur} total={pptData.slides.length} onUpdate={(ns) => updateSlide(cur, ns)} onDelete={() => deleteSlide(cur)} onDuplicate={() => duplicateSlide(cur)} onMoveUp={() => moveSlide(cur, -1)} onMoveDown={() => moveSlide(cur, 1)} onAddSlide={addSlide} />
    </div>
  );
}

/* ═══════════════════════ PPTX Export ═══════════════════════ */
async function exportPPTX(pptData, theme, templates) {
  const pptx = new PptxGenJS();
  pptx.title = pptData.title;
  const hasTmplGlobal = !!(templates?.cover || templates?.middle || templates?.ending);
  const ac = (theme.accent || '#22d3ee').replace('#', '');

  for (const [idx, slide] of pptData.slides.entries()) {
    const bgHex = slide.bgColor ? slide.bgColor.replace('#', '') : (hasTmplGlobal ? 'FFFFFF' : (theme.bg || '#0c1222').replace('#', ''));
    const lightBg = slide.bgColor ? isLightColor(slide.bgColor) : hasTmplGlobal;
    const titleColor = lightBg ? '1a1a2e' : 'FFFFFF';
    const bodyColor = lightBg ? '1e293b' : 'CCCCCC';
    const subColor = lightBg ? '64748b' : '888888';
    const topY = lightBg ? 0.7 : 0.4;
    const csY = lightBg ? 1.6 : 1.3;

    const s = pptx.addSlide();
    s.background = { color: bgHex };
    let tmplBg = null;
    if (slide.bgImage) tmplBg = slide.bgImage;
    else if (slide.type === 'title' && templates?.cover?.dataUrl) tmplBg = templates.cover.dataUrl;
    else if (slide.type === 'closing' && templates?.ending?.dataUrl) tmplBg = templates.ending.dataUrl;
    else if (templates?.middle?.dataUrl && slide.type !== 'title' && slide.type !== 'closing') tmplBg = templates.middle.dataUrl;
    if (tmplBg) { try { s.background = { data: tmplBg }; } catch {} }

    if (slide.userImage) { try { s.addImage({ data: slide.userImage, x: 6, y: 1.5, w: 3.5, h: 3.5, sizing: { type: 'contain', w: 3.5, h: 3.5 } }); } catch {} }

    if (slide.type === 'title') {
      s.addText(slide.headline, { x: 0.5, y: 2.2, w: 9, h: 1.5, fontSize: 44, bold: true, color: titleColor, align: 'center', fontFace: 'Microsoft YaHei' });
      if (slide.subheadline) s.addText(slide.subheadline, { x: 0.5, y: 3.7, w: 9, h: 0.7, fontSize: 22, color: ac, align: 'center', fontFace: 'Microsoft YaHei' });
    } else if (slide.type === 'closing') {
      s.addText(slide.headline, { x: 0.5, y: 2, w: 9, h: 1, fontSize: 40, bold: true, color: titleColor, align: 'center', fontFace: 'Microsoft YaHei' });
      if (slide.subheadline) s.addText(slide.subheadline, { x: 0.5, y: 3.2, w: 9, h: 0.6, fontSize: 20, color: ac, align: 'center', fontFace: 'Microsoft YaHei' });
    } else if (slide.type === 'data') {
      s.addText(slide.headline, { x: 0.5, y: topY, w: 9, h: 0.7, fontSize: 28, bold: true, color: ac, fontFace: 'Microsoft YaHei' });
      (slide.metrics || []).forEach((m, i) => { const col = i % 3, row = Math.floor(i / 3); s.addText(m.value, { x: 0.5 + col * 3.2, y: csY + 0.3 + row * 2, w: 2.8, h: 0.8, fontSize: 32, bold: true, color: ac, align: 'center', fontFace: 'Microsoft YaHei' }); s.addText(m.label, { x: 0.5 + col * 3.2, y: csY + 1.1 + row * 2, w: 2.8, h: 0.4, fontSize: 14, color: subColor, align: 'center', fontFace: 'Microsoft YaHei' }); });
    } else {
      s.addText(slide.headline, { x: 0.5, y: topY, w: 9, h: 0.7, fontSize: 28, bold: true, color: ac, fontFace: 'Microsoft YaHei' });
      const bc = (slide.bullets || []).length;
      const sp = Math.min(1.3, (4.5 - 0.3) / Math.max(bc, 1));
      (slide.bullets || []).forEach((b, i) => { const parts = b.match(/^(.+?)[：:]\s*(.+)$/); const yP = csY + i * sp; if (parts) { s.addText(parts[1], { x: 0.8, y: yP, w: 8.2, h: 0.35, fontSize: 16, bold: true, color: lightBg ? '1a1a2e' : 'DDDDDD', fontFace: 'Microsoft YaHei' }); s.addText(parts[2], { x: 0.8, y: yP + 0.35, w: 8.2, h: 0.7, fontSize: 12, color: subColor, fontFace: 'Microsoft YaHei', lineSpacing: 16, valign: 'top' }); } else { s.addText(`•  ${b}`, { x: 0.8, y: yP, w: 8.2, h: 0.9, fontSize: 14, color: bodyColor, valign: 'top', fontFace: 'Microsoft YaHei', lineSpacing: 16 }); } });
    }
  }
  await pptx.writeFile({ fileName: `${pptData.title || 'GenSlides'}.pptx` });
}

/* ═══════════════════════ Main App ═══════════════════════ */
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
  const getTemplateInfo = () => { const p = []; if (templates.cover) p.push('封面模板'); if (templates.middle) p.push('内容页模板'); if (templates.ending) p.push('尾页模板'); return p.length ? `用户上传了${p.join('、')}` : ''; };

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
      const res = await fetch('/api/generate-ppt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outline, style: styleLabel, templateInfo: getTemplateInfo(), originalContent: content }) });
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

  const steps = [{ k: 'input', l: '输入', i: FileText }, { k: 'outline', l: '大纲', i: Brain }, { k: 'generate', l: '生成', i: Zap }, { k: 'editor', l: '编辑', i: Edit3 }];
  const stepIdx = phase === 'input' ? 0 : ['outlining', 'editing'].includes(phase) ? 1 : phase === 'generating' ? 2 : 3;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(160deg, #050a12, #0c1222 30%, #0f172a 70%, #050a12)' }}>
      <header className="flex-shrink-0 border-b border-white/[0.05] px-5 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"><Layers className="w-3.5 h-3.5 text-white" /></div>
            <div><h1 className="text-sm font-bold text-white tracking-tight">GenSlides</h1><p className="text-[8px] text-white/15 tracking-widest uppercase">AI Presentation Studio</p></div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {steps.map((s, i) => (<React.Fragment key={s.k}>{i > 0 && <div className={`w-5 h-px ${i <= stepIdx ? 'bg-cyan-500/40' : 'bg-white/[0.04]'}`} />}<div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] transition-all ${i === stepIdx ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30' : i < stepIdx ? 'text-cyan-500/40' : 'text-white/10'}`}><s.i className="w-3 h-3" /><span className="hidden lg:inline">{s.l}</span></div></React.Fragment>))}
          </div>
          {phase !== 'input' && <button onClick={resetAll} className="text-white/15 hover:text-white/50 text-xs flex items-center gap-1 transition-colors"><RotateCcw className="w-3 h-3" />重新开始</button>}
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {/* ── Input ── */}
        {phase === 'input' && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 pt-10 pb-20">
              <div className="text-center mb-8"><h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight leading-tight">Create Slide Deck from<br /><span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">your documents and notes</span></h2></div>
              <div className="relative mb-5"><div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden focus-within:border-cyan-500/25 transition-colors"><textarea value={content} onChange={e => setContent(e.target.value)} className="w-full h-40 bg-transparent px-5 pt-5 pb-14 text-white placeholder-white/15 focus:outline-none resize-none text-base leading-relaxed" placeholder="粘贴你的文字内容、项目资料、工作总结等原始材料..." /><div className="absolute bottom-3 right-3"><button onClick={generateOutline} disabled={!content.trim() && !prompt.trim()} className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white disabled:opacity-15 hover:shadow-lg hover:shadow-cyan-500/30 transition-all"><ArrowRight className="w-4 h-4" /></button></div></div></div>
              <div className="mb-5"><label className="text-[11px] font-medium text-white/20 mb-2.5 flex items-center gap-1.5 tracking-wider uppercase"><Upload className="w-3 h-3" /> PPT 模板 <span className="text-white/10 normal-case tracking-normal">（可选）</span></label><TemplateUpload templates={templates} setTemplates={setTemplates} /></div>
              <div className="mb-5"><label className="text-[11px] font-medium text-white/20 mb-2.5 block tracking-wider uppercase">PPT 场景</label><div className="grid grid-cols-4 md:grid-cols-7 gap-2">{STYLES.map(s => { const I = s.icon; return (<button key={s.id} onClick={() => setSelectedStyle(s.id)} className={`p-2.5 rounded-xl border text-center transition-all ${selectedStyle === s.id ? 'bg-white/[0.05] border-cyan-500/30 ring-1 ring-cyan-500/20' : 'bg-white/[0.015] border-white/[0.03] hover:border-white/[0.06]'}`}><I className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} /><div className="text-[11px] font-medium text-white/60">{s.label}</div></button>); })}</div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6"><div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3"><label className="text-[10px] text-white/20 mb-1.5 flex items-center gap-1"><Link className="w-3 h-3" />参考链接</label><input value={urls} onChange={e => setUrls(e.target.value)} className="w-full bg-transparent text-white/60 text-sm focus:outline-none placeholder-white/10" placeholder="https://..." /></div><div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3"><label className="text-[10px] text-white/20 mb-1.5 flex items-center gap-1"><Edit3 className="w-3 h-3" />额外需求</label><input value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-transparent text-white/60 text-sm focus:outline-none placeholder-white/10" placeholder="例如：10页，面向CTO..." /></div></div>
              {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-red-300 text-sm">{error}</div>}
              <button onClick={generateOutline} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-semibold shadow-xl shadow-cyan-500/20 transition-all text-base"><Wand2 className="w-5 h-5" /> 生成 PPT 大纲</button>
            </div>
          </div>
        )}

        {/* ── Outline ── */}
        {['outlining', 'editing'].includes(phase) && (
          <div className="h-full flex">
            <div className="w-[38%] p-3 flex flex-col border-r border-white/[0.04]"><ThinkingPanel text={thinkingText} isLoading={phase === 'outlining'} title="AI 分析过程" /></div>
            <div className="w-[62%] p-4 flex flex-col overflow-hidden">
              {phase === 'outlining' && !outline ? <div className="flex-1 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-cyan-500" /></div> : outline && <MindMapOutline outline={outline} setOutline={setOutline} onConfirm={generatePPT} isGenerating={phase === 'generating'} />}
              {error && <div className="mt-2 p-2.5 bg-red-500/10 border border-red-500/15 rounded-xl text-red-300 text-sm">{error}</div>}
            </div>
          </div>
        )}

        {/* ── Generating ── */}
        {phase === 'generating' && !pptData && (
          <div className="h-full flex">
            <div className="w-[38%] p-3 flex flex-col border-r border-white/[0.04]"><ThinkingPanel text={genThinking} isLoading={true} title="PPT 生成过程" /></div>
            <div className="w-[62%] p-4 flex flex-col overflow-hidden">
              {error ? (
                <div className="flex-1 flex items-center justify-center"><div className="text-center max-w-sm"><div className="p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-red-300 text-sm mb-3">⚠️ {error}</div><div className="flex gap-2 justify-center"><button onClick={() => { setError(null); setPhase('editing'); }} className="px-3 py-1.5 bg-white/5 text-white/40 rounded-lg text-xs">修改大纲</button><button onClick={() => { setError(null); generatePPT(); }} className="px-3 py-1.5 bg-cyan-500/15 text-cyan-400 rounded-lg text-xs">重试</button></div></div></div>
              ) : <div className="flex-1 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-cyan-500" /></div>}
            </div>
          </div>
        )}

        {/* ── Editor ── */}
        {phase === 'preview' && pptData && (
          <SlideEditor pptData={pptData} setPptData={setPptData} templates={templates} onReset={resetAll} onExport={handleExport} exporting={exporting} />
        )}
      </main>
    </div>
  );
}
