/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * South Indian (Tamil Style) Fixed-Sign Grid Chart
 * Traditional 4x4 layout with Mesham at top 2nd cell, moving clockwise.
 */

import React from 'react';
import { PlanetInfo, LagnaInfo, NavamsaPosition, LanguageType } from '../engine/types.ts';

interface SouthIndianChartProps {
  titleTamil: string;
  titleEnglish: string;
  lagna: LagnaInfo | { rasiIndex: number; degreeInRasi?: number };
  planets: (PlanetInfo | NavamsaPosition)[];
  language: LanguageType;
  subTitle?: string;
  size?: 'normal' | 'compact';
}

// 4x4 grid coordinates mapping to Rasi indices (0 to 11)
// Row 0: Meenam (11), Mesham (0), Rishabham (1), Mithunam (2)
// Row 1: Kumbham (10), Center, Center, Katakam (3)
// Row 2: Makaram (9), Center, Center, Simmam (4)
// Row 3: Dhanusu (8), Vrischigam (7), Thulam (6), Kanni (5)
const RASI_GRID_POSITIONS: { [rasiIndex: number]: { row: number; col: number } } = {
  11: { row: 0, col: 0 }, // Meenam
  0: { row: 0, col: 1 },  // Mesham
  1: { row: 0, col: 2 },  // Rishabham
  2: { row: 0, col: 3 },  // Mithunam
  3: { row: 1, col: 3 },  // Katakam
  4: { row: 2, col: 3 },  // Simmam
  5: { row: 3, col: 3 },  // Kanni
  6: { row: 3, col: 2 },  // Thulam
  7: { row: 3, col: 1 },  // Vrischigam
  8: { row: 3, col: 0 },  // Dhanusu
  9: { row: 2, col: 0 },  // Makaram
  10: { row: 1, col: 0 }, // Kumbham
};

const RASI_NAMES: { [index: number]: { ta: string; en: string } } = {
  0: { ta: 'மேஷம்', en: 'Aries' },
  1: { ta: 'ரிஷபம்', en: 'Taurus' },
  2: { ta: 'மிதுனம்', en: 'Gemini' },
  3: { ta: 'கடகம்', en: 'Cancer' },
  4: { ta: 'சிம்மம்', en: 'Leo' },
  5: { ta: 'கன்னி', en: 'Virgo' },
  6: { ta: 'துலாம்', en: 'Libra' },
  7: { ta: 'விருச்சிகம்', en: 'Scorpio' },
  8: { ta: 'தனுசு', en: 'Sagittarius' },
  9: { ta: 'மகரம்', en: 'Capricorn' },
  10: { ta: 'கும்பம்', en: 'Aquarius' },
  11: { ta: 'மீனம்', en: 'Pisces' },
};

const PLANET_SHORT_NAMES: { [id: string]: { ta: string; en: string } } = {
  sun: { ta: 'சூரியன்', en: 'Sun' },
  moon: { ta: 'சந்திரன்', en: 'Moon' },
  mars: { ta: 'செவ்வாய்', en: 'Mars' },
  mercury: { ta: 'புதன்', en: 'Merc' },
  jupiter: { ta: 'குரு', en: 'Jup' },
  venus: { ta: 'சுக்கிரன்', en: 'Ven' },
  saturn: { ta: 'சனி', en: 'Sat' },
  rahu: { ta: 'ராகு', en: 'Rahu' },
  ketu: { ta: 'கேது', en: 'Ketu' },
};

