import React, { useState, useEffect, useRef } from 'react';
import { Download, ChevronLeft, ChevronRight, Loader2, Wand2, Plus, Trash2, Edit3, Link, FileText, Brain, Zap, Eye, RotateCcw, ArrowRight, Sparkles, MessageSquare, Target, BarChart3, Users, Lightbulb, BookOpen, Trophy, Briefcase, GraduationCap, ClipboardList, TrendingUp, Clock, CheckCircle2, Star, Layers, PieChart, ArrowUpRight, Shield, Globe, Rocket, Heart, Mic } from 'lucide-react';
import PptxGenJS from 'pptxgenjs';

// ============================================
// 常量
// ============================================
const STYLES = [
  { id: 'business', label: '商业演讲', icon: Mic, desc: '痛点→方案→优势→案例', color: '#3b82f6' },
  { id: 'review', label: '述职汇报', icon: BarChart3, desc: '总-分-总，数据驱动', color: '#10b981' },
  { id: 'pitch', label: '投融资路演', icon: TrendingUp, desc: '经典十页法则', color: '#f59e0b' },
  { id: 'training', label: '培训课件', icon: BookOpen, desc: '导入-展开-小结', color: '#8b5cf6' },
  { id: 'academic', label: '学术汇报', icon: GraduationCap, desc: '背景-方法-结果-结论', color: '#06b6d4' },
  { id: 'project', label: '项目总结', icon: ClipboardList, desc: '背景-过程-结果-改进', color: '#ec4899' },
  { id: 'compete', label: '竞聘演讲', icon: Trophy, desc: '个人优势-岗位匹配', color: '#ef4444' },
];

const SLIDE_TYPES = [
  { value: 'title', label: '封面页' },
  { value: 'agenda', label: '议程页' },
  { value: 'content', label: '内容页' },
  { value: 'data', label: '数据页' },
  { value: 'timeline', label: '时间线' },
  { value: 'two-column', label: '双栏对比' },
  { value: 'closing', label: '结束页' },
];

// Bullet icons pool - 每个 bullet 都配一个独特 icon
const BULLET_ICONS = [
  MessageSquare, Target, Lightbulb, Star, Rocket, Shield, Globe, Heart,
  CheckCircle2, Users, BarChart3, TrendingUp, Layers, PieChart, ArrowUpRight, Briefcase,
];

// ============================================
// 打字机动画 Hook
// ============================================
function useTypewriter(text, speed = 10, enabled = true) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);
  useEffect(() => {
    if (!text || !enabled) { setDisplayed(text || ''); setIsDone(true); return; }
    setDisplayed(''); setIsDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i = Math.min(i + Math.floor(Math.random() * 3) + 2, text.length);
      setDisplayed(text.substring(0, i));
      if (i >= text.length) { clearInterval(timer); setIsDone(true); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, enabled]);
  return { displayed, isDone };
}

