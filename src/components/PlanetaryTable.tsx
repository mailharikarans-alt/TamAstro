/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlanetInfo, LagnaInfo, LanguageType } from '../engine/types.ts';
import { degToDms } from '../engine/astro.ts';

interface PlanetaryTableProps {
  lagna: LagnaInfo;
  planets: PlanetInfo[];
  language: LanguageType;
}

export const PlanetaryTable: React.FC<PlanetaryTableProps> = ({ lagna, planets, language }) => {
  const getDignityLabel = (dignity: PlanetInfo['dignity']) => {
    const mapTa: Record<string, string> = {
      exalted: 'உச்சம்',
      moolatrikona: 'மூலத்திரிகோணம்',
      own: 'ஆட்சி',
      friend: 'நட்பு',
      neutral: 'சமம்',
      enemy: 'பகை',
      debilitated: 'நீசம்',
    };
    const mapEn: Record<string, string> = {
      exalted: 'Exalted',
      moolatrikona: 'Moolatrikona',
      own: 'Own House',
      friend: 'Friend',
      neutral: 'Neutral',
      enemy: 'Enemy',
      debilitated: 'Debilitated',
    };
    return language === 'ta' ? mapTa[dignity] : mapEn[dignity];
  };

  const getDignityColor = (dignity: PlanetInfo['dignity']) => {
    switch (dignity) {
      case 'exalted':
        return 'text-emerald-400 font-semibold';
      case 'own':
      case 'moolatrikona':
        return 'text-amber-400 font-semibold';
      case 'friend':
        return 'text-sky-300';
      case 'enemy':
        return 'text-orange-400';
      case 'debilitated':
        return 'text-rose-400 font-semibold';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
      <table className="w-full text-left text-sm font-sans border-collapse">
        <thead className="bg-slate-950/80 text-xs text-amber-400 uppercase tracking-wider border-b border-slate-800">
          <tr>
            <th className="py-3 px-3">{language === 'ta' ? 'கிரகம்' : 'Graha / Planet'}</th>
            <th className="py-3 px-3">{language === 'ta' ? 'ராசி' : 'Rasi / Sign'}</th>
            <th className="py-3 px-3 font-mono">{language === 'ta' ? 'பாகை / கலை' : 'Deg / Min'}</th>
            <th className="py-3 px-3">{language === 'ta' ? 'நட்சத்திரம்' : 'Nakshatra'}</th>
            <th className="py-3 px-2 text-center">{language === 'ta' ? 'பாதம்' : 'Pada'}</th>
            <th className="py-3 px-3">{language === 'ta' ? 'அதிபதி' : 'Lord'}</th>
            <th className="py-3 px-3 text-center">{language === 'ta' ? 'நிலை' : 'Status'}</th>
            <th className="py-3 px-3">{language === 'ta' ? 'பலன் நிலை' : 'Dignity'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-200">
          {/* Lagna Row */}
          <tr className="bg-amber-950/20 font-medium">
            <td className="py-2.5 px-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="font-bold text-amber-300">
                {language === 'ta' ? 'லக்னம் (Lagna)' : 'Lagna (Ascendant)'}
              </span>
            </td>
            <td className="py-2.5 px-3">
              {language === 'ta' ? lagna.rasiNameTamil : lagna.rasiNameEnglish}
            </td>
            <td className="py-2.5 px-3 font-mono text-xs tabular-nums text-amber-200">
              {degToDms(lagna.degreeInRasi).formatted}
            </td>
            <td className="py-2.5 px-3">
              {language === 'ta' ? lagna.nakshatraNameTamil : lagna.nakshatraNameEnglish}
            </td>
            <td className="py-2.5 px-2 text-center font-mono font-bold text-amber-300">
              {lagna.pada}
            </td>
            <td className="py-2.5 px-3 text-slate-400">
              {lagna.nakshatraLord}
            </td>
            <td className="py-2.5 px-3 text-center text-xs text-slate-400">
              -
            </td>
            <td className="py-2.5 px-3 text-xs text-amber-400/80">
              {language === 'ta' ? 'ஜன்ம லக்னம்' : 'Ascendant'}
            </td>
          </tr>

          {/* Planets */}
          {planets.map(p => {
            const dms = degToDms(p.degreeInRasi);
            return (
              <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2.5 px-3 flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-xs">{p.symbol}</span>
                  <span className="font-medium text-slate-100">
                    {language === 'ta' ? p.nameTamil : p.nameEnglish}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  {language === 'ta' ? p.rasiNameTamil : p.rasiNameEnglish}
                </td>
                <td className="py-2.5 px-3 font-mono text-xs tabular-nums text-slate-300">
                  {dms.formatted}
                </td>
                <td className="py-2.5 px-3">
                  {language === 'ta' ? p.nakshatraNameTamil : p.nakshatraNameEnglish}
                </td>
                <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                  {p.pada}
                </td>
                <td className="py-2.5 px-3 text-slate-400 text-xs">
                  {p.nakshatraLord}
                </td>
                <td className="py-2.5 px-3 text-center text-xs">
                  <div className="flex items-center justify-center gap-1">
                    {p.isRetrograde && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold" title={language === 'ta' ? 'வக்ரம்' : 'Retrograde'}>
                        {language === 'ta' ? 'வ' : 'R'}
                      </span>
                    )}
                    {p.isCombust && (
                      <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-bold" title={language === 'ta' ? 'அஸ்தமனம்' : 'Combust'}>
                        {language === 'ta' ? 'அ' : 'C'}
                      </span>
                    )}
                    {!p.isRetrograde && !p.isCombust && (
                      <span className="text-slate-500 font-mono">-</span>
                    )}
                  </div>
                </td>
                <td className={`py-2.5 px-3 text-xs ${getDignityColor(p.dignity)}`}>
                  {getDignityLabel(p.dignity)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
