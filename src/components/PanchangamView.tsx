/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { generateDailyPanchangam } from '../engine/astro.ts';
import { CityData, LanguageType } from '../engine/types.ts';
import citiesData from '../engine/data/cities.json';
import { Calendar, Sun, Moon, Compass, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface PanchangamViewProps {
  language: LanguageType;
}

export const PanchangamView: React.FC<PanchangamViewProps> = ({ language }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedCityName, setSelectedCityName] = useState<string>('Chennai');

  const city = citiesData.find((c: CityData) => c.name === selectedCityName) || citiesData[0];
  const panchangam = generateDailyPanchangam(selectedDate, city.name, city.latitude, city.longitude, city.timezone);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-100">
            {language === 'ta' ? 'தினசரி பஞ்சாங்கம்' : 'Daily Panchangam'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              {language === 'ta' ? 'தேதி' : 'Date'}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* City Selector */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              {language === 'ta' ? 'ஊர் / நகரம்' : 'City / Location'}
            </label>
            <select
              value={selectedCityName}
              onChange={e => setSelectedCityName(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {citiesData.map((c: CityData) => (
                <option key={c.name} value={c.name}>
                  {language === 'ta' ? `${c.nameTamil} (${c.name})` : `${c.name}, ${c.state || c.country}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hero Tamil Calendar Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mb-2">
              <span>{panchangam.tamilYear} {language === 'ta' ? 'வருடம்' : 'Year'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-tamil">
              {panchangam.tamilMonth} {panchangam.tamilDate} · {panchangam.vaaramTamil}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {new Date(selectedDate).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              · {city.name}, {city.country}
            </p>
          </div>

          {/* Sun Times badge */}
          <div className="flex items-center gap-4 bg-slate-950/70 border border-amber-900/40 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{language === 'ta' ? 'சூரியோதயம்' : 'Sunrise'}</div>
                <div className="text-sm font-bold text-amber-200 font-mono">{panchangam.sunrise}</div>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{language === 'ta' ? 'சூரியாஸ்தமனம்' : 'Sunset'}</div>
                <div className="text-sm font-bold text-indigo-200 font-mono">{panchangam.sunset}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Angams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Tithi */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'ta' ? '1. திதி' : '1. Tithi'}
          </div>
          <div className="text-lg font-bold text-amber-300 mt-1 font-tamil">
            {language === 'ta' ? panchangam.tithi.nameTamil : panchangam.tithi.nameEnglish}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {panchangam.tithi.paksha === 'Sukla' ? (language === 'ta' ? 'சுக்ல பக்ஷம் (வளர்பிறை)' : 'Shukla Paksha (Waxing)') : (language === 'ta' ? 'கிருஷ்ண பக்ஷம் (தேய்பிறை)' : 'Krishna Paksha (Waning)')}
          </div>
          {/* Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>{language === 'ta' ? 'முடிவு சதவீதம்' : 'Progress'}</span>
              <span>{panchangam.tithi.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${panchangam.tithi.progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* 2. Vaaram */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'ta' ? '2. வாரம்' : '2. Vaaram'}
          </div>
          <div className="text-lg font-bold text-amber-300 mt-1 font-tamil">
            {panchangam.vaaramTamil}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {panchangam.vaaramEnglish}
          </div>
        </div>

        {/* 3. Nakshatra */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'ta' ? '3. நட்சத்திரம்' : '3. Nakshatra'}
          </div>
          <div className="text-lg font-bold text-amber-300 mt-1 font-tamil">
            {language === 'ta' ? panchangam.nakshatra.nameTamil : panchangam.nakshatra.nameEnglish}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {language === 'ta' ? `பாதம்: ${panchangam.nakshatra.pada}` : `Pada: ${panchangam.nakshatra.pada}`}
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>{language === 'ta' ? 'முடிவு சதவீதம்' : 'Progress'}</span>
              <span>{panchangam.nakshatra.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${panchangam.nakshatra.progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* 4. Yogam */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'ta' ? '4. யோகம்' : '4. Yogam'}
          </div>
          <div className="text-lg font-bold text-amber-300 mt-1 font-tamil">
            {language === 'ta' ? panchangam.yoga.nameTamil : panchangam.yoga.nameEnglish}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            #{panchangam.yoga.number} {language === 'ta' ? 'யோகம்' : 'Yoga'}
          </div>
        </div>

        {/* 5. Karanam */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'ta' ? '5. கரணம்' : '5. Karanam'}
          </div>
          <div className="text-lg font-bold text-amber-300 mt-1 font-tamil">
            {language === 'ta' ? panchangam.karana.nameTamil : panchangam.karana.nameEnglish}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            #{panchangam.karana.number} {language === 'ta' ? 'கரணம்' : 'Karana'}
          </div>
        </div>
      </div>

      {/* Kaala timings: Auspicious & Inauspicious times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Auspicious Timings */}
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5 space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{language === 'ta' ? 'சுப நேரங்கள்' : 'Auspicious Times (Nalla Neram)'}</span>
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-emerald-900/30">
              <span className="text-slate-300">{language === 'ta' ? 'நல்ல நேரம் (காலை):' : 'Nalla Neram (Morning):'}</span>
              <span className="font-mono font-semibold text-emerald-300">{panchangam.kaalam.nallaNeramMorning}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-emerald-900/30">
              <span className="text-slate-300">{language === 'ta' ? 'நல்ல நேரம் (மாலை):' : 'Nalla Neram (Evening):'}</span>
              <span className="font-mono font-semibold text-emerald-300">{panchangam.kaalam.nallaNeramEvening}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-300">{language === 'ta' ? 'குளிகை காலம்:' : 'Kuligai Kaalam:'}</span>
              <span className="font-mono font-semibold text-emerald-300">{panchangam.kaalam.kuligai}</span>
            </div>
          </div>
        </div>

        {/* Inauspicious Timings */}
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-5 space-y-3">
          <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>{language === 'ta' ? 'அசுப நேரங்கள்' : 'Inauspicious Times (Rahu / Yama)'}</span>
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-rose-900/30">
              <span className="text-slate-300">{language === 'ta' ? 'ராகு காலம்:' : 'Rahu Kalam:'}</span>
              <span className="font-mono font-semibold text-rose-300">{panchangam.kaalam.rahuKalam}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-rose-900/30">
              <span className="text-slate-300">{language === 'ta' ? 'எமகண்டம்:' : 'Yama Gandam:'}</span>
              <span className="font-mono font-semibold text-rose-300">{panchangam.kaalam.yamaGandam}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-300">{language === 'ta' ? 'துர்முஹூர்த்தம்:' : 'Durmuhurtham:'}</span>
              <span className="font-mono font-semibold text-rose-300">{panchangam.kaalam.durmuhurtham}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