// ============================================
// 暗色主题 Slide 渲染器
// ============================================
function SlideRenderer({ slide, theme, slideIndex = 0, totalSlides = 1 }) {
  const accent = theme?.accent || '#22d3ee';

  // 为每个 bullet 分配不同 icon
  const getIcon = (idx) => {
    const Icon = BULLET_ICONS[(slideIndex * 5 + idx) % BULLET_ICONS.length];
    return <Icon className="w-5 h-5" style={{ color: accent }} />;
  };

  // 装饰性渐变块
  const DecoBlock = ({ className = '' }) => (
    <div className={`absolute rounded-2xl opacity-20 ${className}`}
      style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}10)` }} />
  );

  const slideContent = {
    title: (
      <div className="flex flex-col items-center justify-center h-full text-center px-10 relative">
        <DecoBlock className="w-32 h-32 -top-4 -right-4 blur-xl" />
        <DecoBlock className="w-24 h-24 -bottom-4 -left-4 blur-xl" />
        <div className="w-16 h-1 rounded-full mb-6" style={{ background: accent }} />
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">{slide.headline}</h1>
        {slide.subheadline && <p className="text-base md:text-lg font-medium" style={{ color: `${accent}cc` }}>{slide.subheadline}</p>}
        <div className="w-16 h-1 rounded-full mt-6" style={{ background: accent }} />
      </div>
    ),

    agenda: (
      <div className="flex flex-col h-full p-7">
        <h2 className="text-2xl font-bold mb-6" style={{ color: accent }}>{slide.headline}</h2>
        <div className="flex-1 flex flex-col justify-center space-y-4">
          {slide.bullets?.map((b, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}88)` }}>{i + 1}</div>
              <span className="text-white/90 text-sm md:text-base font-medium">{b}</span>
            </div>
          ))}
        </div>
      </div>
    ),

    data: (
      <div className="flex flex-col h-full p-7">
        <h2 className="text-2xl font-bold mb-6" style={{ color: accent }}>{slide.headline}</h2>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 content-center">
          {slide.metrics?.map((m, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="text-3xl font-extrabold mb-1" style={{ color: accent }}>{m.value}</div>
              <div className="text-sm font-semibold text-white/80">{m.label}</div>
              {m.description && <div className="text-xs text-white/40 mt-1">{m.description}</div>}
            </div>
          ))}
        </div>
      </div>
    ),

    timeline: (
      <div className="flex flex-col h-full p-7">
        <h2 className="text-2xl font-bold mb-6" style={{ color: accent }}>{slide.headline}</h2>
        <div className="flex-1 flex items-center">
          <div className="w-full flex items-start justify-between relative">
            <div className="absolute top-5 left-4 right-4 h-0.5" style={{ background: `${accent}30` }} />
            {slide.items?.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10 flex-1 px-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold mb-3 border-2"
                  style={{ background: `${accent}20`, borderColor: accent }}>{i + 1}</div>
                <div className="text-xs font-bold mb-1" style={{ color: accent }}>{item.phase}</div>
                <div className="text-xs font-medium text-white/80">{item.title}</div>
                <div className="text-xs text-white/40 mt-0.5">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    'two-column': (
      <div className="flex flex-col h-full p-7">
        <h2 className="text-2xl font-bold mb-5" style={{ color: accent }}>{slide.headline}</h2>
        <div className="flex-1 grid grid-cols-2 gap-4">
          {[{ title: slide.leftTitle, bullets: slide.leftBullets }, { title: slide.rightTitle, bullets: slide.rightBullets }].map((col, ci) => (
            <div key={ci} className="p-4 rounded-xl bg-white/5 border border-white/5">
              <h3 className="font-bold mb-3 text-sm" style={{ color: accent }}>{col.title}</h3>
              <ul className="space-y-2">
                {col.bullets?.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: accent }} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),

    closing: (
      <div className="flex flex-col items-center justify-center h-full text-center px-10 relative">
        <DecoBlock className="w-40 h-40 top-0 right-0 blur-2xl" />
        <h1 className="text-3xl font-extrabold text-white mb-3">{slide.headline}</h1>
        {slide.subheadline && <p className="text-base font-medium mb-5" style={{ color: `${accent}cc` }}>{slide.subheadline}</p>}
        <div className="space-y-2">
          {slide.bullets?.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" style={{ color: accent }} />
              <span className="text-sm text-white/80">{b}</span>
            </div>
          ))}
        </div>
      </div>
    ),

    // Default: content type (参考 Image 2 的设计)
    content: (
      <div className="flex h-full">
        {/* 左侧内容区 */}
        <div className="flex-1 flex flex-col p-7">
          <h2 className="text-2xl font-extrabold mb-6" style={{ color: accent }}>{slide.headline}</h2>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {slide.bullets?.map((b, i) => {
              // 尝试拆分 "标题: 描述" 格式
              const parts = b.match(/^(.+?)[：:]\s*(.+)$/);
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${accent}15` }}>
                    {getIcon(i)}
                  </div>
                  <div>
                    {parts ? (
                      <>
                        <div className="text-sm font-bold text-white/90">{parts[1]}</div>
                        <div className="text-xs text-white/50 mt-0.5">{parts[2]}</div>
                      </>
                    ) : (
                      <div className="text-sm text-white/80 leading-relaxed">{b}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* 右侧装饰区 */}
        <div className="w-2/5 hidden md:flex items-center justify-center p-4">
          <div className="w-full h-4/5 rounded-2xl overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, ${accent}12, ${accent}05)` }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-10" style={{ color: accent }}>
                {getIcon(slideIndex)}
              </div>
            </div>
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: `radial-gradient(${accent} 1px, transparent 1px)`, backgroundSize: '16px 16px' }} />
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="aspect-video rounded-2xl shadow-2xl overflow-hidden relative"
      style={{ background: 'linear-gradient(160deg, #0c1222 0%, #111b30 50%, #0e1526 100%)' }}>
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      {/* Slide number */}
      <div className="absolute top-3 left-4 text-xs text-white/20 font-mono">
        {String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
      </div>
      {slideContent[slide.type] || slideContent.content}
    </div>
  );
}

// ============================================
// 思考过程面板
// ============================================
function ThinkingPanel({ text, isLoading, title = '分析过程' }) {
  const { displayed, isDone } = useTypewriter(text, 10, !!text);
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [displayed]);

  const renderMd = (md) => {
    if (!md) return null;
    return md.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-cyan-300 font-bold mt-3 mb-1 text-sm">{line.replace('### ', '')}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-cyan-200 font-bold mt-4 mb-1">{line.replace('## ', '')}</h2>;
      if (line.match(/^\d+\.\s/)) return <p key={i} className="text-cyan-400 ml-2 my-0.5 text-sm">{line.replace(/\*\*/g, '')}</p>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <p key={i} className="text-cyan-400/70 ml-4 my-0.5 text-sm">› {line.replace(/^[-*]\s/, '')}</p>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-cyan-400/60 my-0.5 text-sm">{line.replace(/\*\*/g, '')}</p>;
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0f1a] rounded-2xl border border-cyan-900/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-cyan-900/20 flex items-center gap-2">
        <Brain className="w-4 h-4 text-cyan-500" />
        <span className="text-cyan-400 font-mono text-sm font-medium">{title}</span>
        {(isLoading || (!isDone && text)) && <Loader2 className="w-3 h-3 text-cyan-500 animate-spin ml-auto" />}
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto p-4 font-mono">
        {isLoading && !text && (
          <div className="flex items-center gap-2 text-cyan-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI 正在分析...</span>
          </div>
        )}
        {renderMd(displayed)}
        {!isDone && text && <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-0.5" />}
      </div>
    </div>
  );
}

// ============================================
// 大纲编辑器
// ============================================
function OutlineEditor({ outline, setOutline, onConfirm, isGenerating }) {
  if (!outline) return null;
  const updateSlide = (i, f, v) => { const s = [...outline.slides]; s[i] = { ...s[i], [f]: v }; setOutline({ ...outline, slides: s }); };
  const updateBullets = (i, text) => updateSlide(i, 'bullets', text.split('\n').filter(l => l.trim()));
  const addSlide = () => setOutline({ ...outline, slides: [...outline.slides, { type: 'content', headline: '新页面', bullets: ['要点 1'] }] });
  const removeSlide = (i) => { if (outline.slides.length <= 1) return; setOutline({ ...outline, slides: outline.slides.filter((_, j) => j !== i) }); };
  const moveSlide = (i, d) => { const n = i + d; if (n < 0 || n >= outline.slides.length) return; const s = [...outline.slides]; [s[i], s[n]] = [s[n], s[i]]; setOutline({ ...outline, slides: s }); };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 p-4 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
        <label className="text-xs text-white/30 mb-1 block">PPT 标题</label>
        <input value={outline.title} onChange={e => setOutline({ ...outline, title: e.target.value })} className="w-full bg-transparent text-white text-lg font-bold border-b border-white/10 pb-1 focus:outline-none focus:border-cyan-500 transition-colors" />
        <div className="flex gap-4 mt-2">
          <div className="flex-1">
            <label className="text-xs text-white/20">目标受众</label>
            <input value={outline.audience || ''} onChange={e => setOutline({ ...outline, audience: e.target.value })} className="w-full bg-transparent text-white/60 text-sm border-b border-white/5 pb-1 focus:outline-none focus:border-cyan-500 transition-colors" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-white/20">场景</label>
            <input value={outline.style || ''} readOnly className="w-full bg-transparent text-white/30 text-sm border-b border-white/5 pb-1" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {outline.slides.map((slide, idx) => (
          <div key={idx} className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 hover:border-white/10 transition-all group">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded">{idx + 1}</span>
              <select value={slide.type} onChange={e => updateSlide(idx, 'type', e.target.value)} className="text-xs bg-white/5 text-white/60 rounded px-2 py-1 border border-white/5 focus:outline-none">
                {SLIDE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0} className="text-white/20 hover:text-white disabled:opacity-20 p-1 text-xs">↑</button>
                <button onClick={() => moveSlide(idx, 1)} disabled={idx === outline.slides.length - 1} className="text-white/20 hover:text-white disabled:opacity-20 p-1 text-xs">↓</button>
                <button onClick={() => removeSlide(idx)} className="text-red-400/40 hover:text-red-400 p-1"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
            <input value={slide.headline} onChange={e => updateSlide(idx, 'headline', e.target.value)} className="w-full bg-transparent text-white font-semibold text-sm border-b border-white/5 pb-1 mb-2 focus:outline-none focus:border-cyan-500" placeholder="页面标题" />
            {slide.type === 'title' && <input value={slide.subheadline || ''} onChange={e => updateSlide(idx, 'subheadline', e.target.value)} className="w-full bg-transparent text-white/40 text-sm border-b border-white/5 pb-1 focus:outline-none focus:border-cyan-500" placeholder="副标题" />}
            {['content', 'agenda', 'closing'].includes(slide.type) && (
              <textarea value={(slide.bullets || []).join('\n')} onChange={e => updateBullets(idx, e.target.value)} className="w-full bg-white/[0.03] rounded-lg text-white/60 text-sm p-2 mt-1 border border-white/[0.04] focus:outline-none focus:border-cyan-500/30 resize-none" rows={Math.max(2, (slide.bullets || []).length + 1)} placeholder="每行一个要点" />
            )}
            {slide.type === 'data' && (slide.metrics || []).map((m, mi) => (
              <div key={mi} className="flex gap-2 mt-1">
                <input value={m.label} onChange={e => { const ms = [...(slide.metrics||[])]; ms[mi] = {...ms[mi], label: e.target.value}; updateSlide(idx, 'metrics', ms); }} className="flex-1 bg-white/[0.03] text-white/60 text-xs rounded px-2 py-1 border border-white/[0.04] focus:outline-none" placeholder="指标" />
                <input value={m.value} onChange={e => { const ms = [...(slide.metrics||[])]; ms[mi] = {...ms[mi], value: e.target.value}; updateSlide(idx, 'metrics', ms); }} className="w-20 bg-white/[0.03] text-cyan-400 text-xs rounded px-2 py-1 border border-white/[0.04] focus:outline-none font-bold" placeholder="数值" />
              </div>
            ))}
            {slide.type === 'two-column' && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <input value={slide.leftTitle || ''} onChange={e => updateSlide(idx, 'leftTitle', e.target.value)} className="w-full bg-white/[0.03] text-cyan-400 text-xs font-bold rounded px-2 py-1 mb-1 border border-white/[0.04] focus:outline-none" placeholder="左标题" />
                  <textarea value={(slide.leftBullets || []).join('\n')} onChange={e => updateSlide(idx, 'leftBullets', e.target.value.split('\n').filter(l => l.trim()))} className="w-full bg-white/[0.03] text-white/60 text-xs rounded px-2 py-1 border border-white/[0.04] focus:outline-none resize-none" rows={3} />
                </div>
                <div>
                  <input value={slide.rightTitle || ''} onChange={e => updateSlide(idx, 'rightTitle', e.target.value)} className="w-full bg-white/[0.03] text-cyan-400 text-xs font-bold rounded px-2 py-1 mb-1 border border-white/[0.04] focus:outline-none" placeholder="右标题" />
                  <textarea value={(slide.rightBullets || []).join('\n')} onChange={e => updateSlide(idx, 'rightBullets', e.target.value.split('\n').filter(l => l.trim()))} className="w-full bg-white/[0.03] text-white/60 text-xs rounded px-2 py-1 border border-white/[0.04] focus:outline-none resize-none" rows={3} />
                </div>
              </div>
            )}
            {slide.type === 'timeline' && (slide.items || []).map((item, ti) => (
              <div key={ti} className="flex gap-2 mt-1">
                <input value={item.phase} onChange={e => { const items = [...slide.items]; items[ti] = {...items[ti], phase: e.target.value}; updateSlide(idx, 'items', items); }} className="w-16 bg-white/[0.03] text-cyan-400 text-xs rounded px-2 py-1 border border-white/[0.04] focus:outline-none" placeholder="阶段" />
                <input value={item.title} onChange={e => { const items = [...slide.items]; items[ti] = {...items[ti], title: e.target.value}; updateSlide(idx, 'items', items); }} className="flex-1 bg-white/[0.03] text-white/60 text-xs rounded px-2 py-1 border border-white/[0.04] focus:outline-none" placeholder="标题" />
              </div>
            ))}
          </div>
        ))}
        <button onClick={addSlide} className="w-full py-3 border border-dashed border-white/10 hover:border-white/20 rounded-xl text-white/20 hover:text-white/50 flex items-center justify-center gap-2 transition-all text-sm">
          <Plus className="w-4 h-4" /> 添加页面
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.06]">
        <button onClick={onConfirm} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-cyan-500/20 transition-all">
          {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />生成中...</> : <><Zap className="w-5 h-5" />确认大纲，生成 PPT</>}
        </button>
      </div>
    </div>
  );
}

