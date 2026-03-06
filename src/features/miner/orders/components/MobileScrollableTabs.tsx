import { useEffect, useRef, useState, TouchEvent, ReactNode } from "react";
import { Badge } from "antd";

interface Tab {
  id: string;
  label: string;
  badgeCount?: number;
}

interface Props {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Tab[];
  children?: ReactNode;
}

export default function MobileScrollableTabs({ activeTab, onTabChange, tabs, children }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: '0%', width: '0%', opacity: 0 });
  
  // Touch handling state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Update scroll indicator based on scroll position
  const updateScrollIndicator = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    
    // If no scroll needed, hide
    if (scrollWidth <= clientWidth) {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      return;
    }

    const scrollPercentage = scrollLeft / (scrollWidth - clientWidth);
    const indicatorWidthPercent = (clientWidth / scrollWidth) * 100;
    
    // Calculate position
    const maxLeft = 100 - indicatorWidthPercent;
    const leftPos = scrollPercentage * maxLeft;

    setIndicatorStyle({
      left: `${leftPos}%`,
      width: `${indicatorWidthPercent}%`,
      opacity: 1
    });
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollIndicator);
      window.addEventListener('resize', updateScrollIndicator);
      
      // Initial update
      requestAnimationFrame(() => updateScrollIndicator());
      
      return () => {
        el.removeEventListener('scroll', updateScrollIndicator);
        window.removeEventListener('resize', updateScrollIndicator);
      };
    }
  }, []);

  // Scroll active tab into view when it changes
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    // Find the active button
    const activeBtn = el.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
    if (activeBtn) {
      const { offsetLeft, offsetWidth } = activeBtn;
      const { scrollLeft, clientWidth } = el;
      
      // Check if out of view or partially out
      if (offsetLeft < scrollLeft || (offsetLeft + offsetWidth) > (scrollLeft + clientWidth)) {
        // Center it
        const newScrollLeft = offsetLeft - (clientWidth / 2) + (offsetWidth / 2);
        el.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  // Swipe handling
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Reset
    touchStartX.current = null;
    touchStartY.current = null;

    // Threshold for swipe (e.g., 50px)
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe detected
      const currentIndex = tabs.findIndex(t => t.id === activeTab);
      
      if (diffX > 0) {
        // Swiped Left -> Next Tab
        if (currentIndex < tabs.length - 1) {
          onTabChange(tabs[currentIndex + 1].id);
        }
      } else {
        // Swiped Right -> Prev Tab
        if (currentIndex > 0) {
          onTabChange(tabs[currentIndex - 1].id);
        }
      }
    }
  };

  return (
    <div className="w-full">
      {/* Tabs Container */}
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="bg-gray-100 p-1 rounded-lg flex flex-nowrap w-full overflow-x-auto no-scrollbar scroll-smooth"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-none px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.badgeCount !== undefined && (
                <Badge 
                  count={tab.badgeCount} 
                  showZero={false} 
                  color={activeTab === tab.id ? '#1f2937' : '#9ca3af'} 
                />
              )}
            </button>
          ))}
        </div>
        
        {/* Scroll Indicator Track - Only visible if content overflows */}
        <div 
          className="h-1 w-full bg-gray-100 mt-1 rounded-full overflow-hidden relative transition-opacity duration-300"
          style={{ opacity: indicatorStyle.opacity }}
        >
          <div 
            className="absolute top-0 h-full bg-gray-400 rounded-full transition-all duration-200 ease-out"
            style={{ 
              left: indicatorStyle.left, 
              width: indicatorStyle.width
            }}
          />
        </div>
      </div>

      {/* Content Area with Swipe Detection */}
      <div 
        className="mt-4 min-h-[400px] min-w-0 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
