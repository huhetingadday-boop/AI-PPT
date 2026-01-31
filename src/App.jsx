import React, { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, Loader2, Layers, Wand2 } from 'lucide-react';
import PptxGenJS from 'pptxgenjs';

// 示例 PPT 数据
const DEMO_PPT = {
  title: "AI 在企业中的落地实践",
  audience: "CTO",
  theme: {
    primary: "#1a1a2e",
    accent: "#4361ee",
    background: "#ffffff"
  },
  slides: [
    { type: "title", headline: "AI 在企业中的落地实践", subheadline: "从技术可行性到业务价值" },
    { type: "agenda", headline: "今天我们将讨论什么", bullets: ["为什么企业现在需要 AI", "典型落地场景与案例", "技术架构与核心挑战", "落地建议与实施路线图"] },
    { type: "content", headline: "为什么现在是 AI 落地的关键窗口期", bullets: ["大模型能力成熟，推理成本持续下降 70%+", "企业数据基础逐步完善，数据治理成熟度提升", "AI 已在金融、零售、制造等行业验证 ROI", "竞争对手正在加速布局，窗口期有限"] },
    { type: "content", headline: "企业 AI 落地的典型场景", bullets: ["智能客服：降低 40% 人力成本，提升响应速度", "文档处理：合同审核、报告生成自动化", "决策支持：数据分析、预测建模、风险评估", "研发提效：代码生成、测试自动化、知识管理"] },
    { type: "two-column", headline: "技术架构选型对比", leftTitle: "自建方案", leftBullets: ["完全可控", "定制化强", "成本高、周期长"], rightTitle: "云服务方案", rightBullets: ["快速启动", "弹性扩展", "依赖外部服务"] },
    { type: "content", headline: "落地过程中的核心挑战", bullets: ["数据质量与隐私合规：GDPR、数据本地化要求", "模型幻觉与可靠性：关键业务场景的准确性要求", "组织变革阻力：流程重塑、技能升级、文化转型", "ROI 量化困难：短期投入与长期收益的平衡"] },
    { type: "content", headline: "推荐实施路线图", bullets: ["Phase 1（1-2月）：选择 1-2 个低风险高价值场景试点", "Phase 2（3-4月）：建立评估体系，优化模型与流程", "Phase 3（5-6月）：扩展至更多业务线，建立内部能力", "Phase 4（持续）：构建 AI 中台，实现规模化应用"] },
    { type: "closing", headline: "下一步行动", subheadline: "让我们一起开启 AI 落地之旅", bullets: ["识别 3 个潜在试点场景", "评估数据准备度", "制定 90 天行动计划"] }
  ]
};

