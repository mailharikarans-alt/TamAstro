/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AyanamsaType = 'lahiri' | 'kp' | 'raman';

export type ChartLayoutType = 'south-indian' | 'north-indian';

export type LanguageType = 'ta' | 'en';

export interface PlanetInfo {
  id: string;
  nameTamil: string;
  nameEnglish: string;
  symbol: string;
  longitude: number; // 0 to 360 degrees sidereal
  speed: number;
  rasiIndex: number; // 0 (Mesham) to 11 (Meenam)
  rasiNameTamil: string;
  rasiNameEnglish: string;
  degreeInRasi: number; // 0 to 30
  nakshatraIndex: number; // 0 to 26
  nakshatraNameTamil: string;
  nakshatraNameEnglish: string;
  pada: number; // 1 to 4
  nakshatraLord: string;
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: 'exalted' | 'moolatrikona' | 'own' | 'friend' | 'neutral' | 'enemy' | 'debilitated';
}

export interface LagnaInfo {
  longitude: number;
  rasiIndex: number;
  rasiNameTamil: string;
  rasiNameEnglish: string;
  degreeInRasi: number;
  nakshatraIndex: number;
  nakshatraNameTamil: string;
  nakshatraNameEnglish: string;
  pada: number;
  nakshatraLord: string;
}

export interface NavamsaPosition {
  id: string;
  nameTamil: string;
  nameEnglish: string;
  rasiIndex: number;
  rasiNameTamil: string;
  rasiNameEnglish: string;
  pada: number;
}

export interface DasaSubPeriod {
  lord: string;
  lordTamil: string;
  lordEnglish: string;
  startDate: string;
  endDate: string;
  startAgeYears: number;
  endAgeYears: number;
  antaras?: {
    lord: string;
    lordTamil: string;
    lordEnglish: string;
    startDate: string;
    endDate: string;
  }[];
}

export interface DasaPeriod {
  lord: string;
  lordTamil: string;
  lordEnglish: string;
  years: number;
  startDate: string;
  endDate: string;
  startAgeYears: number;
  endAgeYears: number;
  bhuktis: DasaSubPeriod[];
  isCurrent?: boolean;
}

export interface BirthChartData {
  input: {
    name: string;
    gender: 'male' | 'female' | 'other';
    date: string; // YYYY-MM-DD
    time: string; // HH:MM:SS
    place: string;
    latitude: number;
    longitude: number;
    timezone: number; // offset in hours, e.g. 5.5 for IST
    ayanamsa: AyanamsaType;
  };
  ayanamsaValue: number;
  julianDay: number;
  lagna: LagnaInfo;
  planets: PlanetInfo[];
  navamsa: NavamsaPosition[];
  houses: {
    houseNumber: number;
    rasiIndex: number;
    planets: PlanetInfo[];
  }[];
  panchangaAtBirth: {
    tithiNameTamil: string;
    tithiNameEnglish: string;
    tithiPaksha: 'Sukla' | 'Krishna';
    tithiNumber: number;
    nakshatraNameTamil: string;
    nakshatraNameEnglish: string;
    pada: number;
    yogaNameTamil: string;
    yogaNameEnglish: string;
    karanaNameTamil: string;
    karanaNameEnglish: string;
    vaaramTamil: string;
    vaaramEnglish: string;
    tamilMonth: string;
    tamilDate: number;
    tamilYear: string;
  };
  dasaBalance: {
    lordTamil: string;
    lordEnglish: string;
    balanceYears: number;
    balanceMonths: number;
    balanceDays: number;
    totalBalanceYears: number;
  };
  dasaTimeline: DasaPeriod[];
}

export interface DailyPanchangamData {
  date: string;
  location: string;
  latitude: number;
  longitude: number;
  tamilYear: string;
  tamilMonth: string;
  tamilDate: number;
  vaaramTamil: string;
  vaaramEnglish: string;
  sunrise: string;
  sunset: string;
  tithi: {
    number: number;
    nameTamil: string;
    nameEnglish: string;
    paksha: 'Sukla' | 'Krishna';
    progressPercent: number;
  };
  nakshatra: {
    number: number;
    nameTamil: string;
    nameEnglish: string;
    pada: number;
    progressPercent: number;
  };
  yoga: {
    number: number;
    nameTamil: string;
    nameEnglish: string;
  };
  karana: {
    number: number;
    nameTamil: string;
    nameEnglish: string;
  };
  kaalam: {
    rahuKalam: string;
    yamaGandam: string;
    kuligai: string;
    nallaNeramMorning: string;
    nallaNeramEvening: string;
    durmuhurtham: string;
  };
  moonPhasePercent: number;
  isAmavasya: boolean;
  isPournami: boolean;
}

export interface SinglePorutham {
  id: string;
  nameTamil: string;
  nameEnglish: string;
  isCompatible: boolean;
  score: number; // typically 0 or 1, or 0 / 0.5 / 1
  maxScore: number;
  statusTamil: 'உத்தமம்' | 'மத்திமம்' | 'பொருந்தாது';
  statusEnglish: 'Excellent' | 'Moderate' | 'Incompatible';
  boyAttribute: string;
  girlAttribute: string;
  descriptionTamil: string;
  descriptionEnglish: string;
}

export interface PoruthamResult {
  boy: {
    nakshatraNameTamil: string;
    nakshatraNameEnglish: string;
    pada: number;
    rasiNameTamil: string;
    rasiNameEnglish: string;
  };
  girl: {
    nakshatraNameTamil: string;
    nakshatraNameEnglish: string;
    pada: number;
    rasiNameTamil: string;
    rasiNameEnglish: string;
  };
  poruthams: SinglePorutham[];
  totalScore: number;
  maxScore: number;
  scorePercentage: number;
  isRajjuGood: boolean;
  isDinamGood: boolean;
  isGanamGood: boolean;
  chevvaiDosham: {
    boyHasDosham: boolean;
    girlHasDosham: boolean;
    isCompatible: boolean;
    explanationTamil: string;
    explanationEnglish: string;
  };
  overallVerdictTamil: string;
  overallVerdictEnglish: string;
  favorableRecommendation: 'உத்தம பொருத்தம் (Highly Recommended)' | 'மத்திம பொருத்தம் (Average / Acceptable)' | 'பொருத்தம் இல்லை (Not Recommended)';
}

export interface CityData {
  name: string;
  nameTamil: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // offset in hours, e.g. 5.5
  ianaTimezone: string;
}

export interface UserProfile {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  date: string;
  time: string;
  place: string;
  latitude: number;
  longitude: number;
  timezone: number;
  ayanamsa: AyanamsaType;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
