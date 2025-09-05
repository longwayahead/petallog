// src/components/TabBar.tsx
import type { Ref } from 'react';

export default function TabBar({
  active, onChange, indicatorRef
}:{
  active: number;
  onChange: (i:number)=>void;
  indicatorRef: Ref<HTMLDivElement>;
}) {
  return (
    <div className="flex border-y border-gray-200 bg-gray-50 relative">
      <div ref={indicatorRef} id="tab-indicator" className="tab-indicator"
           style={{transform:`translateX(${active*100}%)`}}/>
      <button className={`flex-1 py-3 text-center font-medium ${active===0?'text-emerald-600':'text-gray-500'}`}
              onClick={()=>onChange(0)}>Timeline</button>
      <button className={`flex-1 py-3 text-center font-medium ${active===1?'text-emerald-600':'text-gray-500'}`}
              onClick={()=>onChange(1)}>Gallery</button>
    </div>
  );
}
