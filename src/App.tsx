/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from 'motion/react';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, ArrowUpRight, ArrowLeft, X, Loader2, ArrowUp, Phone } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ProjectImage } from './components/ProjectImage';

const CardContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 600;
    const y = (e.clientY - top - height / 2) / 600;
    setRotateY(x);
    setRotateX(-y);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div 
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{ perspective: "1000px" }}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative transition-all duration-200 ease-linear w-full h-full flex items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const CardItem = ({ children, translateZ = 0, className = "", style = {} }: { children: React.ReactNode, translateZ?: number, className?: string, style?: React.CSSProperties }) => {
  return (
    <div 
      className={className}
      style={{
        ...style,
        transform: `translateZ(${translateZ}px)`,
        transformStyle: "preserve-3d"
      }}
    >
      {children}
    </div>
  );
};

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const detailContainerRef = useRef<HTMLDivElement>(null);
  const diIframeRef = useRef<HTMLIFrameElement>(null);
  const ignorePopstateRef = useRef(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [showDesignIntelligence, setShowDesignIntelligence] = useState(false);
  const [diFrameMounted, setDiFrameMounted] = useState(false);
  const [isDetailScrolled, setIsDetailScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isFirstImageLoading, setIsFirstImageLoading] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const chapterUrl = `${import.meta.env.BASE_URL}design-intelligence/design-intelligence-mockup.html#chapter`;

  const closeDesignIntelligence = useCallback((syncHistory = true) => {
    setShowDesignIntelligence(false);
    if (syncHistory && window.history.state?.diOverlay) {
      ignorePopstateRef.current = true;
      window.history.back();
    }
  }, []);

  const openDesignIntelligence = useCallback(() => {
    setDiFrameMounted(true);
    setShowDesignIntelligence(true);
    if (!window.history.state?.diOverlay) {
      window.history.pushState({ ...(window.history.state || {}), diOverlay: true }, '');
    }
  }, []);

  const openPortfolioProject = useCallback((id: string) => {
    setActiveProject(id);
    if (window.history.state?.portfolioProject !== id) {
      window.history.pushState({ ...(window.history.state || {}), portfolioProject: id }, '');
    }
  }, []);

  const closePortfolioProject = useCallback((syncHistory = true) => {
    setActiveProject(null);
    if (syncHistory && window.history.state?.portfolioProject) {
      ignorePopstateRef.current = true;
      window.history.back();
    }
  }, []);

  const warmDesignIntelligence = () => {
    setDiFrameMounted(true);
  };

  useEffect(() => {
    if (activeProject) {
      setIsFirstImageLoading(true);
    }
  }, [activeProject]);

  const projectImages: Record<string, string[]> = {
    'kovos-guide': [
      asset('images/projects/kovos-guide-detail-01.webp'),
      asset('images/projects/kovos-guide-detail-02.webp'),
      asset('images/projects/kovos-guide-detail-03.webp'),
      asset('images/projects/kovos-guide-detail-04.webp'),
    ],
    'kovos-agent': [
      asset('images/projects/kovos-agent-detail-01.webp'),
      asset('images/projects/kovos-agent-detail-02.webp'),
      asset('images/projects/kovos-agent-detail-03.webp'),
    ],
    'raycast': [
      asset('images/projects/self-service-detail-01.webp'),
      asset('images/projects/self-service-detail-02.webp'),
    ],
    'writing': [
      asset('images/projects/blabla-english-detail-01.webp'),
      asset('images/projects/blabla-english-detail-02.webp'),
      asset('images/projects/blabla-english-detail-03.webp'),
      asset('images/projects/blabla-english-detail-04.webp'),
      asset('images/projects/blabla-english-detail-05.webp'),
      asset('images/projects/blabla-english-detail-06.webp'),
    ],
    'e-insight': [
      asset('images/projects/e-insight-detail-01.webp'),
      asset('images/projects/e-insight-detail-02.webp'),
      asset('images/projects/e-insight-detail-03.webp'),
    ],
    'xuanxing-uni': [
      asset('images/projects/xuanxing-uni-detail-01.webp'),
      asset('images/projects/xuanxing-uni-detail-02.webp'),
    ],
  };

  // Prefetch DI fonts into browser cache before opening the iframe
  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    const fontHref = `${base}design-intelligence/fonts/SmileySans-Oblique.ttf.woff2`;
    const cssHref =
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Unbounded:wght@600;700;800&family=ZCOOL+QingKe+HuangYou&display=swap';

    const ensureLink = (attrs: Record<string, string>) => {
      const exists = Array.from(document.head.querySelectorAll('link')).some(
        (link) => link.getAttribute('href') === attrs.href
      );
      if (exists) return;
      const link = document.createElement('link');
      Object.entries(attrs).forEach(([key, value]) => link.setAttribute(key, value));
      document.head.appendChild(link);
    };

    ensureLink({
      rel: 'preload',
      href: fontHref,
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous',
    });
    ensureLink({ rel: 'preload', href: cssHref, as: 'style' });
    ensureLink({ rel: 'stylesheet', href: cssHref });
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Same-origin only (GitHub / CloudBase static host)
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'close-design-intelligence') {
        closeDesignIntelligence(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [closeDesignIntelligence]);

  // Browser Back matches Esc: one level up
  useEffect(() => {
    const onPopState = () => {
      if (ignorePopstateRef.current) {
        ignorePopstateRef.current = false;
        return;
      }
      if (showDesignIntelligence) {
        setShowDesignIntelligence(false);
      }
      if (activeProject) {
        setActiveProject(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [showDesignIntelligence, activeProject]);

  useEffect(() => {
    if (!showDesignIntelligence) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const iframe = diIframeRef.current;

    // Opening from portfolio should always land on chapter (replace — no extra history entry)
    if (iframe) {
      try {
        const win = iframe.contentWindow;
        if (win?.location?.href && win.location.href !== 'about:blank') {
          win.location.replace(chapterUrl);
        } else {
          iframe.src = chapterUrl;
        }
      } catch {
        iframe.src = chapterUrl;
      }
    }

    const focusIframe = () => {
      const frame = diIframeRef.current;
      if (!frame) return;
      frame.focus();
      try {
        frame.contentWindow?.focus();
      } catch {
        /* ignore */
      }
    };

    const focusTimer = window.setTimeout(focusIframe, 80);
    iframe?.addEventListener('load', focusIframe);

    // Parent-level Esc fallback when focus is not inside the iframe
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      const frame = diIframeRef.current;
      try {
        const path = frame?.contentWindow?.location?.pathname ?? '';
        if (/case-[^/]+\.html$/.test(path)) {
          frame!.contentWindow!.location.replace(chapterUrl);
          window.setTimeout(focusIframe, 80);
          return;
        }
      } catch {
        /* ignore */
      }
      closeDesignIntelligence(true);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusTimer);
      iframe?.removeEventListener('load', focusIframe);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showDesignIntelligence, chapterUrl, closeDesignIntelligence]);

  const { scrollXProgress } = useScroll({ container: containerRef });
  const [isLastPage, setIsLastPage] = useState(false);

  useMotionValueEvent(scrollXProgress, "change", (latest) => {
    // With 10 pages, the last page starts around 9/10 = 0.9
    setIsLastPage(latest > 0.92);
  });
  
  // Smooth scroll progress for the indicator
  const smoothProgress = useSpring(scrollXProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Map scroll progress to indicator position
  // 15 lines total, gap + line width = 10px. 
  // Total distance = (15 - 1) * 10 = 140px
  const indicatorX = useTransform(smoothProgress, [0, 1], [0, 140]);

  // Handle detail view scroll
  const handleDetailScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setIsDetailScrolled(scrollTop > 50);
    setIsAtBottom(scrollHeight - scrollTop <= clientHeight + 100);
    
    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => setIsScrolling(false), 500);
  };

  useEffect(() => {
    if (!activeProject) {
      setIsDetailScrolled(false);
    }
  }, [activeProject]);

  useEffect(() => {
    if (!activeProject) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closePortfolioProject(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeProject, closePortfolioProject]);

  const handleScrollNext = () => {
    const container = containerRef.current;
    if (!container) return;
    
    // Scroll by one viewport width
    container.scrollBy({
      left: container.clientWidth,
      behavior: 'smooth'
    });
  };

  const handleAction = () => {
    const container = containerRef.current;
    if (!container) return;

    if (isLastPage) {
      container.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    } else {
      handleScrollNext();
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    container.scrollTo({
      left: percentage * (container.scrollWidth - container.clientWidth),
      behavior: 'smooth'
    });
  };

  // Handle vertical wheel to horizontal scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // If the user is scrolling vertically, translate it to horizontal
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollBy({
          left: e.deltaY * 3, // Increased multiplier for higher sensitivity
          behavior: 'auto'
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#EBEBEB] text-black overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full h-[60px] flex items-center justify-center z-50">
        <div 
          className="relative flex items-center h-5 cursor-pointer pointer-events-auto group"
          onClick={handleNavClick}
        >
          {/* Vertical Lines Background */}
          <div className="flex items-center gap-[9px] opacity-10 group-hover:opacity-20 transition-opacity">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-[1px] h-5 bg-black" />
            ))}
          </div>
          
          {/* Moving Box Indicator */}
          <motion.div 
            className="absolute left-0 w-8 h-5 border-[1px] border-black bg-[#EBEBEB]/50 backdrop-blur-[2px] z-10"
            style={{ 
              x: indicatorX, 
              left: -15.5, // Precision centering: (1/2) - (32/2) = 0.5 - 16 = -15.5
            }} 
          />
        </div>
      </nav>

      {/* Main Horizontal Scroll Container */}
      <div 
        ref={containerRef}
        className="snap-container no-scrollbar"
      >
        
        {/* Section 1: Intro */}
        <section className="snap-section">
          <CardContainer>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="card-content bg-white overflow-hidden !p-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              <CardItem translateZ={0.5} className="relative w-full h-full">
                <img 
                  src={asset('images/projects/portfolio-hero-2026.webp')} 
                  alt="Portfolio" 
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2070";
                    e.currentTarget.className = "absolute inset-0 w-full h-full object-cover grayscale opacity-20";
                  }}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </CardItem>
            </motion.div>
          </CardContainer>
        </section>

        {/* Section 2: Resume */}
        <section className="snap-section">
          <CardContainer>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 180,
                damping: 20,
                delay: 0.1
              }}
              className="card-content bg-white !p-0 overflow-hidden"
              style={{ transformStyle: "preserve-3d" }}
            >
              <CardItem translateZ={0.5} className="absolute inset-0">
                <img 
                  src={asset('images/projects/portfolio-resume.webp')} 
                  alt="Resume" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </CardItem>
            </motion.div>
          </CardContainer>
        </section>

        {/* Section 3: Design Intelligence */}
        <section className="snap-section" id="design-intelligence">
          <CardContainer>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 20,
                delay: 0.2
              }}
              className="card-content bg-white !p-0 group cursor-pointer overflow-hidden aspect-video"
              onClick={openDesignIntelligence}
              onMouseEnter={warmDesignIntelligence}
              onFocus={warmDesignIntelligence}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-full h-full">
                <CardItem translateZ={0.5} className="absolute inset-0">
                  <img
                    src={asset('images/projects/design-intelligence-cover.webp')}
                    alt="Design Intelligence 设计智能化"
                    className="w-full h-full object-cover transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </CardItem>

                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-0 group-hover:delay-[600ms] flex flex-col justify-end p-12 text-white">
                  <CardItem translateZ={2} className="max-w-[580px]">
                    <h3 className="text-4xl font-bold tracking-tighter mb-4">Design Intelligence</h3>
                    <p className="text-sm opacity-80 leading-relaxed">
                      从用 AI 加速界面探索与产品交付，到为 AI 构建设计规范与可复用能力。
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      VIEW PROJECT <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </CardItem>
                </div>
              </div>
            </motion.div>
          </CardContainer>
        </section>

        {/* Section 4: 科沃斯超级导购 */}
        <section className="snap-section">
          <CardContainer>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 180,
                damping: 20,
                delay: 0.25
              }}
              className="card-content bg-white !p-0 group cursor-pointer overflow-hidden aspect-video"
              onClick={() => openPortfolioProject('kovos-guide')}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-full h-full">
                <CardItem translateZ={0.5} className="absolute inset-0">
                  <img 
                    src={asset('images/projects/kovos-guide-cover.webp')} 
                    alt="科沃斯超级导购" 
                    className="w-full h-full object-cover transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </CardItem>
                
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-0 group-hover:delay-[600ms] flex flex-col justify-end p-12 text-white">
                  <CardItem translateZ={2} className="max-w-[580px]">
                    <h3 className="text-4xl font-bold tracking-tighter mb-4">科沃斯超级导购</h3>
                    <p className="text-sm opacity-80 leading-relaxed">
                      科沃斯超级导购APP，是科沃斯自研的轻量化零售门店数字化运营与管理的移动终端，帮助终端门店快捷高效地实现订单、客户、商品、库存的管理
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      VIEW PROJECT <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </CardItem>
                </div>
              </div>
            </motion.div>
          </CardContainer>
        </section>

        {/* Section 4: Linear */}
        <section className="snap-section">
          <CardContainer>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 180,
                damping: 20,
                delay: 0.3
              }}
              className="card-content bg-white !p-0 group cursor-pointer overflow-hidden aspect-video"
              onClick={() => openPortfolioProject('kovos-agent')}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-full h-full">
                <CardItem translateZ={0.5} className="absolute inset-0">
                  <img 
                    src={asset('images/projects/kovos-agent-cover.webp')} 
                    alt="辛顿智能体平台" 
                    className="w-full h-full object-cover transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </CardItem>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-0 group-hover:delay-[600ms] flex flex-col justify-end p-12 text-white">
                  <CardItem translateZ={2} className="max-w-[580px]">
                    <h3 className="text-4xl font-bold tracking-tighter mb-4">辛顿智能体平台</h3>
                    <p className="text-sm opacity-80 leading-relaxed">
                      科沃斯集团搭建的从产品、研发、制造、品质、采购、财务，到市场、销售、仓储物流、客服、售后维修等18个全流程业务版块的智能体平台，能做到各Agent之间无缝衔接，实现端到端自动化运行
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      VIEW PROJECT <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </CardItem>
                </div>
              </div>
            </motion.div>
          </CardContainer>
        </section>

        {/* Section 5: Raycast */}
        <section className="snap-section">
          <CardContainer>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 180,
                damping: 20,
                delay: 0.4
              }}
              className="card-content bg-white !p-0 group cursor-pointer overflow-hidden aspect-video"
              onClick={() => openPortfolioProject('raycast')}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-full h-full">
                <CardItem translateZ={0.5} className="absolute inset-0">
                  <img 
                    src={asset('images/projects/self-service-cover.webp')} 
                    alt="用户自助服务大厅" 
                    className="w-full h-full object-cover transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </CardItem>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-0 group-hover:delay-[600ms] flex flex-col justify-end p-12 text-white">
                  <CardItem translateZ={2} className="max-w-[458px]">
                    <h3 className="text-4xl font-bold tracking-tighter mb-4">用户自助服务大厅</h3>
                    <p className="text-sm opacity-80 leading-relaxed">
                      科沃斯官方售后自助平台，是为用户打造的一站式售后服务入口
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      VIEW PROJECT <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </CardItem>
                </div>
              </div>
            </motion.div>
          </CardContainer>
        </section>

        {/* Section 6: Writing */}
        <section className="snap-section">
          <CardContainer>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 180,
                damping: 20,
                delay: 0.5
              }}
              className="card-content bg-white !p-0 group cursor-pointer overflow-hidden aspect-video"
              onClick={() => openPortfolioProject('writing')}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-full h-full">
                <CardItem translateZ={0.5} className="absolute inset-0">
                  <img 
                    src={asset('images/projects/blabla-english-cover.webp')} 
                    alt="彼言英语 BlaBla" 
                    className="w-full h-full object-cover transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </CardItem>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-0 group-hover:delay-[600ms] flex flex-col justify-end p-12 text-white">
                  <CardItem translateZ={2} className="max-w-[458px]">
                    <h3 className="text-4xl font-bold tracking-tighter mb-4">彼言英语 BlaBla</h3>
                    <p className="text-sm opacity-80 leading-relaxed">
                      招募全球英语母语人士，通过短视频、语音聊天结合 AI 技术，让用户足不出户零距离接触真实英语场景，与母语者学习英语
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      VIEW PROJECT <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </CardItem>
                </div>
              </div>
            </motion.div>
          </CardContainer>
        </section>

        {/* Section 7: Connect */}
        <section className="snap-section">
          <CardContainer>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 180,
                damping: 20,
                delay: 0.6
              }}
              className="card-content bg-white !p-0 group cursor-pointer overflow-hidden aspect-video"
              onClick={() => openPortfolioProject('e-insight')}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-full h-full">
                <CardItem translateZ={0.5} className="absolute inset-0">
                  <img 
                    src={asset('images/projects/e-insight-cover.webp')} 
                    alt="Connect" 
                    className="w-full h-full object-cover transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </CardItem>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-0 group-hover:delay-[600ms] flex flex-col justify-end p-12 text-white">
                  <CardItem translateZ={2} className="max-w-[458px]">
                    <h3 className="text-4xl font-bold tracking-tighter mb-4">E-Insight 数字化运营</h3>
                    <p className="text-sm opacity-80 leading-relaxed">
                      通过全面分析实时经营数据，精准洞察当前发展机遇与潜在风险，为企业经营决策提供科学指导
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      VIEW PROJECT <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </CardItem>
                </div>
              </div>
            </motion.div>
          </CardContainer>
        </section>

        {/* Section 8: About */}
        <section className="snap-section">
          <CardContainer>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 180,
                damping: 20,
                delay: 0.7
              }}
              className="card-content bg-white !p-0 group cursor-pointer overflow-hidden aspect-video"
              onClick={() => openPortfolioProject('xuanxing-uni')}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-full h-full">
                <CardItem translateZ={0.5} className="absolute inset-0">
                  <img 
                    src={asset('images/projects/xuanxing-uni-cover.webp')} 
                    alt="About" 
                    className="w-full h-full object-cover transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </CardItem>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-0 group-hover:delay-[600ms] flex flex-col justify-end p-12 text-white">
                  <CardItem translateZ={2} className="max-w-[580px]">
                    <h3 className="text-4xl font-bold tracking-tighter mb-4">绚星企业大学</h3>
                    <p className="text-sm opacity-80 leading-relaxed">
                      面向企业的互联网学习平台，员工可随时随地开展在线学习、考试、交流等活动。同时，平台基于学习资源、项目及行为数据进行智能分析，为企业学习监测、运营与决策提供支撑，助力人才培养
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                      VIEW PROJECT <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </CardItem>
                </div>
              </div>
            </motion.div>
          </CardContainer>
        </section>

        {/* Section 9: Connect (Original Style) */}
        <section className="snap-section">
          <CardContainer>
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 180,
                damping: 20,
                delay: 0.8
              }}
              className="card-content bg-white !p-0 group cursor-pointer overflow-hidden aspect-video"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-full h-full">
                <CardItem translateZ={0.5} className="absolute inset-0">
                  <img 
                    src={asset('images/projects/portfolio-connect.webp')} 
                    alt="Connect" 
                    className="w-full h-full object-cover transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </CardItem>
              </div>
            </motion.div>
          </CardContainer>
        </section>

      </div>

      {/* Fixed UI Elements Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 flex flex-col">
        {/* Top Margin Spacer - matches nav height roughly */}
        <div className="h-[60px] flex-shrink-0" />
        <div className="flex-1" />
        
        {/* Card Area Placeholder (matches .card-content sizing) */}
        <div className="aspect-video w-full max-w-[1600px] max-h-[calc(100vh-180px)] mx-auto" />
        
        <div className="flex-1" />
        {/* Bottom Margin Content - Guaranteed visibility with min-h */}
        <div className="min-h-[100px] flex-shrink-0 flex items-center justify-between px-10">
          <div className="flex flex-col gap-1 pointer-events-auto relative group">
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">YIFAN.LV</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-30">UI/UX DESIGNER</span>
            
            {/* Contact Card */}
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-black/10 shadow-lg rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-2 whitespace-nowrap z-[60]">
              <Phone className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest">CONNECT: 18852403912</span>
            </div>
          </div>

          <div className="pointer-events-auto cursor-pointer group/scroll" onClick={handleAction}>
            <motion.div 
              animate={isLastPage ? { x: [0, -10, 0] } : { x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-30 group-hover/scroll:opacity-60 transition-opacity flex items-center gap-2"
            >
              {isLastPage ? "Back to Home" : "Scroll to explore"} <span className="text-lg">{isLastPage ? "←" : "→"}</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Project Detail View Overlay */}
      <AnimatePresence>
        {activeProject && (
          <motion.div 
            ref={detailContainerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onScroll={handleDetailScroll}
            className="fixed inset-0 z-[200] bg-white overflow-y-auto scrollbar-overlay"
          >
            {/* Back Button Container */}
            <div className="fixed top-8 left-8 z-[210]">
              <AnimatePresence mode="popLayout">
                {!isDetailScrolled ? (
                  <motion.button 
                    key="rect-back"
                    onClick={() => closePortfolioProject(true)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-center bg-white/70 backdrop-blur-md border border-black/5 text-black hover:bg-black hover:text-white transition-colors rounded-full h-12 px-6 group whitespace-nowrap"
                  >
                    <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Back to Portfolio</span>
                  </motion.button>
                ) : (
                  <motion.button 
                    key="circle-back"
                    onClick={() => closePortfolioProject(true)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-center bg-white/70 backdrop-blur-md border border-black/5 text-black hover:bg-black hover:text-white transition-colors rounded-full h-12 w-12"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Back to Top Button */}
            <AnimatePresence>
              {isAtBottom && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => detailContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="fixed bottom-8 right-8 z-[210] w-8 h-8 rounded-full bg-white/70 backdrop-blur-md border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                >
                  <ArrowUp className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Detail Content - Seamless Gallery */}
            <div className="w-full">
              {/* Global Loading Spinner */}
              {isFirstImageLoading && (
                <div className="fixed inset-0 pt-[400px] flex justify-center z-[205] bg-white/50">
                  <Loader2 className="w-10 h-10 animate-spin text-[#dddddd]" />
                </div>
              )}
              {/* Image Gallery */}
              <div className="flex flex-col">
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  {activeProject && projectImages[activeProject]?.map((src, index) => (
                    <ProjectImage
                      key={index}
                      src={src} 
                      alt={`${activeProject} 详情 ${index + 1}`} 
                      className="w-full h-auto block bg-white"
                      isFirst={index === 0}
                      onLoad={index === 0 ? () => setIsFirstImageLoading(false) : undefined}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Design Intelligence overlay — keep iframe mounted to avoid font reload flash */}
      {diFrameMounted && (
        <motion.div
          initial={false}
          animate={{ opacity: showDesignIntelligence ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[200] bg-black"
          style={{ pointerEvents: showDesignIntelligence ? 'auto' : 'none' }}
          aria-hidden={!showDesignIntelligence}
        >
          <iframe
            ref={diIframeRef}
            title="Design Intelligence"
            tabIndex={-1}
            src={`${import.meta.env.BASE_URL}design-intelligence/design-intelligence-mockup.html#chapter`}
            className="absolute inset-0 h-full w-full border-0 bg-black"
          />
        </motion.div>
      )}

      {/* Custom Cursor / Interactive Element (Optional but adds to the feel) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[100]">
        {/* We could add a custom cursor here if needed */}
      </div>
    </div>
  );
}
