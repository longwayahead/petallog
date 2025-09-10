// // usePageSwipe.ts
// import { useState, useRef } from 'react';
// import { SlideController } from './SlideController';

// export function usePageSwipe({
//   index,
//   count,
//   onIndexChange,
// }: {
//   index: number;
//   count: number;
//   onIndexChange: (i: number) => void;
// }) {
//   const [dx, setDx] = useState(0);

//   const ctrlRef = useRef<SlideController>(null);
//   const indexRef = useRef(index);
//   indexRef.current = index;


//   if (!ctrlRef.current) {
//     ctrlRef.current = new SlideController({
//       axis: 'x',
//       max: 9999,
//       minCommit: 10,
//       onCommitLeft: () => {
//         // dx < -minCommit → user swiped LEFT
//         if (indexRef.current <  count -1) {
//             onIndexChange(index + 1); // timeline → gallery
//             console.log('timeline to gallery');
//         }
//     },
//       onCommitRight: () => {
//         // dx > minCommit → user swiped RIGHT
//         if (indexRef.current > 0) {
//             console.log(index);
//             onIndexChange(index - 1); // gallery → timeline
//             console.log('gallery to timeline');
//         }
//     },
//     });
//   }
//   const ctrl = ctrlRef.current;

//   return {
    
//     dx,
//     bind: {
//       ...ctrl.bind,
//       onPointerMove: (e: React.PointerEvent) => {
//         ctrl.bind.onPointerMove(e);
//         setDx(ctrl.dx);
//         console.log(index);
//       },
//       onPointerUp: () => {
//         ctrl.bind.onPointerUp();
//         setDx(0);
//       },
//     },
//   };
// }