// ============================================
// PPT 预览面板
// ============================================
function PPTPreview({ pptData, onReset }) {
  const [cur, setCur] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') setCur(p => Math.min(p + 1, (pptData?.slides?.length || 1) - 1));
      if (e.key === 'ArrowLeft') setCur(p => Math.max(p - 1, 0));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [pptData]);

  const exportPPTX = async () => {
    setExporting(true);
    try {
      const pptx = new PptxGenJS();
      pptx.title = pptData.title;
      const t = pptData.theme || { primary: '#22d3ee', accent: '#22d3ee', background: '#0c1222' };
      pptx.defineSlideMaster({ title: 'M', background: { color: '0c1222' } });

      pptData.slides.forEach(slide => {
        const s = pptx.addSlide({ masterName: 'M' });
        const ac = (t.accent || '#22d3ee').replace('#', '');

        if (slide.type === 'title') {
          s.addText(slide.headline, { x: 0.5, y: 2, w: 9, h: 1.5, fontSize: 44, bold: true, color: 'FFFFFF', align: 'center' });
          if (slide.subheadline) s.addText(slide.subheadline, { x: 0.5, y: 3.5, w: 9, h: 0.8, fontSize: 24, color: ac, align: 'center' });
        } else if (slide.type === 'agenda') {
          s.addText(slide.headline, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: ac });
          slide.bullets?.forEach((b, i) => s.addText(`${i + 1}.  ${b}`, { x: 1, y: 1.8 + i * 0.8, w: 8, h: 0.6, fontSize: 20, color: 'CCCCCC' }));
        } else if (slide.type === 'data') {
          s.addText(slide.headline, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: ac });
          slide.metrics?.forEach((m, i) => {
            const col = i % 3, row = Math.floor(i / 3);
            s.addText(m.value, { x: 0.5 + col * 3.2, y: 1.8 + row * 2, w: 2.8, h: 0.8, fontSize: 36, bold: true, color: ac, align: 'center' });
            s.addText(m.label, { x: 0.5 + col * 3.2, y: 2.6 + row * 2, w: 2.8, h: 0.5, fontSize: 16, color: 'AAAAAA', align: 'center' });
          });
        } else if (slide.type === 'two-column') {
          s.addText(slide.headline, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: ac });
          s.addText(slide.leftTitle || '', { x: 0.5, y: 1.5, w: 4, h: 0.5, fontSize: 20, bold: true, color: ac });
          slide.leftBullets?.forEach((b, i) => s.addText(`• ${b}`, { x: 0.7, y: 2.2 + i * 0.6, w: 4, h: 0.5, fontSize: 16, color: 'CCCCCC' }));
          s.addText(slide.rightTitle || '', { x: 5, y: 1.5, w: 4, h: 0.5, fontSize: 20, bold: true, color: ac });
          slide.rightBullets?.forEach((b, i) => s.addText(`• ${b}`, { x: 5.2, y: 2.2 + i * 0.6, w: 4, h: 0.5, fontSize: 16, color: 'CCCCCC' }));
        } else if (slide.type === 'closing') {
          s.addText(slide.headline, { x: 0.5, y: 1.5, w: 9, h: 1, fontSize: 40, bold: true, color: 'FFFFFF', align: 'center' });
          if (slide.subheadline) s.addText(slide.subheadline, { x: 0.5, y: 2.8, w: 9, h: 0.6, fontSize: 22, color: ac, align: 'center' });
          slide.bullets?.forEach((b, i) => s.addText(`→ ${b}`, { x: 2.5, y: 3.8 + i * 0.6, w: 5, h: 0.5, fontSize: 18, color: 'CCCCCC' }));
        } else if (slide.type === 'timeline') {
          s.addText(slide.headline, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: ac });
          const c = slide.items?.length || 1;
          slide.items?.forEach((item, i) => {
            const x = 0.5 + (i * (9 / c));
            s.addText(item.phase, { x, y: 2, w: 9/c - 0.2, h: 0.4, fontSize: 14, bold: true, color: ac, align: 'center' });
            s.addText(item.title, { x, y: 2.5, w: 9/c - 0.2, h: 0.4, fontSize: 14, color: 'CCCCCC', align: 'center' });
          });
        } else {
          s.addText(slide.headline, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: ac });
          slide.bullets?.forEach((b, i) => s.addText(`•  ${b}`, { x: 0.8, y: 1.6 + i * 0.9, w: 8.5, h: 0.8, fontSize: 18, color: 'CCCCCC', valign: 'top' }));
        }
      });
      await pptx.writeFile({ fileName: `${pptData.title || 'GenSlides'}.pptx` });
    } catch (err) { alert('导出失败：' + err.message); }
    finally { setExporting(false); }
  };

  if (!pptData) return null;
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-white">{pptData.title}</h2>
          <p className="text-xs text-white/30">{pptData.slides.length} 页 · 方向键导航</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onReset} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg text-sm transition-colors"><RotateCcw className="w-3.5 h-3.5" />重做</button>
          <button onClick={exportPPTX} disabled={exporting} className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 shadow-lg shadow-cyan-500/20">
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {exporting ? '导出中...' : '导出 PPTX'}
          </button>
        </div>
      </div>
      <div className="flex-1 flex gap-3 min-h-0">
        <div className="w-24 md:w-32 flex-shrink-0 overflow-y-auto space-y-1.5 pr-1">
          {pptData.slides.map((slide, i) => (
            <button key={i} onClick={() => setCur(i)} className={`w-full aspect-video rounded-lg overflow-hidden border-2 transition-all ${cur === i ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-white/5 hover:border-white/10'}`}>
              <div className="w-full h-full p-1.5 text-left" style={{ background: 'linear-gradient(160deg, #0c1222, #111b30)' }}>
                <div className="text-xs font-medium truncate text-white/60">{slide.headline}</div>
                <div className="text-xs text-white/20 font-mono">{i + 1}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="relative flex-1">
            <SlideRenderer slide={pptData.slides[cur]} theme={pptData.theme} slideIndex={cur} totalSlides={pptData.slides.length} />
            <button onClick={() => setCur(p => Math.max(p - 1, 0))} disabled={cur === 0} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white disabled:opacity-20 transition-all"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCur(p => Math.min(p + 1, pptData.slides.length - 1))} disabled={cur === pptData.slides.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white disabled:opacity-20 transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {pptData.slides.map((_, i) => <button key={i} onClick={() => setCur(i)} className={`h-1 rounded-full transition-all ${cur === i ? 'bg-cyan-500 w-5' : 'bg-white/10 w-1.5'}`} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 主应用 - GenSlides
// ============================================
export default function App() {
  const [phase, setPhase] = useState('input');
  const [selectedStyle, setSelectedStyle] = useState('business');
  const [content, setContent] = useState('');
  const [urls, setUrls] = useState('');
  const [prompt, setPrompt] = useState('');
  const [thinkingText, setThinkingText] = useState('');
  const [outline, setOutline] = useState(null);
  const [genThinking, setGenThinking] = useState('');
  const [pptData, setPptData] = useState(null);
  const [error, setError] = useState(null);

  const currentStyleLabel = STYLES.find(s => s.id === selectedStyle)?.label || '商业演讲';

  const generateOutline = async () => {
    if (!content.trim() && !prompt.trim()) { setError('请输入内容或需求描述'); return; }
    setPhase('outlining'); setError(null); setThinkingText(''); setOutline(null);
    try {
      const res = await fetch('/api/generate-outline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, style: currentStyleLabel, content, urls }) });
      const raw = await res.text();
      let result; try { result = JSON.parse(raw); } catch { throw new Error('服务器返回了非预期的响应，请稍后重试'); }
      if (!res.ok) throw new Error(result.error || '生成失败');
      setThinkingText(result.thinking || '分析完成。');
      if (result.outline) { setOutline(result.outline); setTimeout(() => setPhase('editing'), 500); }
      else throw new Error('未能生成大纲，请补充更多内容');
    } catch (err) { setError(err.message); setPhase('input'); }
  };

  const generatePPT = async () => {
    if (!outline) return;
    setPhase('generating'); setGenThinking(''); setPptData(null); setError(null);
    try {
      const res = await fetch('/api/generate-ppt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outline, style: currentStyleLabel }) });
      const raw = await res.text();
      let result; try { result = JSON.parse(raw); } catch { throw new Error('服务器返回了非预期的响应，请稍后重试'); }
      if (!res.ok) throw new Error(result.error || '生成失败');
      setGenThinking(result.thinking || '生成完成。');
      const finalData = result.pptData || outline;
      // 强制暗色主题
      if (finalData && !finalData.theme?.accent) {
        finalData.theme = { primary: '#e2e8f0', accent: '#22d3ee', background: '#0c1222' };
      }
      setPptData(finalData);
      setTimeout(() => setPhase('preview'), 500);
    } catch (err) { setError(err.message || '生成失败'); }
  };

  const resetAll = () => { setPhase('input'); setThinkingText(''); setOutline(null); setGenThinking(''); setPptData(null); setError(null); };

  const steps = [
    { key: 'input', label: '输入材料', icon: FileText },
    { key: 'outline', label: '生成大纲', icon: Brain },
    { key: 'generate', label: '生成 PPT', icon: Zap },
    { key: 'preview', label: '预览导出', icon: Eye },
  ];
  const stepIndex = phase === 'input' ? 0 : ['outlining', 'editing'].includes(phase) ? 1 : phase === 'generating' ? 2 : 3;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(160deg, #070b14 0%, #0c1222 30%, #0f172a 70%, #070b14 100%)' }}>
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/[0.06] backdrop-blur-sm px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">GenSlides</h1>
              <p className="text-[10px] text-white/20 tracking-widest uppercase">AI Presentation Studio</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {steps.map((step, i) => (
              <React.Fragment key={step.key}>
                {i > 0 && <div className={`w-6 h-px ${i <= stepIndex ? 'bg-cyan-500/50' : 'bg-white/[0.06]'}`} />}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${i === stepIndex ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30' : i < stepIndex ? 'text-cyan-500/50' : 'text-white/15'}`}>
                  <step.icon className="w-3 h-3" />
                  <span className="hidden lg:inline">{step.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          {phase !== 'input' && (
            <button onClick={resetAll} className="text-white/20 hover:text-white/60 text-sm flex items-center gap-1 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> 重新开始
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        {/* ====== 输入阶段 - NotebookLM 风格 ====== */}
        {phase === 'input' && (
          <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 pt-12 pb-20">
              {/* Hero */}
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
                  Create Slide Deck from<br />
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">your documents and notes</span>
                </h2>
              </div>

              {/* 大输入框 - NotebookLM 风格 */}
              <div className="relative mb-6">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden focus-within:border-cyan-500/30 transition-colors">
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full h-44 bg-transparent px-5 pt-5 pb-14 text-white placeholder-white/20 focus:outline-none resize-none text-base leading-relaxed"
                    placeholder="粘贴你的文字内容、项目资料、工作总结等原始材料..."
                  />
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={generateOutline}
                      disabled={!content.trim() && !prompt.trim()}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white disabled:opacity-20 hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* PPT 场景选择 */}
              <div className="mb-6">
                <label className="text-xs font-medium text-white/30 mb-3 block tracking-wider uppercase">PPT 场景风格</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {STYLES.map(s => {
                    const Icon = s.icon;
                    return (
                      <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${selectedStyle === s.id ? 'bg-white/[0.06] border-cyan-500/30 ring-1 ring-cyan-500/20' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'}`}>
                        <Icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
                        <div className="text-sm font-semibold text-white/80">{s.label}</div>
                        <div className="text-[11px] text-white/25 mt-0.5">{s.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 参考资料 & 额外需求 */}
              <div className="space-y-4 mb-8">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <label className="text-xs font-medium text-white/30 mb-2 flex items-center gap-2">
                    <Link className="w-3.5 h-3.5" /> 参考资料链接 <span className="text-white/15">（可选）</span>
                  </label>
                  <input value={urls} onChange={e => setUrls(e.target.value)} className="w-full bg-transparent text-white/70 text-sm focus:outline-none placeholder-white/15" placeholder="https://example.com/document.pdf" />
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <label className="text-xs font-medium text-white/30 mb-2 flex items-center gap-2">
                    <Edit3 className="w-3.5 h-3.5" /> 额外需求说明 <span className="text-white/15">（可选）</span>
                  </label>
                  <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-transparent text-white/70 text-sm focus:outline-none placeholder-white/15 resize-none" rows={2} placeholder="例如：大约 10 页，面向 CTO，偏技术但要有商业价值..." />
                </div>
              </div>

              {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}

              {/* 生成按钮 */}
              <button onClick={generateOutline} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-semibold shadow-xl shadow-cyan-500/20 transition-all text-base">
                <Wand2 className="w-5 h-5" /> 生成 PPT 大纲
              </button>

              <p className="text-center text-white/10 text-xs mt-6">Powered by Gemini · 免费使用</p>
            </div>
          </div>
        )}

        {/* ====== 大纲阶段 ====== */}
        {['outlining', 'editing'].includes(phase) && (
          <div className="h-full flex">
            <div className="w-1/2 lg:w-2/5 p-4 flex flex-col border-r border-white/[0.06]">
              <ThinkingPanel text={thinkingText} isLoading={phase === 'outlining'} title="AI 分析过程" />
            </div>
            <div className="w-1/2 lg:w-3/5 p-4 flex flex-col overflow-hidden">
              {phase === 'outlining' && !outline ? (
                <div className="flex-1 flex items-center justify-center"><div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-500" /><p className="text-white/20 text-sm">正在生成大纲...</p></div></div>
              ) : outline && <OutlineEditor outline={outline} setOutline={setOutline} onConfirm={generatePPT} isGenerating={phase === 'generating'} />}
              {error && <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}
            </div>
          </div>
        )}

        {/* ====== 生成 + 预览阶段 ====== */}
        {['generating', 'preview'].includes(phase) && (
          <div className="h-full flex">
            <div className="w-1/2 lg:w-2/5 p-4 flex flex-col border-r border-white/[0.06]">
              <ThinkingPanel text={genThinking} isLoading={phase === 'generating'} title="PPT 生成过程" />
            </div>
            <div className="w-1/2 lg:w-3/5 p-4 flex flex-col overflow-hidden">
              {phase === 'generating' && !pptData && !error ? (
                <div className="flex-1 flex items-center justify-center"><div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-500" /><p className="text-white/20 text-sm">正在生成 PPT...</p></div></div>
              ) : null}
              {error && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm mb-4">⚠️ {error}</div>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => { setError(null); setPhase('editing'); }} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg text-sm flex items-center gap-1.5 transition-colors"><Edit3 className="w-3.5 h-3.5" />返回修改</button>
                      <button onClick={() => { setError(null); generatePPT(); }} className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm flex items-center gap-1.5 transition-colors"><RotateCcw className="w-3.5 h-3.5" />重试</button>
                    </div>
                  </div>
                </div>
              )}
              {pptData && <PPTPreview pptData={pptData} onReset={resetAll} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
