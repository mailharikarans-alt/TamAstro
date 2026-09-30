/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * North Indian Diamond Kundali Layout
 * Houses 1-12 rotate counter-clockwise with House 1 (Lagna) at the top diamond.
 */

import React from 'react';
import { PlanetInfo, LagnaInfo, NavamsaPosition, LanguageType } from '../engine/types.ts';

interface NorthIndianChartProps {
  titleTamil: string;
  titleEnglish: string;
  lagna: LagnaInfo | { rasiIndex: number; degreeInRasi?: number };
  planets: (PlanetInfo | NavamsaPosition)[];
  language: LanguageType;
  subTitle?: string;
}

const PLANET_SHORT_NAMES: { [id: string]: { ta: string; en: string } } = {
  sun: { ta: 'சூரி', en: 'Sun' },
  moon: { ta: 'சந்', en: 'Mo' },
  mars: { ta: 'செவ்', en: 'Ma' },
  mercury: { ta: 'புத', en: 'Me' },
  jupiter: { ta: 'குரு', en: 'Ju' },
  venus: { ta: 'சுக்', en: 'Ve' },
  saturn: { ta: 'சனி', en: 'Sa' },
  rahu: { ta: 'ராகு', en: 'Ra' },
  ketu: { ta: 'கேது', en: 'Ke' },
};

export const NorthIndianChart: React.FC<NorthIndianChartProps> = ({
  titleTamil,
  titleEnglish,
  lagna,
  planets,
  language,
}) => {
  // Houses 1 to 12:
  // House 1 = Lagna sign
  // House h = (lagna.rasiIndex + h - 1) % 12
  const planetsByHouse: { [house: number]: (PlanetInfo | NavamsaPosition)[] } = {};
  for (let h = 1; h <= 12; h++) {
    planetsByHouse[h] = [];
  }

  planets.forEach(p => {
    if (p.id !== 'lagna') {
      const houseNum = ((p.rasiIndex - lagna.rasiIndex + 12) % 12) + 1;
      planetsByHouse[houseNum].push(p);
    }
  });

  // SVG center and positions for the 12 houses (coordinates in a 400x400 viewBox)
  const HOUSE_ANCHORS: { [h: number]: { x: number; y: number } } = {
    1: { x: 200, y: 110 },
    2: { x: 100, y: 50 },
    3: { x: 50, y: 100 },
    4: { x: 110, y: 200 },
    5: { x: 50, y: 300 },
    6: { x: 100, y: 350 },
    7: { x: 200, y: 290 },
    8: { x: 300, y: 350 },
    9: { x: 350, y: 300 },
    10: { x: 290, y: 200 },
    11: { x: 350, y: 100 },
    12: { x: 300, y: 50 },
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-xl border border-amber-900/50 bg-slate-950 p-4 shadow-2xl">
      <div className="text-center mb-3">
        <div className="text-amber-400 font-cinzel text-lg font-bold">
          {language === 'ta' ? titleTamil : titleEnglish}
        </div>
        <div className="text-xs text-slate-400 font-tamil">
          {language === 'ta' ? 'வட இந்திய முறை (வைர வடிவம்)' : 'North Indian Diamond Chart'}
        </div>
      </div>

      <div className="relative aspect-square w-full max-w-[400px] mx-auto bg-slate-900/80 rounded-lg border border-amber-800/40 p-1">
        <svg viewBox="0 0 400 400" className="w-full h-full stroke-amber-500/50 fill-none" strokeWidth="1.5">
          {/* Outer square */}
          <rect x="10" y="10" width="380" height="380" />

          {/* Diagonals */}
          <line x1="10" y1="10" x2="390" y2="390" />
          <line x1="390" y1="10" x2="10" y2="390" />

          {/* Inner Diamond connecting midpoints */}
          <polygon points="200,10 390,200 200,390 10,200" />
        </svg>

        {/* Content overlays for each house */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
          const pos = HOUSE_ANCHORS[h];
          const signIndex = (lagna.rasiIndex + h - 1) % 12;
          const housePlanets = planetsByHouse[h] || [];
          const isLagna = h === 1;

          return (
            <div
              key={h}
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none w-20"
            >
              {/* Sign Number */}
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-slate-950/80 px-1 rounded">
                {signIndex + 1}
              </span>

              {/* Lagna marker */}
              {isLagna && (
                <span className="text-[10px] font-bold text-amber-300 font-tamil">
                  {language === 'ta' ? 'லக்' : 'Asc'}
                </span>
              )}

              {/* Planets */}
              <div className="flex flex-wrap items-center justify-center gap-0.5 mt-0.5 max-w-[70px]">
                {housePlanets.map(p => {
                  const short = PLANET_SHORT_NAMES[p.id] || { ta: p.nameTamil, en: p.nameEnglish };
                  const isRetro = 'isRetrograde' in p && p.isRetrograde;
                  return (
                    <span
                      key={p.id}
                      className="text-[9px] font-medium text-slate-100 bg-slate-800/90 px-1 py-0.2 rounded border border-slate-700/60 leading-tight"
                    >
                      {language === 'ta' ? short.ta : short.en}
                      {isRetro && <span className="text-rose-400">*</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
