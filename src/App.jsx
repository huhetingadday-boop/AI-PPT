import React, { useState, useEffect, useRef } from 'react';
import { Download, ChevronLeft, ChevronRight, Loader2, Layers, Wand2, Sparkles, RotateCcw, Plus, Trash2, Edit3, Check, Link, FileText, ChevronDown, Brain, Zap, Eye } from 'lucide-react';
import PptxGenJS from 'pptxgenjs';

// ============================================
// 常量
// ============================================
const STYLES = [
  { id: 'business', label: '商业演讲', icon: '🎤', desc: '痛点-方案-优势-案例' },
  { id: 'review', label: '述职汇报', icon: '📊', desc: '总-分-总，数据驱动' },
  { id: 'pitch', label: '投融资路演', icon: '💰', desc: '经典十页法则' },
  { id: 'training', label: '培训课件', icon: '📚', desc: '导入-展开-小结' },
  { id: 'academic', label: '学术汇报', icon: '🔬', desc: '背景-方法-结果-结论' },
  { id: 'project', label: '项目总结', icon: '📋', desc: '背景-过程-结果-改进' },
  { id: 'compete', label: '竞聘演讲', icon: '🏆', desc: '个人优势-岗位匹配' },
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

// ============================================
// 打字机动画 Hook
// ============================================
function useTypewriter(text, speed = 12, enabled = true) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!text || !enabled) { setDisplayed(text || ''); setIsDone(true); return; }
    setDisplayed(''); setIsDone(false);
    let i = 0;
    const timer = setInterval(() => {
      const chunk = Math.floor(Math.random() * 3) + 2;
      i = Math.min(i + chunk, text.length);
      setDisplayed(text.substring(0, i));
      if (i >= text.length) { clearInterval(timer); setIsDone(true); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return { displayed, isDone };
}

// ============================================
// 思考过程展示面板
// ============================================
function ThinkingPanel({ text, isLoading, title = '分析过程' }) {
  const { displayed, isDone } = useTypewriter(text, 10, !!text);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [displayed]);

  const renderMarkdown = (md) => {
    if (!md) return null;
    return md.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-green-300 font-bold mt-3 mb-1 text-sm">{line.replace('### ', '')}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-green-200 font-bold mt-4 mb-1">{line.replace('## ', '')}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="text-green-100 font-bold mt-4 mb-2 text-lg">{line.replace('# ', '')}</h1>;
      if (line.match(/^\d+\.\s\*\*/)) return <p key={i} className="text-green-400 ml-2 my-0.5 text-sm">{line.replace(/\*\*/g, '')}</p>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <p key={i} className="text-green-400/80 ml-4 my-0.5 text-sm">• {line.replace(/^[-*]\s/, '')}</p>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-green-400/70 my-0.5 text-sm">{line.replace(/\*\*/g, '')}</p>;
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 rounded-xl border border-green-900/30 overflow-hidden">
      <div className="px-4 py-3 border-b border-green-900/30 flex items-center gap-2 bg-gray-950">
        <Brain className="w-4 h-4 text-green-500" />
        <span className="text-green-400 font-mono text-sm font-medium">{title}</span>
        {(isLoading || (!isDone && text)) && <Loader2 className="w-3 h-3 text-green-500 animate-spin ml-auto" />}
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto p-4 font-mono">
        {isLoading && !text && (
          <div className="flex items-center gap-2 text-green-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI 正在分析...</span>
          </div>
        )}
        {renderMarkdown(displayed)}
        {!isDone && text && <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-0.5" />}
      </div>
    </div>
  );
}

// ============================================
// Slide 渲染器（预览用）
// ============================================
function SlideRenderer({ slide, theme }) {
  const c = theme?.primary || '#1e293b';
  const a = theme?.accent || '#3b82f6';
  const bg = theme?.background || '#ffffff';

  const content = {
    title: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: c }}>{slide.headline}</h1>
        {slide.subheadline && <p className="text-base md:text-lg" style={{ color: a }}>{slide.subheadline}</p>}
      </div>
    ),
    agenda: (
      <div className="flex flex-col h-full p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: c }}>{slide.headline}</h2>
        <div className="flex-1 flex flex-col justify-center space-y-3">
          {slide.bullets?.map((b, i) => (
            <div key={i} className="flex items-center">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold mr-3 text-sm flex-shrink-0" style={{ backgroundColor: a }}>{i + 1}</div>
              <span className="text-sm md:text-base" style={{ color: c }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    data: (
      <div className="flex flex-col h-full p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: c }}>{slide.headline}</h2>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 content-center">
          {slide.metrics?.map((m, i) => (
            <div key={i} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${a}12` }}>
              <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: a }}>{m.value}</div>
              <div className="text-sm font-medium" style={{ color: c }}>{m.label}</div>
              {m.description && <div className="text-xs mt-1 opacity-60" style={{ color: c }}>{m.description}</div>}
            </div>
          ))}
        </div>
      </div>
    ),
    timeline: (
      <div className="flex flex-col h-full p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: c }}>{slide.headline}</h2>
        <div className="flex-1 flex items-center">
          <div className="w-full flex items-start justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5" style={{ backgroundColor: `${a}40` }} />
            {slide.items?.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center relative z-10 flex-1 px-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mb-2" style={{ backgroundColor: a }}>{i + 1}</div>
                <div className="text-xs font-bold mb-1" style={{ color: a }}>{item.phase}</div>
                <div className="text-xs font-medium" style={{ color: c }}>{item.title}</div>
                <div className="text-xs opacity-60 mt-0.5" style={{ color: c }}>{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    'two-column': (
      <div className="flex flex-col h-full p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: c }}>{slide.headline}</h2>
        <div className="flex-1 grid grid-cols-2 gap-4">
          {[{ title: slide.leftTitle, bullets: slide.leftBullets }, { title: slide.rightTitle, bullets: slide.rightBullets }].map((col, ci) => (
            <div key={ci} className="p-3 rounded-lg" style={{ backgroundColor: `${a}12` }}>
              <h3 className="font-bold mb-2 text-sm" style={{ color: a }}>{col.title}</h3>
              <ul className="space-y-1.5">
                {col.bullets?.map((b, i) => <li key={i} className="flex items-start text-xs md:text-sm"><span className="mr-2" style={{ color: a }}>•</span><span style={{ color: c }}>{b}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
    closing: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: c }}>{slide.headline}</h1>
        {slide.subheadline && <p className="text-sm md:text-base mb-4" style={{ color: a }}>{slide.subheadline}</p>}
        {slide.bullets?.map((b, i) => <div key={i} className="flex items-center mb-1"><span className="mr-2" style={{ color: a }}>→</span><span className="text-sm" style={{ color: c }}>{b}</span></div>)}
      </div>
    ),
    content: (
      <div className="flex flex-col h-full p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: c }}>{slide.headline}</h2>
        <ul className="space-y-3 flex-1 flex flex-col justify-center">
          {slide.bullets?.map((b, i) => <li key={i} className="flex items-start"><span className="w-2 h-2 rounded-full mt-1.5 mr-3 flex-shrink-0" style={{ backgroundColor: a }} /><span className="text-sm md:text-base" style={{ color: c }}>{b}</span></li>)}
        </ul>
      </div>
    ),
  };

  return (
    <div className="aspect-video rounded-xl shadow-2xl overflow-hidden border" style={{ backgroundColor: bg, borderColor: `${a}30` }}>
      {content[slide.type] || content.content}
    </div>
  );
}

// ============================================
// 大纲编辑器
// ============================================
function OutlineEditor({ outline, setOutline, onConfirm, isGenerating }) {
  if (!outline) return null;

  const updateSlide = (index, field, value) => {
    const newSlides = [...outline.slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setOutline({ ...outline, slides: newSlides });
  };

  const updateBullets = (index, text) => {
    updateSlide(index, 'bullets', text.split('\n').filter(l => l.trim()));
  };

  const updateMetrics = (slideIdx, metricIdx, field, value) => {
    const newSlides = [...outline.slides];
    const newMetrics = [...(newSlides[slideIdx].metrics || [])];
    newMetrics[metricIdx] = { ...newMetrics[metricIdx], [field]: value };
    newSlides[slideIdx] = { ...newSlides[slideIdx], metrics: newMetrics };
    setOutline({ ...outline, slides: newSlides });
  };

  const addSlide = () => {
    setOutline({ ...outline, slides: [...outline.slides, { type: 'content', headline: '新页面', bullets: ['要点 1'] }] });
  };

  const removeSlide = (index) => {
    if (outline.slides.length <= 1) return;
    setOutline({ ...outline, slides: outline.slides.filter((_, i) => i !== index) });
  };

  const moveSlide = (index, dir) => {
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= outline.slides.length) return;
    const newSlides = [...outline.slides];
    [newSlides[index], newSlides[newIdx]] = [newSlides[newIdx], newSlides[index]];
    setOutline({ ...outline, slides: newSlides });
  };

  return (
    <div className="h-full flex flex-col">
      {/* 标题编辑 */}
      <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
        <label className="text-xs text-slate-400 mb-1 block">PPT 标题</label>
        <input value={outline.title} onChange={e => setOutline({ ...outline, title: e.target.value })} className="w-full bg-transparent text-white text-lg font-bold border-b border-white/20 pb-1 focus:outline-none focus:border-blue-500" />
        <div className="flex gap-4 mt-2">
          <div className="flex-1">
            <label className="text-xs text-slate-500">目标受众</label>
            <input value={outline.audience || ''} onChange={e => setOutline({ ...outline, audience: e.target.value })} className="w-full bg-transparent text-slate-300 text-sm border-b border-white/10 pb-1 focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-500">场景</label>
            <input value={outline.style || ''} readOnly className="w-full bg-transparent text-slate-400 text-sm border-b border-white/10 pb-1" />
          </div>
        </div>
      </div>

      {/* 页面列表 */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {outline.slides.map((slide, idx) => (
          <div key={idx} className="bg-white/5 rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all group">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-mono">{idx + 1}</span>
              <select
                value={slide.type}
                onChange={e => updateSlide(idx, 'type', e.target.value)}
                className="text-xs bg-white/10 text-slate-300 rounded px-2 py-1 border border-white/10 focus:outline-none"
              >
                {SLIDE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-30 p-1">↑</button>
                <button onClick={() => moveSlide(idx, 1)} disabled={idx === outline.slides.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30 p-1">↓</button>
                <button onClick={() => removeSlide(idx)} className="text-red-400/60 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            <input
              value={slide.headline}
              onChange={e => updateSlide(idx, 'headline', e.target.value)}
              className="w-full bg-transparent text-white font-semibold text-sm border-b border-white/10 pb-1 mb-2 focus:outline-none focus:border-blue-500"
              placeholder="页面标题"
            />

            {slide.type === 'title' && (
              <input value={slide.subheadline || ''} onChange={e => updateSlide(idx, 'subheadline', e.target.value)} className="w-full bg-transparent text-slate-400 text-sm border-b border-white/10 pb-1 focus:outline-none focus:border-blue-500" placeholder="副标题" />
            )}

            {(slide.type === 'content' || slide.type === 'agenda' || slide.type === 'closing') && (
              <textarea
                value={(slide.bullets || []).join('\n')}
                onChange={e => updateBullets(idx, e.target.value)}
                className="w-full bg-white/5 rounded-lg text-slate-300 text-sm p-2 mt-1 border border-white/5 focus:outline-none focus:border-blue-500/50 resize-none"
                rows={Math.max(2, (slide.bullets || []).length + 1)}
                placeholder="每行一个要点"
              />
            )}

            {slide.type === 'data' && (
              <div className="space-y-2 mt-1">
                {(slide.metrics || []).map((m, mi) => (
                  <div key={mi} className="flex gap-2">
                    <input value={m.label} onChange={e => updateMetrics(idx, mi, 'label', e.target.value)} className="flex-1 bg-white/5 text-slate-300 text-xs rounded px-2 py-1 border border-white/5 focus:outline-none" placeholder="指标名" />
                    <input value={m.value} onChange={e => updateMetrics(idx, mi, 'value', e.target.value)} className="w-20 bg-white/5 text-blue-400 text-xs rounded px-2 py-1 border border-white/5 focus:outline-none font-bold" placeholder="数值" />
                    <input value={m.description || ''} onChange={e => updateMetrics(idx, mi, 'description', e.target.value)} className="flex-1 bg-white/5 text-slate-400 text-xs rounded px-2 py-1 border border-white/5 focus:outline-none" placeholder="描述" />
                  </div>
                ))}
              </div>
            )}

            {slide.type === 'two-column' && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <input value={slide.leftTitle || ''} onChange={e => updateSlide(idx, 'leftTitle', e.target.value)} className="w-full bg-white/5 text-blue-400 text-xs font-bold rounded px-2 py-1 mb-1 border border-white/5 focus:outline-none" placeholder="左标题" />
                  <textarea value={(slide.leftBullets || []).join('\n')} onChange={e => updateSlide(idx, 'leftBullets', e.target.value.split('\n').filter(l => l.trim()))} className="w-full bg-white/5 text-slate-300 text-xs rounded px-2 py-1 border border-white/5 focus:outline-none resize-none" rows={3} placeholder="每行一个要点" />
                </div>
                <div>
                  <input value={slide.rightTitle || ''} onChange={e => updateSlide(idx, 'rightTitle', e.target.value)} className="w-full bg-white/5 text-blue-400 text-xs font-bold rounded px-2 py-1 mb-1 border border-white/5 focus:outline-none" placeholder="右标题" />
                  <textarea value={(slide.rightBullets || []).join('\n')} onChange={e => updateSlide(idx, 'rightBullets', e.target.value.split('\n').filter(l => l.trim()))} className="w-full bg-white/5 text-slate-300 text-xs rounded px-2 py-1 border border-white/5 focus:outline-none resize-none" rows={3} placeholder="每行一个要点" />
                </div>
              </div>
            )}

            {slide.type === 'timeline' && (
              <div className="space-y-2 mt-1">
                {(slide.items || []).map((item, ti) => (
                  <div key={ti} className="flex gap-2">
                    <input value={item.phase} onChange={e => { const items = [...slide.items]; items[ti] = { ...items[ti], phase: e.target.value }; updateSlide(idx, 'items', items); }} className="w-16 bg-white/5 text-blue-400 text-xs rounded px-2 py-1 border border-white/5 focus:outline-none" placeholder="阶段" />
                    <input value={item.title} onChange={e => { const items = [...slide.items]; items[ti] = { ...items[ti], title: e.target.value }; updateSlide(idx, 'items', items); }} className="flex-1 bg-white/5 text-slate-300 text-xs rounded px-2 py-1 border border-white/5 focus:outline-none" placeholder="标题" />
                    <input value={item.description || ''} onChange={e => { const items = [...slide.items]; items[ti] = { ...items[ti], description: e.target.value }; updateSlide(idx, 'items', items); }} className="flex-1 bg-white/5 text-slate-400 text-xs rounded px-2 py-1 border border-white/5 focus:outline-none" placeholder="描述" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <button onClick={addSlide} className="w-full py-3 border-2 border-dashed border-white/10 hover:border-white/30 rounded-xl text-slate-500 hover:text-slate-300 flex items-center justify-center gap-2 transition-all">
          <Plus className="w-4 h-4" /> 添加页面
        </button>
      </div>

      {/* 确认生成按钮 */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button
          onClick={onConfirm}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium disabled:opacity-50 shadow-lg transition-all"
        >
          {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />生成 PPT...</> : <><Zap className="w-5 h-5" />确认大纲，生成 PPT</>}
        </button>
      </div>
    </div>
  );
}

// ============================================
// PPT 预览面板（含导出）
// ============================================
function PPTPreview({ pptData, onReset }) {
  const [current, setCurrent] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') setCurrent(p => Math.min(p + 1, (pptData?.slides?.length || 1) - 1));
      if (e.key === 'ArrowLeft') setCurrent(p => Math.max(p - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pptData]);

  const exportPPTX = async () => {
    if (!pptData) return;
    setIsExporting(true);
    try {
      const pptx = new PptxGenJS();
      pptx.title = pptData.title;
      const theme = pptData.theme || { primary: '#1e293b', accent: '#3b82f6', background: '#ffffff' };
      pptx.defineSlideMaster({ title: 'M', background: { color: theme.background.replace('#', '') } });

      pptData.slides.forEach(slide => {
        const s = pptx.addSlide({ masterName: 'M' });
        const tc = theme.primary.replace('#', ''), ac = theme.accent.replace('#', '');

        if (slide.type === 'title') {
          s.addText(slide.headline, { x: 0.5, y: 2, w: 9, h: 1.5, fontSize: 44, bold: true, color: tc, align: 'center' });
          if (slide.subheadline) s.addText(slide.subheadline, { x: 0.5, y: 3.5, w: 9, h: 0.8, fontSize: 24, color: ac, align: 'center' });
        } else if (slide.type === 'agenda') {
          s.addText(slide.headline, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: tc });
          slide.bullets?.forEach((b, i) => s.addText(`${i + 1}. ${b}`, { x: 1, y: 1.8 + i * 0.8, w: 8, h: 0.6, fontSize: 20, color: tc }));
        } else if (slide.type === 'data') {
          s.addText(slide.headline, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: tc });
          slide.metrics?.forEach((m, i) => {
            const col = i % 3, row = Math.floor(i / 3);
            s.addText(m.value, { x: 0.5 + col * 3.2, y: 1.8 + row * 2, w: 2.8, h: 0.8, fontSize: 36, bold: true, color: ac, align: 'center' });
            s.addText(m.label, { x: 0.5 + col * 3.2, y: 2.6 + row * 2, w: 2.8, h: 0.5, fontSize: 16, color: tc, align: 'center' });
            if (m.description) s.addText(m.description, { x: 0.5 + col * 3.2, y: 3.1 + row * 2, w: 2.8, h: 0.4, fontSize: 12, color: tc, align: 'center' });
          });
        } else if (slide.type === 'timeline') {
          s.addText(slide.headline, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: tc });
          const count = slide.items?.length || 0;
          slide.items?.forEach((item, i) => {
            const x = 0.5 + (i * (9 / count));
            s.addText(item.phase, { x, y: 2, w: 9 / count - 0.2, h: 0.4, fontSize: 14, bold: true, color: ac, align: 'center' });
            s.addText(item.title, { x, y: 2.5, w: 9 / count - 0.2, h: 0.4, fontSize: 14, color: tc, align: 'center' });
            s.addText(item.description || '', { x, y: 3, w: 9 / count - 0.2, h: 0.4, fontSize: 12, color: tc, align: 'center' });
          });
        } else if (slide.type === 'two-column') {
          s.addText(slide.headline, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: tc });
          s.addText(slide.leftTitle || '', { x: 0.5, y: 1.5, w: 4, h: 0.5, fontSize: 20, bold: true, color: ac });
          slide.leftBullets?.forEach((b, i) => s.addText(`• ${b}`, { x: 0.7, y: 2.2 + i * 0.6, w: 4, h: 0.5, fontSize: 16, color: tc }));
          s.addText(slide.rightTitle || '', { x: 5, y: 1.5, w: 4, h: 0.5, fontSize: 20, bold: true, color: ac });
          slide.rightBullets?.forEach((b, i) => s.addText(`• ${b}`, { x: 5.2, y: 2.2 + i * 0.6, w: 4, h: 0.5, fontSize: 16, color: tc }));
        } else if (slide.type === 'closing') {
          s.addText(slide.headline, { x: 0.5, y: 1.5, w: 9, h: 1, fontSize: 40, bold: true, color: tc, align: 'center' });
          if (slide.subheadline) s.addText(slide.subheadline, { x: 0.5, y: 2.8, w: 9, h: 0.6, fontSize: 22, color: ac, align: 'center' });
          slide.bullets?.forEach((b, i) => s.addText(`→ ${b}`, { x: 2.5, y: 3.8 + i * 0.6, w: 5, h: 0.5, fontSize: 18, color: tc }));
        } else {
          s.addText(slide.headline, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: tc });
          slide.bullets?.forEach((b, i) => s.addText(`• ${b}`, { x: 0.8, y: 1.6 + i * 0.9, w: 8.5, h: 0.8, fontSize: 18, color: tc, valign: 'top' }));
        }
      });
      await pptx.writeFile({ fileName: `${pptData.title || 'presentation'}.pptx` });
    } catch (err) {
      alert('导出失败：' + err.message);
    } finally { setIsExporting(false); }
  };

  if (!pptData) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-white">{pptData.title}</h2>
          <p className="text-xs text-slate-400">{pptData.slides.length} 页 · 方向键导航</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onReset} className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-sm"><RotateCcw className="w-3.5 h-3.5" />重做</button>
          <button onClick={exportPPTX} disabled={isExporting} className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {isExporting ? '导出中...' : '导出 PPTX'}
          </button>
        </div>
      </div>

      {/* 缩略图 + 主预览 */}
      <div className="flex-1 flex gap-3 min-h-0">
        <div className="w-24 md:w-32 flex-shrink-0 overflow-y-auto space-y-1.5 pr-1">
          {pptData.slides.map((slide, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-full aspect-video rounded overflow-hidden border-2 transition-all ${current === i ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-white/20'}`}>
              <div className="w-full h-full p-1 text-left" style={{ backgroundColor: pptData.theme?.background || '#fff' }}>
                <div className="text-xs font-medium truncate" style={{ color: pptData.theme?.primary || '#1e293b' }}>{slide.headline}</div>
                <div className="text-xs text-gray-400">{i + 1}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="relative flex-1">
            <SlideRenderer slide={pptData.slides[current]} theme={pptData.theme} />
            <button onClick={() => setCurrent(p => Math.max(p - 1, 0))} disabled={current === 0} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrent(p => Math.min(p + 1, pptData.slides.length - 1))} disabled={current === pptData.slides.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {pptData.slides.map((_, i) => <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all ${current === i ? 'bg-blue-500 w-5' : 'bg-white/20 w-1.5'}`} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 主应用
// ============================================
export default function App() {
  // 阶段：input → outlining → editing → generating → preview
  const [phase, setPhase] = useState('input');

  // 输入数据
  const [selectedStyle, setSelectedStyle] = useState('business');
  const [content, setContent] = useState('');
  const [urls, setUrls] = useState('');
  const [prompt, setPrompt] = useState('');

  // 大纲数据
  const [thinkingText, setThinkingText] = useState('');
  const [outline, setOutline] = useState(null);

  // PPT 数据
  const [genThinking, setGenThinking] = useState('');
  const [pptData, setPptData] = useState(null);

  const [error, setError] = useState(null);

  const currentStyleLabel = STYLES.find(s => s.id === selectedStyle)?.label || '商业演讲';

  // Stage 1: 生成大纲
  const generateOutline = async () => {
    if (!content.trim() && !prompt.trim()) { setError('请输入内容或需求描述'); return; }
    setPhase('outlining');
    setError(null);
    setThinkingText('');
    setOutline(null);

    try {
      const res = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: currentStyleLabel, content, urls }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || '生成失败');

      setThinkingText(result.thinking || '分析完成。');
      if (result.outline) {
        setOutline(result.outline);
        setTimeout(() => setPhase('editing'), 500);
      } else {
        throw new Error('未能生成大纲');
      }
    } catch (err) {
      setError(err.message);
      setPhase('input');
    }
  };

  // Stage 2: 生成 PPT
  const generatePPT = async () => {
    if (!outline) return;
    setPhase('generating');
    setGenThinking('');
    setPptData(null);
    setError(null);

    try {
      const res = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outline, style: currentStyleLabel }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || '生成失败');

      setGenThinking(result.thinking || '生成完成。');
      if (result.pptData) {
        setPptData(result.pptData);
        setTimeout(() => setPhase('preview'), 500);
      } else {
        // Fallback: use outline directly
        setPptData(outline);
        setTimeout(() => setPhase('preview'), 500);
      }
    } catch (err) {
      setError(err.message);
      setPhase('editing');
    }
  };

  const resetAll = () => {
    setPhase('input');
    setThinkingText('');
    setOutline(null);
    setGenThinking('');
    setPptData(null);
    setError(null);
  };

  // 步骤指示器
  const steps = [
    { key: 'input', label: '输入材料', icon: FileText },
    { key: 'outline', label: '生成大纲', icon: Brain },
    { key: 'generate', label: '生成 PPT', icon: Zap },
    { key: 'preview', label: '预览导出', icon: Eye },
  ];
  const stepIndex = phase === 'input' ? 0 : (phase === 'outlining' || phase === 'editing') ? 1 : phase === 'generating' ? 2 : 3;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Layers className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">AI PPT Studio</h1>
              <p className="text-xs text-slate-400">V2 · 智能演示文稿工作台</p>
            </div>
          </div>

          {/* 步骤指示器 */}
          <div className="hidden md:flex items-center gap-1">
            {steps.map((step, i) => (
              <React.Fragment key={step.key}>
                {i > 0 && <div className={`w-8 h-px ${i <= stepIndex ? 'bg-blue-500' : 'bg-white/10'}`} />}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${i <= stepIndex ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500'} ${i === stepIndex ? 'ring-1 ring-blue-500/50' : ''}`}>
                  <step.icon className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{step.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {phase !== 'input' && (
            <button onClick={resetAll} className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> 重新开始
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* ======== 输入阶段 ======== */}
        {phase === 'input' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full text-green-300 text-sm mb-3">
                  <Sparkles className="w-4 h-4" /> 免费使用 · 智能生成
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">创建你的专业演示文稿</h2>
                <p className="text-slate-400">选择场景、输入材料，AI 为你量身定制 PPT</p>
              </div>

              {/* 场景选择 */}
              <div className="mb-5">
                <label className="text-sm font-medium text-slate-300 mb-2 block">选择 PPT 场景</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStyle(s.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${selectedStyle === s.id ? 'bg-blue-500/20 border-blue-500/50 ring-1 ring-blue-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      <div className="text-lg mb-1">{s.icon}</div>
                      <div className="text-sm font-medium text-white">{s.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 内容输入 */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2 ">
                    <FileText className="w-4 h-4" /> 输入原始材料
                  </label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    placeholder="粘贴你的文字内容、项目资料、工作总结等原始材料..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                    <Link className="w-4 h-4" /> 参考资料链接 <span className="text-xs text-slate-500">（可选）</span>
                  </label>
                  <input
                    value={urls}
                    onChange={e => setUrls(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="https://example.com/document.pdf"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> 额外需求说明 <span className="text-xs text-slate-500">（可选）</span>
                  </label>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    placeholder="例如：大约 10 页，面向 CTO，偏技术但要有商业价值..."
                  />
                </div>

                {error && <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">{error}</div>}

                <button
                  onClick={generateOutline}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg transition-all text-base"
                >
                  <Wand2 className="w-5 h-5" /> 生成 PPT 大纲
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======== 大纲阶段（生成中 + 编辑） ======== */}
        {(phase === 'outlining' || phase === 'editing') && (
          <div className="h-full flex gap-0">
            {/* 左侧：思考过程 */}
            <div className="w-1/2 lg:w-2/5 p-4 flex flex-col border-r border-white/10">
              <ThinkingPanel text={thinkingText} isLoading={phase === 'outlining'} title="AI 分析过程" />
            </div>
            {/* 右侧：大纲编辑 */}
            <div className="w-1/2 lg:w-3/5 p-4 flex flex-col overflow-hidden">
              {phase === 'outlining' && !outline && (
                <div className="flex-1 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                    <p>正在生成大纲...</p>
                  </div>
                </div>
              )}
              {outline && <OutlineEditor outline={outline} setOutline={setOutline} onConfirm={generatePPT} isGenerating={phase === 'generating'} />}
              {error && <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">{error}</div>}
            </div>
          </div>
        )}

        {/* ======== 生成阶段 + 预览阶段 ======== */}
        {(phase === 'generating' || phase === 'preview') && (
          <div className="h-full flex gap-0">
            {/* 左侧：生成过程 */}
            <div className="w-1/2 lg:w-2/5 p-4 flex flex-col border-r border-white/10">
              <ThinkingPanel text={genThinking} isLoading={phase === 'generating'} title="PPT 生成过程" />
            </div>
            {/* 右侧：PPT 预览 */}
            <div className="w-1/2 lg:w-3/5 p-4 flex flex-col overflow-hidden">
              {phase === 'generating' && !pptData && (
                <div className="flex-1 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-500" />
                    <p>正在生成 PPT...</p>
                  </div>
                </div>
              )}
              {pptData && <PPTPreview pptData={pptData} onReset={resetAll} />}
              {error && <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">{error}</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
