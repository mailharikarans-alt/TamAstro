/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { calculatePorutham } from '../engine/astro.ts';
import { LanguageType, UserProfile } from '../engine/types.ts';
import nakshatrasData from '../engine/data/nakshatras.json';
import rashisData from '../engine/data/rashis.json';
import { Heart, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';

interface PoruthamViewProps {
  language: LanguageType;
  savedProfiles: UserProfile[];
}

export const PoruthamView: React.FC<PoruthamViewProps> = ({ language, savedProfiles }) => {
  // Default: Boy: Ashwini (0) / Mesham (0), Girl: Rohini (3) / Rishabham (1)
  const [boyNakIndex, setBoyNakIndex] = useState<number>(0);
  const [boyRasiIndex, setBoyRasiIndex] = useState<number>(0);

  const [girlNakIndex, setGirlNakIndex] = useState<number>(3);
  const [girlRasiIndex, setGirlRasiIndex] = useState<number>(1);

  // Chevvai dosham manual check toggles
  const [boyChevvai, setBoyChevvai] = useState<boolean>(false);
  const [girlChevvai, setGirlChevvai] = useState<boolean>(false);

  const result = calculatePorutham(boyNakIndex, boyRasiIndex, girlNakIndex, girlRasiIndex);

  // Sevvai Dosham compatibility logic
  const isChevvaiMatch = (boyChevvai && girlChevvai) || (!boyChevvai && !girlChevvai);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Boy and Girl Selection Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Heart className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-slate-100">
            {language === 'ta' ? 'திருமணப் பொருத்தம் (10 பொருத்தங்கள்)' : 'Marriage Matching (10 Poruthams)'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Groom (Boy) */}
          <div className="space-y-3 p-4 rounded-xl border border-sky-900/40 bg-sky-950/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-sky-400">
                {language === 'ta' ? 'மணமகன் விவரம்' : 'Groom (Boy)'}
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {language === 'ta' ? 'நட்சத்திரம்' : 'Nakshatra'}
              </label>
              <select
                value={boyNakIndex}
                onChange={e => setBoyNakIndex(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {nakshatrasData.map(n => (
                  <option key={n.index} value={n.index}>
                    {n.index + 1}. {language === 'ta' ? n.nameTamil : n.nameEnglish} ({n.lordTamil})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {language === 'ta' ? 'ராசி' : 'Rasi (Moon Sign)'}
              </label>
              <select
                value={boyRasiIndex}
                onChange={e => setBoyRasiIndex(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {rashisData.map(r => (
                  <option key={r.index} value={r.index}>
                    {r.index + 1}. {language === 'ta' ? r.nameTamil : r.nameEnglish} ({r.lordTamil})
                  </option>
                ))}
              </select>
            </div>

            {/* Chevvai Dosham Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-sky-900/30">
              <span className="text-xs text-slate-300">
                {language === 'ta' ? 'செவ்வாய் தோஷம் உள்ளதா?' : 'Has Chevvai / Mars Dosham?'}
              </span>
              <input
                type="checkbox"
                checked={boyChevvai}
                onChange={e => setBoyChevvai(e.target.checked)}
                className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 h-4 w-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Bride (Girl) */}
          <div className="space-y-3 p-4 rounded-xl border border-rose-900/40 bg-rose-950/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-rose-400">
                {language === 'ta' ? 'மணமகள் விவரம்' : 'Bride (Girl)'}
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {language === 'ta' ? 'நட்சத்திரம்' : 'Nakshatra'}
              </label>
              <select
                value={girlNakIndex}
                onChange={e => setGirlNakIndex(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              >
                {nakshatrasData.map(n => (
                  <option key={n.index} value={n.index}>
                    {n.index + 1}. {language === 'ta' ? n.nameTamil : n.nameEnglish} ({n.lordTamil})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {language === 'ta' ? 'ராசி' : 'Rasi (Moon Sign)'}
              </label>
              <select
                value={girlRasiIndex}
                onChange={e => setGirlRasiIndex(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              >
                {rashisData.map(r => (
                  <option key={r.index} value={r.index}>
                    {r.index + 1}. {language === 'ta' ? r.nameTamil : r.nameEnglish} ({r.lordTamil})
                  </option>
                ))}
              </select>
            </div>

            {/* Chevvai Dosham Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-rose-900/30">
              <span className="text-xs text-slate-300">
                {language === 'ta' ? 'செவ்வாய் தோஷம் உள்ளதா?' : 'Has Chevvai / Mars Dosham?'}
              </span>
              <input
                type="checkbox"
                checked={girlChevvai}
                onChange={e => setGirlChevvai(e.target.checked)}
                className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 h-4 w-4 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Score and Verdict Header */}
      <div
        className={`rounded-2xl border p-6 shadow-xl ${
          result.isRajjuGood && result.totalScore >= 7
            ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950'
            : result.isRajjuGood && result.totalScore >= 5
            ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950'
            : 'border-rose-500/50 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-xs uppercase tracking-widest text-slate-300 font-semibold">
                {language === 'ta' ? 'பொருத்த முடிவு' : 'Matching Verdict'}
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-white mt-1 font-tamil">
              {language === 'ta' ? result.favorableRecommendation : result.favorableRecommendation}
            </h3>

            <p className="text-sm text-slate-300 mt-1 max-w-2xl font-tamil">
              {language === 'ta' ? result.overallVerdictTamil : result.overallVerdictEnglish}
            </p>

            {/* Rajju Callout */}
            <div className="mt-3 flex items-center gap-2">
              {result.isRajjuGood ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle className="w-4 h-4" />
                  <span>{language === 'ta' ? 'ரஜ்ஜு தட்டவில்லை (சுபம்)' : 'Rajju Match OK'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{language === 'ta' ? 'எச்சரிக்கை: ரஜ்ஜு தட்டுகிறது' : 'Warning: Rajju Thattu'}</span>
                </span>
              )}

              {/* Chevvai Dosham Callout */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isChevvaiMatch
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                <span>
                  {isChevvaiMatch
                    ? language === 'ta'
                      ? 'செவ்வாய் தோஷம்: சமநிலை'
                      : 'Chevvai Dosham: Balanced'
                    : language === 'ta'
                    ? 'செவ்வாய் தோஷம்: முரண்பாடு'
                    : 'Chevvai Dosham: Mismatch'}
                </span>
              </span>
            </div>
          </div>

          {/* Big Score Dial */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/80 border border-slate-800 min-w-[140px] text-center">
            <div className="text-3xl font-extrabold text-amber-400 font-mono">
              {result.totalScore} <span className="text-base text-slate-500">/ 10</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {language === 'ta' ? 'பொருத்த புள்ளிகள்' : 'Total Score'} ({result.scorePercentage}%)
            </div>
          </div>
        </div>
      </div>

      {/* 10 Poruthams Detailed Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <table className="w-full text-left text-sm border-collapse font-sans">
          <thead className="bg-slate-950/80 text-xs text-amber-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">{language === 'ta' ? 'பொருத்தம்' : 'Porutham'}</th>
              <th className="py-3 px-3">{language === 'ta' ? 'மணமகன்' : 'Boy'}</th>
              <th className="py-3 px-3">{language === 'ta' ? 'மணமகள்' : 'Girl'}</th>
              <th className="py-3 px-3 text-center">{language === 'ta' ? 'மதிப்பீடு' : 'Status'}</th>
              <th className="py-3 px-3 text-center">{language === 'ta' ? 'புள்ளி' : 'Score'}</th>
              <th className="py-3 px-4">{language === 'ta' ? 'விளக்கம்' : 'Significance'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {result.poruthams.map(p => {
              const isRajju = p.id === 'rajju';
              return (
                <tr
                  key={p.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isRajju && !result.isRajjuGood ? 'bg-rose-950/30' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-slate-100 font-tamil">
                    {language === 'ta' ? p.nameTamil : p.nameEnglish}
                    {isRajju && (
                      <span className="block text-[11px] text-amber-400/80">
                        {language === 'ta' ? '(முக்கியமானது)' : '(Crucial)'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-300">{p.boyAttribute}</td>
                  <td className="py-3 px-3 text-xs text-slate-300">{p.girlAttribute}</td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        p.statusTamil === 'உத்தமம்'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : p.statusTamil === 'மத்திமம்'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {language === 'ta' ? p.statusTamil : p.statusEnglish}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-300">
                    {p.score} / {p.maxScore}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 font-tamil max-w-xs">
                    {language === 'ta' ? p.descriptionTamil : p.descriptionEnglish}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Chevvai Dosham Classical Rules Info Box */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <Info className="w-4 h-4" />
          <span>{language === 'ta' ? 'செவ்வாய் தோஷ பாரம்பரிய விதிவிலக்குகள் (குமாரசுவாமியம் & ஜாதக அலங்காரம்):' : 'Chevvai Dosham Traditional Exemptions (Classical Tamil texts):'}</span>
        </div>
        <p className="font-tamil">
          {language === 'ta'
            ? 'செவ்வாய் 1, 2, 4, 7, 8, 12 ஆகிய இடங்களில் இருந்தாலும்: மேஷம், விருச்சிகத்தில் ஆட்சி பெற்றாலோ, மகரத்தில் உச்சம் பெற்றாலோ, குரு அல்லது சந்திரனுடன் கூடினாலோ (குரு மங்கள, சந்திர மங்கள யோகம்), மிதுனம்/கன்னியில் 2-ல், கடகம்/மகரத்தில் 7-ல், தனுசு/மீனத்தில் 8-ல் இருந்தாலும் தோஷ நிவர்த்தி ஆகிறது.'
            : 'Mars residing in 1, 2, 4, 7, 8, 12 is exempted if: Mars is in own signs (Aries/Scorpio), exalted in Capricorn, conjunct Jupiter (Guru Mangala Yoga) or Moon, in 2nd for Gemini/Virgo, 7th for Cancer/Capricorn, 8th for Sag/Pisces.'}
        </p>
      </div>
    </div>
  );
};