// Slide 渲染组件
const SlideRenderer = ({ slide, theme }) => {
  const color = theme?.primary || '#1a1a2e';
  const accent = theme?.accent || '#4361ee';
  const bg = theme?.background || '#ffffff';

  const content = {
    title: (
      <div className="flex flex-col items-center justify-center h-full text-center px-12">
        <h1 className="text-3xl font-bold mb-4" style={{ color }}>{slide.headline}</h1>
        {slide.subheadline && <p className="text-lg" style={{ color: accent }}>{slide.subheadline}</p>}
      </div>
    ),
    agenda: (
      <div className="flex flex-col h-full p-8">
        <h2 className="text-2xl font-bold mb-6" style={{ color }}>{slide.headline}</h2>
        <div className="flex-1 flex flex-col justify-center">
          {slide.bullets?.map((b, i) => (
            <div key={i} className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 text-sm" style={{ backgroundColor: accent }}>{i + 1}</div>
              <span style={{ color }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    'two-column': (
      <div className="flex flex-col h-full p-8">
        <h2 className="text-2xl font-bold mb-6" style={{ color }}>{slide.headline}</h2>
        <div className="flex-1 grid grid-cols-2 gap-6">
          {[{ title: slide.leftTitle, bullets: slide.leftBullets }, { title: slide.rightTitle, bullets: slide.rightBullets }].map((col, ci) => (
            <div key={ci} className="p-4 rounded-lg" style={{ backgroundColor: `${accent}10` }}>
              <h3 className="font-bold mb-3" style={{ color: accent }}>{col.title}</h3>
              <ul className="space-y-2">
                {col.bullets?.map((b, i) => <li key={i} className="flex items-start text-sm"><span className="mr-2" style={{ color: accent }}>•</span><span style={{ color }}>{b}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
    closing: (
      <div className="flex flex-col items-center justify-center h-full text-center px-12">
        <h1 className="text-3xl font-bold mb-3" style={{ color }}>{slide.headline}</h1>
        {slide.subheadline && <p className="text-base mb-6" style={{ color: accent }}>{slide.subheadline}</p>}
        {slide.bullets && <div className="mt-4 text-left">{slide.bullets.map((b, i) => <div key={i} className="flex items-center mb-2"><span className="mr-3" style={{ color: accent }}>→</span><span className="text-sm" style={{ color }}>{b}</span></div>)}</div>}
      </div>
    ),
    content: (
      <div className="flex flex-col h-full p-8">
        <h2 className="text-2xl font-bold mb-6" style={{ color }}>{slide.headline}</h2>
        <ul className="space-y-4 flex-1 flex flex-col justify-center">
          {slide.bullets?.map((b, i) => <li key={i} className="flex items-start"><span className="w-2 h-2 rounded-full mt-2 mr-4 flex-shrink-0" style={{ backgroundColor: accent }} /><span style={{ color }}>{b}</span></li>)}
        </ul>
      </div>
    )
  };

  return (
    <div className="aspect-video rounded-lg shadow-lg overflow-hidden ring-2 ring-offset-2" style={{ backgroundColor: bg, ringColor: accent }}>
      {content[slide.type] || content.content}
    </div>
  );
};

// 缩略图组件
const SlideThumbnail = ({ slide, index, isActive, onClick, theme }) => (
  <button onClick={onClick} className={`w-full aspect-video rounded-md overflow-hidden transition-all border-2 ${isActive ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-gray-300'}`}>
    <div className="w-full h-full p-2 text-left" style={{ backgroundColor: theme?.background || '#fff' }}>
      <div className="text-xs font-medium truncate" style={{ color: theme?.primary || '#1a1a2e' }}>{slide.headline}</div>
      <div className="text-xs text-gray-400 mt-1">{index + 1}</div>
    </div>
  </button>
);

// 主应用
export default function App() {
  const [prompt, setPrompt] = useState('');
  const [pptData, setPptData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const examplePrompts = [
    "帮我做一份 10 页左右的 PPT，主题是 AI 在企业中的落地，面向 CTO，偏技术但要有商业价值。",
    "创建一个产品发布会 PPT，介绍我们的新 SaaS 产品，面向投资人，强调市场机会和商业模式。",
    "制作一份季度业务复盘报告，面向管理层，包含业绩数据、问题分析和下季度计划。"
  ];

  // 调用后端 API 生成 PPT
  const generatePPT = async () => {
    if (!prompt.trim()) { setError('请输入你的 PPT 需求描述'); return; }
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || '生成失败');
      if (result.success && result.data) { setPptData(result.data); setCurrentSlide(0); }
      else throw new Error('返回数据格式错误');
    } catch (err) {
      setError(err.message || '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 导出 PPTX
  const exportToPPTX = async () => {
    if (!pptData) return;
    setIsExporting(true);
    try {
      const pptx = new PptxGenJS();
      pptx.title = pptData.title;
      pptx.author = 'AI PPT Studio';
      const theme = pptData.theme || { primary: '#1a1a2e', accent: '#4361ee', background: '#ffffff' };
      pptx.defineSlideMaster({ title: 'MASTER', background: { color: theme.background.replace('#', '') } });

      pptData.slides.forEach((slide) => {
        const s = pptx.addSlide({ masterName: 'MASTER' });
        const tc = theme.primary.replace('#', ''), ac = theme.accent.replace('#', '');

        if (slide.type === 'title') {
          s.addText(slide.headline, { x: 0.5, y: 2, w: 9, h: 1.5, fontSize: 44, bold: true, color: tc, align: 'center' });
          if (slide.subheadline) s.addText(slide.subheadline, { x: 0.5, y: 3.5, w: 9, h: 0.8, fontSize: 24, color: ac, align: 'center' });
        } else if (slide.type === 'agenda') {
          s.addText(slide.headline, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: tc });
          slide.bullets?.forEach((b, i) => s.addText(`${i + 1}. ${b}`, { x: 1, y: 1.8 + i * 0.8, w: 8, h: 0.6, fontSize: 20, color: tc }));
        } else if (slide.type === 'two-column') {
          s.addText(slide.headline, { x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: tc });
          s.addText(slide.leftTitle, { x: 0.5, y: 1.5, w: 4, h: 0.5, fontSize: 20, bold: true, color: ac });
          slide.leftBullets?.forEach((b, i) => s.addText(`• ${b}`, { x: 0.7, y: 2.2 + i * 0.6, w: 4, h: 0.5, fontSize: 16, color: tc }));
          s.addText(slide.rightTitle, { x: 5, y: 1.5, w: 4, h: 0.5, fontSize: 20, bold: true, color: ac });
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
      setError('导出失败：' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // 键盘导航
  useEffect(() => {
    const handler = (e) => {
      if (!pptData) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setCurrentSlide(p => Math.min(p + 1, pptData.slides.length - 1));
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setCurrentSlide(p => Math.max(p - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pptData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI PPT Studio</h1>
              <p className="text-xs text-slate-400">从想法到演示文稿，一步到位</p>
            </div>
          </div>
          {pptData && (
            <button onClick={exportToPPTX} disabled={isExporting} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium disabled:opacity-50 shadow-lg">
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? '导出中...' : '导出 PPTX'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!pptData ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">描述你的 PPT 需求</h2>
              <p className="text-slate-400">告诉 AI 你想做什么 PPT，它会帮你生成专业的演示文稿</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="例如：帮我做一份 10 页左右的 PPT，主题是 AI 在企业中的落地，面向 CTO，偏技术但要有商业价值。" className="w-full h-32 bg-slate-900/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />
              {error && <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
              <div className="mt-4 flex gap-3">
                <button onClick={generatePPT} disabled={isGenerating} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium disabled:opacity-50 shadow-lg">
                  {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />AI 正在生成...</> : <><Wand2 className="w-5 h-5" />生成 PPT</>}
                </button>
                <button onClick={() => { setPptData(DEMO_PPT); setCurrentSlide(0); setPrompt(examplePrompts[0]); }} className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl font-medium">查看示例</button>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-sm font-medium text-slate-500 mb-3">试试这些提示词：</h3>
              <div className="space-y-2">
                {examplePrompts.map((ex, i) => <button key={i} onClick={() => setPrompt(ex)} className="w-full text-left p-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg text-slate-400 text-sm">{ex}</button>)}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="w-48 flex-shrink-0">
              <div className="sticky top-24 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-400">{pptData.slides.length} 页</span>
                  <button onClick={() => { setPptData(null); setCurrentSlide(0); }} className="text-xs text-blue-400 hover:text-blue-300">重新生成</button>
                </div>
                {pptData.slides.map((slide, i) => <SlideThumbnail key={i} slide={slide} index={i} isActive={currentSlide === i} onClick={() => setCurrentSlide(i)} theme={pptData.theme} />)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
                <div className="mb-6 flex items-center justify-between">
                  <div><h2 className="text-xl font-bold text-white">{pptData.title}</h2><p className="text-sm text-slate-400">目标受众：{pptData.audience}</p></div>
                  <span className="text-sm text-slate-500">使用方向键导航</span>
                </div>
                <div className="relative">
                  <SlideRenderer slide={pptData.slides[currentSlide]} theme={pptData.theme} />
                  <div className="absolute inset-y-0 left-0 flex items-center -ml-4">
                    <button onClick={() => setCurrentSlide(p => Math.max(p - 1, 0))} disabled={currentSlide === 0} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white disabled:opacity-30 shadow-lg"><ChevronLeft className="w-5 h-5" /></button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center -mr-4">
                    <button onClick={() => setCurrentSlide(p => Math.min(p + 1, pptData.slides.length - 1))} disabled={currentSlide === pptData.slides.length - 1} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white disabled:opacity-30 shadow-lg"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2">
                  {pptData.slides.map((_, i) => <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition-all ${currentSlide === i ? 'bg-blue-500 w-6' : 'bg-slate-600 hover:bg-slate-500'}`} />)}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="border-t border-slate-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-500 text-sm">AI PPT Studio - Powered by Claude API</div>
      </footer>
    </div>
  );
}
