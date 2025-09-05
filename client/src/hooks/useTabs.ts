import { useEffect, useRef, useState } from 'react';

type AnyRef<T extends HTMLElement> = { readonly current: T | null }; 

export function useTabs<T extends HTMLElement>(
  panels: ReadonlyArray<AnyRef<T>>,
  topRef?: AnyRef<T>, //
) { 
    const [active, setActive] = useState(0); 
    const containerRef = useRef<HTMLDivElement>(null); 
    const wrapperRef = useRef<HTMLDivElement>(null);
 const indicatorRef = useRef<HTMLDivElement>(null);

const getPanelHeight = () => {
  const panelHeight = panels[active].current?.scrollHeight ?? 0;
  const headerHeight = topRef?.current?.offsetHeight ?? 0;
  const minHeight = window.innerHeight - headerHeight - 56;

  return Math.max(panelHeight, minHeight);
};

 useEffect(() => { 
    const el = containerRef.current; if (!el) return; 
    // console.log(topRef?.current?.scrollHeight);
    const ro = new ResizeObserver(() => {

          el.style.height = getPanelHeight() + 'px';

      
    });
    panels.forEach(p => p.current && ro.observe(p.current));
    
    if(topRef?.current) ro.observe(topRef.current);
    el.style.height = getPanelHeight() + 'px';

    return () => ro.disconnect();
}, [active, panels]);

    const show = (i: number) => { 
        // wrapperRef.current && (wrapperRef.current.style.transform = `translateX(-${i * 50}%)`); 
        // indicatorRef.current && (indicatorRef.current.style.transform = `translateX(${i * 100}%)`); 
        setActive(i); 
    }; return { 
        active, show, containerRef, wrapperRef, indicatorRef 
    }; 
}

