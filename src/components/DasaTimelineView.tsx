/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DasaPeriod, LanguageType } from '../engine/types.ts';
import { ChevronDown, ChevronRight, Clock, Sparkles } from 'lucide-react';

interface DasaTimelineViewProps {
  timeline: DasaPeriod[];
  dasaBalance: {
    lordTamil: string;
    lordEnglish: string;
    balanceYears: number;
    balanceMonths: number;
    balanceDays: number;
  };
  language: LanguageType;
}

export const DasaTimelineView: React.FC<DasaTimelineViewProps> = ({ timeline, dasaBalance, language }) => {
  const [expandedDasaIndex, setExpandedDasaIndex] = useState<number | null>(() => {
    const currentIdx = timeline.findIndex(d => d.isCurrent);
    return currentIdx !== -1 ? currentIdx : 0;
  });

  const [expandedBhuktiIndex, setExpandedBhuktiIndex] = useState<number | null>(null);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg space-y-4">
      {/* Header and Balance Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>{language === 'ta' ? 'விம்சோத்தரி தசா புத்திகள்' : 'Vimshottari Dasa - Bhukti Timeline'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'ta'
              ? 'சந்திரனின் ஜன்ம நட்சத்திர பாதத்தில் இருந்து கணிக்கப்படும் 120 வருட கால அட்டவணை.'
              : '120-year cycle calculated from natal Moon nakshatra degree.'}
          </p>
        </div>

        {/* Dasa balance at birth */}
        <div className="bg-amber-950/40 border border-amber-800/40 rounded-lg px-3 py-1.5 text-xs text-amber-200">
          <span className="text-slate-400">{language === 'ta' ? 'பிறப்பில் தசா இருப்பு: ' : 'Birth Dasa Balance: '}</span>
          <span className="font-semibold text-amber-300">
            {language === 'ta' ? dasaBalance.lordTamil : dasaBalance.lordEnglish} {language === 'ta' ? 'தசை' : 'Dasa'}
          </span>{' '}
          <span className="font-mono font-bold text-white">
            {dasaBalance.balanceYears}y {dasaBalance.balanceMonths}m {dasaBalance.balanceDays}d
          </span>
        </div>
      </div>

      {/* Dasa list */}
      <div className="space-y-2">
        {timeline.map((dasa, dIdx) => {
          const isExpanded = expandedDasaIndex === dIdx;
          const isCurrent = dasa.isCurrent;

          return (
            <div
              key={dIdx}
              className={`rounded-lg border transition-all ${
                isCurrent
                  ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 shadow-md'
                  : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              {/* Dasa Main Row */}
              <button
                type="button"
                onClick={() => {
                  setExpandedDasaIndex(isExpanded ? null : dIdx);
                  setExpandedBhuktiIndex(null);
                }}
                className="w-full text-left p-3 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        {language === 'ta' ? `${dasa.lordTamil} தசை` : `${dasa.lordEnglish} Dasa`}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{language === 'ta' ? 'தற்போது நடக்கும் தசை' : 'Currently Running'}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{language === 'ta' ? 'காலம்:' : 'Duration:'} {dasa.years} {language === 'ta' ? 'வருடங்கள்' : 'years'}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-300">{dasa.startDate} {language === 'ta' ? 'முதல்' : 'to'} {dasa.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {language === 'ta' ? 'வயது' : 'Age'}: {dasa.startAgeYears.toFixed(1)} - {dasa.endAgeYears.toFixed(1)}
                  </span>
                </div>
              </button>

              {/* Bhuktis Sub-periods dropdown */}
              {isExpanded && (
                <div className="px-4 pb-3 pt-1 border-t border-slate-800/70 bg-slate-950/60 space-y-2">
                  <div className="text-xs font-semibold text-slate-400 pt-1">
                    {language === 'ta' ? 'புத்திகள் (Sub-Periods):' : 'Bhuktis (Sub-Periods):'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {dasa.bhuktis.map((bhukti, bIdx) => {
                      const isBhuktiOpen = expandedBhuktiIndex === bIdx;
                      return (
                        <div
                          key={bIdx}
                          className="rounded border border-slate-800 bg-slate-900/80 p-2 text-xs hover:border-slate-700"
                        >
                          <div
                            onClick={() => setExpandedBhuktiIndex(isBhuktiOpen ? null : bIdx)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <span className="font-medium text-amber-200">
                              {language === 'ta' ? `${bhukti.lordTamil} புத்தி` : `${bhukti.lordEnglish} Bhukti`}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {bhukti.startAgeYears} - {bhukti.endAgeYears}y
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 font-mono mt-1">
                            {bhukti.startDate} to {bhukti.endDate}
                          </div>

                          {/* Antara periods */}
                          {isBhuktiOpen && bhukti.antaras && (
                            <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1">
                              <span className="text-[10px] text-slate-400 font-semibold block">
                                {language === 'ta' ? 'அந்தரங்கள்:' : 'Antaras:'}
                              </span>
                              {bhukti.antaras.map((antara, aIdx) => (
                                <div key={aIdx} className="flex justify-between text-[10px] text-slate-300">
                                  <span>{language === 'ta' ? antara.lordTamil : antara.lordEnglish}</span>
                                  <span className="font-mono text-slate-400">{antara.startDate}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