export const SouthIndianChart: React.FC<SouthIndianChartProps> = ({
  titleTamil,
  titleEnglish,
  lagna,
  planets,
  language,
  subTitle,
  size = 'normal',
}) => {
  // Group planets by sign
  const planetsByRasi: { [rasi: number]: (PlanetInfo | NavamsaPosition)[] } = {};
  for (let i = 0; i < 12; i++) {
    planetsByRasi[i] = [];
  }

  planets.forEach(p => {
    if (p.id !== 'lagna' && planetsByRasi[p.rasiIndex]) {
      planetsByRasi[p.rasiIndex].push(p);
    }
  });

  const cellHeightClass = size === 'compact' ? 'h-24 min-h-[96px]' : 'h-32 min-h-[128px]';

  // Render a single rasi cell
  const renderCell = (rasiIndex: number) => {
    const isLagnaHere = lagna.rasiIndex === rasiIndex;
    const rasiPlanets = planetsByRasi[rasiIndex] || [];
    const rasiInfo = RASI_NAMES[rasiIndex];

    return (
      <div
        key={rasiIndex}
        className={`relative border border-amber-900/40 bg-slate-900/70 p-2 flex flex-col justify-between overflow-hidden transition-colors hover:bg-slate-800/80 ${cellHeightClass}`}
      >
        {/* Sign header */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300/80">
          <span>{language === 'ta' ? rasiInfo.ta : rasiInfo.en}</span>
          <span className="text-[10px] text-slate-400 font-mono">#{rasiIndex + 1}</span>
        </div>

        {/* Contents: Lagna and Planets */}
        <div className="flex flex-wrap gap-1 content-start my-auto py-1">
          {isLagnaHere && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs shadow-sm">
              <span>{language === 'ta' ? 'ல' : 'Asc'}</span>
              {'degreeInRasi' in lagna && lagna.degreeInRasi !== undefined && (
                <span className="text-[10px] font-mono text-amber-200">
                  {Math.floor(lagna.degreeInRasi)}°
                </span>
              )}
            </span>
          )}

          {rasiPlanets.map(p => {
            const shortInfo = PLANET_SHORT_NAMES[p.id] || { ta: p.nameTamil, en: p.nameEnglish };
            const isRetro = 'isRetrograde' in p && p.isRetrograde;
            const isCombust = 'isCombust' in p && p.isCombust;
            const degree = 'degreeInRasi' in p && typeof p.degreeInRasi === 'number' ? Math.floor(p.degreeInRasi) : null;

            return (
              <span
                key={p.id}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-100 border border-slate-700/60 text-xs font-medium"
                title={`${p.nameTamil} (${p.nameEnglish}) ${degree !== null ? `${degree}°` : ''}`}
              >
                <span>{language === 'ta' ? shortInfo.ta : shortInfo.en}</span>
                {degree !== null && <span className="text-[10px] font-mono text-slate-400">{degree}°</span>}
                {isRetro && (
                  <span className="text-[10px] text-rose-400 font-bold" title={language === 'ta' ? 'வக்ரம்' : 'Retrograde'}>
                    (வ)
                  </span>
                )}
                {isCombust && (
                  <span className="text-[10px] text-orange-400 font-bold" title={language === 'ta' ? 'அஸ்தமனம்' : 'Combust'}>
                    (அ)
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-xl border border-amber-900/50 bg-slate-950 p-2 shadow-2xl">
      <div className="grid grid-cols-4 gap-1">
        {/* Row 0: Meenam (11), Mesham (0), Rishabham (1), Mithunam (2) */}
        {renderCell(11)}
        {renderCell(0)}
        {renderCell(1)}
        {renderCell(2)}

        {/* Row 1: Kumbham (10), Center (col 1-2), Katakam (3) */}
        {renderCell(10)}
        <div className="col-span-2 row-span-2 border border-amber-500/30 rounded-lg bg-gradient-to-b from-amber-950/20 via-slate-900/60 to-amber-950/30 p-4 flex flex-col items-center justify-center text-center shadow-inner">
          <div className="text-amber-400 font-cinzel text-lg font-bold tracking-wide">
            {language === 'ta' ? titleTamil : titleEnglish}
          </div>
          <div className="text-xs text-amber-200/70 mt-1 font-tamil">
            {language === 'ta' ? 'தமிழ் பாரம்பரிய முறை (தென்னிந்திய சக்கரம்)' : 'South Indian Fixed-Sign Grid'}
          </div>
          {subTitle && (
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              {subTitle}
            </div>
          )}
          <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-2">
            <span>(வ) {language === 'ta' ? 'வக்ரம்' : 'Retro'}</span>
            <span>·</span>
            <span>(அ) {language === 'ta' ? 'அஸ்தமனம்' : 'Combust'}</span>
          </div>
        </div>
        {renderCell(3)}

        {/* Row 2: Makaram (9), Center (occupied above), Simmam (4) */}
        {renderCell(9)}
        {renderCell(4)}

        {/* Row 3: Dhanusu (8), Vrischigam (7), Thulam (6), Kanni (5) */}
        {renderCell(8)}
        {renderCell(7)}
        {renderCell(6)}
        {renderCell(5)}
      </div>
    </div>
  );
};
