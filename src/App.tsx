/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AyanamsaType,
  BirthChartData,
  ChartLayoutType,
  CityData,
  LanguageType,
  UserProfile,
} from './engine/types.ts';
import { generateBirthChart } from './engine/astro.ts';
import citiesData from './engine/data/cities.json';

import { SouthIndianChart } from './components/SouthIndianChart.tsx';
import { NorthIndianChart } from './components/NorthIndianChart.tsx';
import { PlanetaryTable } from './components/PlanetaryTable.tsx';
import { DasaTimelineView } from './components/DasaTimelineView.tsx';
import { PanchangamView } from './components/PanchangamView.tsx';
import { PoruthamView } from './components/PoruthamView.tsx';
import { ProfilesView } from './components/ProfilesView.tsx';
import { EngineVerificationView } from './components/EngineVerificationView.tsx';

import {
  Printer,
  Globe,
  Compass,
  BookmarkPlus,
  RefreshCw,
  Sparkles,
  Layers,
  Heart,
  Calendar,
  UserCheck,
  ShieldCheck,
  Info,
} from 'lucide-react';

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'demo-chennai',
    name: 'செல்வன் கார்த்திக் (Demo Profile)',
    gender: 'male',
    date: '1995-10-24',
    time: '10:30:00',
    place: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 5.5,
    ayanamsa: 'lahiri',
    notes: 'துலாம் ராசி, சுவாதி நட்சத்திரம், தனுசு லக்னம்',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'demo-madurai',
    name: 'செல்வி கவிதா (Demo Profile)',
    gender: 'female',
    date: '1998-05-18',
    time: '07:15:00',
    place: 'Madurai',
    latitude: 9.9252,
    longitude: 78.1198,
    timezone: 5.5,
    ayanamsa: 'lahiri',
    notes: 'கும்ப ராசி, சதய நட்சத்திரம், ரிஷப லக்னம்',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export default function App() {
  const [language, setLanguage] = useState<LanguageType>('ta');
  const [activeTab, setActiveTab] = useState<'jathagam' | 'panchangam' | 'porutham' | 'profiles' | 'verification'>('jathagam');

  // Birth Details Input State
  const [name, setName] = useState('செல்வன் கார்த்திக்');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [date, setDate] = useState('1995-10-24');
  const [time, setTime] = useState('10:30:00');
  const [selectedCityName, setSelectedCityName] = useState('Chennai');
  const [latitude, setLatitude] = useState(13.0827);
  const [longitude, setLongitude] = useState(80.2707);
  const [timezone, setTimezone] = useState(5.5);
  const [manualCoords, setManualCoords] = useState(false);
  const [ayanamsa, setAyanamsa] = useState<AyanamsaType>('lahiri');

  // Chart presentation states
  const [chartLayout, setChartLayout] = useState<ChartLayoutType>('south-indian');
  const [activeSubChart, setActiveSubChart] = useState<'rasi' | 'navamsa' | 'both'>('both');

  // Profiles State with localStorage persistence
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem('jothidam_saved_profiles');
      return stored ? JSON.parse(stored) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('jothidam_saved_profiles', JSON.stringify(profiles));
    } catch (e) {
      console.error('Could not save to localStorage', e);
    }
  }, [profiles]);

  // Handle City Change
  const handleCitySelect = (cityName: string) => {
    setSelectedCityName(cityName);
    const found = citiesData.find((c: CityData) => c.name === cityName);
    if (found) {
      setLatitude(found.latitude);
      setLongitude(found.longitude);
      setTimezone(found.timezone);
    }
  };

  // Compute Birth Chart Data
  const chartData: BirthChartData = React.useMemo(() => {
    return generateBirthChart({
      name,
      gender,
      date,
      time,
      place: selectedCityName,
      latitude,
      longitude,
      timezone,
      ayanamsa,
    });
  }, [name, gender, date, time, selectedCityName, latitude, longitude, timezone, ayanamsa]);

  // Load a profile
  const handleSelectProfile = (p: UserProfile) => {
    setName(p.name);
    setGender(p.gender);
    setDate(p.date);
    setTime(p.time);
    setSelectedCityName(p.place);
    setLatitude(p.latitude);
    setLongitude(p.longitude);
    setTimezone(p.timezone);
    setAyanamsa(p.ayanamsa);
    setActiveTab('jathagam');
  };

  // Save current details as a profile
  const handleSaveCurrentAsProfile = () => {
    const newProfile: UserProfile = {
      id: 'profile-' + Date.now(),
      name,
      gender,
      date,
      time,
      place: selectedCityName,
      latitude,
      longitude,
      timezone,
      ayanamsa,
      notes: `${chartData.lagna.rasiNameTamil} லக்னம், ${chartData.panchangaAtBirth.nakshatraNameTamil} நட்சத்திரம்`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProfiles(prev => [newProfile, ...prev.filter(p => p.name !== name)]);
    alert(language === 'ta' ? 'ஜாதக சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது!' : 'Profile saved successfully!');
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const moonPlanet = chartData.planets.find(p => p.id === 'moon') ?? chartData.planets[0];
  const sunPlanet = chartData.planets.find(p => p.id === 'sun') ?? chartData.planets[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract: 3 zones (Brand wordmark - Clean nav text links - Actions) */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-amber-400 font-cinzel">
              {language === 'ta' ? 'ஜோதிடம்' : 'Jothidam'}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline font-tamil">
              {language === 'ta' ? 'தமிழ் வேத ஜோதிடம்' : 'Tamil Vedic Astrology'}
            </span>
          </div>

          {/* Zone 2: 4-5 Clean nav links */}
          <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('jathagam')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'jathagam'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ta' ? 'ஜாதகம்' : 'Jathagam'}
            </button>

            <button
              onClick={() => setActiveTab('panchangam')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'panchangam'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ta' ? 'பஞ்சாங்கம்' : 'Panchangam'}
            </button>

            <button
              onClick={() => setActiveTab('porutham')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'porutham'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ta' ? 'பொருத்தம்' : 'Porutham'}
            </button>

            <button
              onClick={() => setActiveTab('profiles')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'profiles'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ta' ? 'சுயவிவரங்கள்' : 'Profiles'} ({profiles.length})
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap hidden md:inline-flex items-center gap-1 ${
                activeTab === 'verification'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ta' ? 'துல்லிய சோதனை' : 'Engine Tests'}</span>
            </button>
          </nav>

          {/* Zone 3: Actions (Language toggle and Print/PDF export) */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(l => (l === 'ta' ? 'en' : 'ta'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ta' ? 'English' : 'தமிழ்'}</span>
            </button>

            {/* Print / PDF Export */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'ta' ? 'PDF / அச்சிடு' : 'PDF / Print'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* TAB 1: JATHAGAM (BIRTH CHART) */}
        {activeTab === 'jathagam' && (
          <div className="space-y-6">
            {/* Input Form Card (Hidden in Print) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl no-print">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-bold text-slate-100">
                    {language === 'ta' ? 'பிறப்பு விவரங்கள் (Birth Data Input)' : 'Birth Details Input'}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCurrentAsProfile}
                    className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{language === 'ta' ? 'சுயவிவரமாக சேமி' : 'Save Profile'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* Name */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">
                    {language === 'ta' ? 'பெயர்' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {language === 'ta' ? 'பாலினம்' : 'Gender'}
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'male' | 'female' | 'other')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="male">{language === 'ta' ? 'ஆண்' : 'Male'}</option>
                    <option value="female">{language === 'ta' ? 'பெண்' : 'Female'}</option>
                    <option value="other">{language === 'ta' ? 'மற்றவை' : 'Other'}</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {language === 'ta' ? 'பிறந்த தேதி' : 'Birth Date'}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {language === 'ta' ? 'பிறந்த நேரம்' : 'Birth Time'}
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                {/* Place / City */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {language === 'ta' ? 'பிறந்த ஊர்' : 'Birth Place'}
                  </label>
                  <select
                    value={selectedCityName}
                    onChange={e => handleCitySelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {citiesData.map((c: CityData) => (
                      <option key={c.name} value={c.name}>
                        {language === 'ta' ? c.nameTamil : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ayanamsa Selector */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">
                    {language === 'ta' ? 'அயனாம்சம் (Ayanamsa)' : 'Ayanamsa'}
                  </label>
                  <select
                    value={ayanamsa}
                    onChange={e => setAyanamsa(e.target.value as AyanamsaType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="lahiri">சித்ரபக்ஷ லஹிரி (Lahiri Standard - Default)</option>
                    <option value="kp">கே.பி. அயனாம்சம் (Krishnamurti Paddhati - KP)</option>
                    <option value="raman">பி.வி. ராமன் (B.V. Raman Ayanamsa)</option>
                  </select>
                </div>

                {/* Manual Coords Toggle */}
                <div className="col-span-1 sm:col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={() => setManualCoords(!manualCoords)}
                    className="text-xs text-slate-400 hover:text-slate-200 underline pb-2 cursor-pointer"
                  >
                    {manualCoords
                      ? language === 'ta' ? 'ஊர் பட்டியலைப் பயன்படுத்து' : 'Use standard city'
                      : language === 'ta' ? 'அட்ச/தீர்க்கரேகை மாற்றுக' : 'Manual Lat/Long override'}
                  </button>
                </div>
              </div>

              {/* Manual Lat/Long Input if enabled */}
              {manualCoords && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800/80">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">அட்சரேகை (Latitude °N)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={e => setLatitude(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">தீர்க்கரேகை (Longitude °E)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={e => setLongitude(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">நேர மண்டலம் (Timezone Hours e.g. 5.5)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={timezone}
                      onChange={e => setTimezone(parseFloat(e.target.value) || 5.5)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Birth Horoscope Header Banner (Visible in UI and Print) */}
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest font-mono">
                    {language === 'ta' ? 'ஜாதக அலங்காரம்' : 'Birth Horoscope'} · {chartData.input.name}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-tamil">
                    {chartData.lagna.rasiNameTamil} லக்னம் · {chartData.panchangaAtBirth.nakshatraNameTamil} நட்சத்திரம் {chartData.panchangaAtBirth.pada}-ம் பாதம்
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {chartData.panchangaAtBirth.tamilYear} வருடம், {chartData.panchangaAtBirth.tamilMonth} மாதம் {chartData.panchangaAtBirth.tamilDate}-ம் நாள் ({chartData.panchangaAtBirth.vaaramTamil}) · {chartData.input.date} {chartData.input.time} ({selectedCityName})
                  </p>
                </div>

                {/* Quick Info Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400">{language === 'ta' ? 'ராசி (சந்திரன்)' : 'Moon Sign'}</div>
                    <div className="font-bold text-amber-300 font-tamil">{moonPlanet.rasiNameTamil}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400">{language === 'ta' ? 'திதி' : 'Tithi'}</div>
                    <div className="font-bold text-amber-300 font-tamil">{chartData.panchangaAtBirth.tithiNameTamil}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400">{language === 'ta' ? 'யோகம்' : 'Yoga'}</div>
                    <div className="font-bold text-amber-300 font-tamil">{chartData.panchangaAtBirth.yogaNameTamil}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400">{language === 'ta' ? 'கரணம்' : 'Karana'}</div>
                    <div className="font-bold text-amber-300 font-tamil">{chartData.panchangaAtBirth.karanaNameTamil}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Controls Bar (No Print) */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/60 no-print">
              {/* Style selector: South Indian / North Indian */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setChartLayout('south-indian')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    chartLayout === 'south-indian'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'ta' ? 'தென்னிந்திய முறை (Tamil)' : 'South Indian Grid'}
                </button>
                <button
                  type="button"
                  onClick={() => setChartLayout('north-indian')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    chartLayout === 'north-indian'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'ta' ? 'வட இந்திய முறை (Diamond)' : 'North Indian Diamond'}
                </button>
              </div>

              {/* Sub-chart toggle: Rasi, Navamsa, Both */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveSubChart('rasi')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    activeSubChart === 'rasi' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'ta' ? 'ராசி மட்டும்' : 'Rasi Only'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubChart('navamsa')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    activeSubChart === 'navamsa' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'ta' ? 'நவாம்சம் மட்டும்' : 'Navamsa Only'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubChart('both')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    activeSubChart === 'both' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'ta' ? 'இரண்டும் (Rasi + Navamsa)' : 'Both (Rasi + D9)'}
                </button>
              </div>
            </div>

            {/* CHARTS CONTAINER (South Indian or North Indian) */}
            <div className={`grid gap-6 ${activeSubChart === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Rasi Chart */}
              {(activeSubChart === 'rasi' || activeSubChart === 'both') && (
                chartLayout === 'south-indian' ? (
                  <SouthIndianChart
                    titleTamil="ராசி சக்கரம்"
                    titleEnglish="Rasi Chart (D1)"
                    lagna={chartData.lagna}
                    planets={chartData.planets}
                    language={language}
                    subTitle={`${name} · ${chartData.input.date}`}
                  />
                ) : (
                  <NorthIndianChart
                    titleTamil="ராசி சக்கரம்"
                    titleEnglish="Rasi Chart (D1)"
                    lagna={chartData.lagna}
                    planets={chartData.planets}
                    language={language}
                  />
                )
              )}

              {/* Navamsa Chart */}
              {(activeSubChart === 'navamsa' || activeSubChart === 'both') && (
                chartLayout === 'south-indian' ? (
                  <SouthIndianChart
                    titleTamil="நவாம்ச சக்கரம்"
                    titleEnglish="Navamsa Chart (D9)"
                    lagna={chartData.navamsa.find(n => n.id === 'lagna') ?? chartData.navamsa[0]}
                    planets={chartData.navamsa.filter(n => n.id !== 'lagna')}
                    language={language}
                    subTitle="நவாம்சம் (D-9 சக்கரம்)"
                  />
                ) : (
                  <NorthIndianChart
                    titleTamil="நவாம்ச சக்கரம்"
                    titleEnglish="Navamsa Chart (D9)"
                    lagna={chartData.navamsa.find(n => n.id === 'lagna') ?? chartData.navamsa[0]}
                    planets={chartData.navamsa.filter(n => n.id !== 'lagna')}
                    language={language}
                  />
                )
              )}
            </div>

            {/* Planetary Positions Table */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{language === 'ta' ? 'கிரக நிலைகள் மற்றும் அம்சங்கள்' : 'Planetary Positions & Dignity'}</span>
              </h3>
              <PlanetaryTable
                lagna={chartData.lagna}
                planets={chartData.planets}
                language={language}
              />
            </div>

            {/* Vimshottari Dasa / Bhukti Timeline */}
            <DasaTimelineView
              timeline={chartData.dasaTimeline}
              dasaBalance={chartData.dasaBalance}
              language={language}
            />

            {/* Cultural Disclaimer (Non-negotiable requirement) */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs text-slate-400 font-tamil leading-relaxed">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                <Info className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'அறிவிப்பு / Disclaimer:' : 'Cultural Disclaimer:'}</span>
              </div>
              <p>
                {language === 'ta'
                  ? 'கலாச்சார மற்றும் தகவல் நோக்கங்களுக்காக மட்டுமே. ஜோதிடம் ஒரு பாரம்பரிய வழிகாட்டுதலாகும்; தனிநபர் மற்றும் மருத்துவ, நிதி அல்லது சட்டபூர்வ முடிவுகளுக்கு தகுதியான நிபுணர்களை அணுகவும்.'
                  : 'For cultural and informational purposes only. Astrology is a traditional heritage guidance system and not a substitute for professional legal, medical, or financial advice.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY PANCHANGAM */}
        {activeTab === 'panchangam' && (
          <PanchangamView language={language} />
        )}

        {/* TAB 3: MARRIAGE MATCHING (PORUTHAM) */}
        {activeTab === 'porutham' && (
          <PoruthamView language={language} savedProfiles={profiles} />
        )}

        {/* TAB 4: SAVED PROFILES */}
        {activeTab === 'profiles' && (
          <ProfilesView
            profiles={profiles}
            onSelectProfile={handleSelectProfile}
            onDeleteProfile={handleDeleteProfile}
            onSaveProfile={p => setProfiles(prev => [p, ...prev])}
            language={language}
          />
        )}

        {/* TAB 5: ENGINE VERIFICATION */}
        {activeTab === 'verification' && (
          <EngineVerificationView language={language} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500 font-tamil no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ஜோதிடம் (Jothidam) · தமிழ் வேத ஜோதிட மென்பொருள் · 100% Offline Capable</span>
          <span className="text-[11px] text-slate-400">சித்ரபக்ஷ லஹிரி அயனாம்சம் · பாம்பு பஞ்சாங்க மரபு</span>
        </div>
      </footer>
    </div>
  );
}
