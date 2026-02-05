import React, { useState, useEffect, useRef } from 'react';
import { Brain, Loader2 } from 'lucide-react';

/**
 * 打字机效果 Hook
 * 逐字显示文本，模拟 AI 正在输出的效果
 */
function useTypewriter(text: string, speed: number = 10, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!text || !enabled) {
      setDisplayedText(text || '');
      setIsDone(true);
      return;
    }

    setDisplayedText('');
    setIsDone(false);
    let currentIndex = 0;

    const timer = setInterval(() => {
      // 每次增加 2-4 个字符，模拟更自然的输出
      const increment = Math.floor(Math.random() * 3) + 2;
      currentIndex = Math.min(currentIndex + increment, text.length);
      setDisplayedText(text.substring(0, currentIndex));

      if (currentIndex >= text.length) {
        clearInterval(timer);
        setIsDone(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return { displayedText, isDone };
}

interface ThinkingPanelProps {
  /** AI 思考过程文本 */
  text: string | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 面板标题 */
  title?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * AI 思考过程可视化面板
 * 
 * 功能：
 * - 显示 AI 的分析和决策过程
 * - 打字机效果逐字显示
 * - 支持 Markdown 格式（标题、列表等）
 * - 自动滚动到最新内容
 */
export const ThinkingPanel: React.FC<ThinkingPanelProps> = ({
  text,
  isLoading,
  title = 'AI 分析过程',
  className = '',
}) => {
  const { displayedText, isDone } = useTypewriter(text || '', 10, !!text);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedText]);

  /**
   * 简单的 Markdown 行解析
   * 支持：## 标题, ### 子标题, - 列表, 数字列表
   */
  const renderLine = (line: string, index: number) => {
    // 移除 ** 粗体标记（简化处理）
    const cleanLine = line.replace(/\*\*/g, '');

    if (cleanLine.startsWith('### ')) {
      return (
        <h3 key={index} className="text-banana-600 font-bold mt-3 mb-1 text-sm">
          {cleanLine.slice(4)}
        </h3>
      );
    }

    if (cleanLine.startsWith('## ')) {
      return (
        <h2 key={index} className="text-banana-700 font-bold mt-4 mb-1 text-base">
          {cleanLine.slice(3)}
        </h2>
      );
    }

    if (cleanLine.match(/^\d+\.\s/)) {
      return (
        <p key={index} className="text-gray-700 ml-2 my-0.5 text-sm">
          {cleanLine}
        </p>
      );
    }

    if (cleanLine.startsWith('- ')) {
      return (
        <p key={index} className="text-gray-600 ml-4 my-0.5 text-sm">
          <span className="text-banana-500 mr-1">›</span>
          {cleanLine.slice(2)}
        </p>
      );
    }

    if (!cleanLine.trim()) {
      return <br key={index} />;
    }

    return (
      <p key={index} className="text-gray-600 my-0.5 text-sm">
        {cleanLine}
      </p>
    );
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-to-b from-banana-50 to-white rounded-lg border border-banana-200 overflow-hidden ${className}`}>
      {/* 标题栏 */}
      <div className="px-4 py-2.5 border-b border-banana-200 bg-banana-100/50 flex items-center gap-2">
        <Brain className="w-4 h-4 text-banana-600" />
        <span className="text-banana-700 font-medium text-sm">{title}</span>
        {(isLoading || (!isDone && text)) && (
          <Loader2 className="w-3 h-3 text-banana-500 animate-spin ml-auto" />
        )}
      </div>

      {/* 内容区 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-sans text-sm"
      >
        {/* 加载中状态 */}
        {isLoading && !text && (
          <div className="flex items-center gap-2 text-banana-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI 正在分析中...</span>
          </div>
        )}

        {/* 思考过程文本 */}
        {displayedText && (
          <>
            {displayedText.split('\n').map((line, index) => renderLine(line, index))}
            {/* 打字机光标 */}
            {!isDone && text && (
              <span className="inline-block w-2 h-4 bg-banana-500 animate-pulse ml-0.5" />
            )}
          </>
        )}

        {/* 无内容时的占位 */}
        {!isLoading && !text && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Brain className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-sm">生成大纲时将显示 AI 分析过程</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThinkingPanel;
