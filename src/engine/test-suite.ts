/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Jothidam Engine Verification Suite
 * 5 benchmark reference charts with ground-truth expected astrological positions
 */

import { generateBirthChart } from './astro.ts';

export interface ReferenceChartTest {
  id: string;
  name: string;
  description: string;
  input: {
    name: string;
    gender: 'male' | 'female' | 'other';
    date: string;
    time: string;
    place: string;
    latitude: number;
    longitude: number;
    timezone: number;
    ayanamsa: 'lahiri' | 'kp' | 'raman';
  };
  expected: {
    lagnaRasiIndex: number;
    lagnaRasiName: string;
    sunRasiIndex: number;
    sunRasiName: string;
    moonRasiIndex: number;
    moonRasiName: string;
    moonNakshatraIndex: number;
    moonNakshatraName: string;
    marsRasiIndex?: number;
    jupiterRasiIndex?: number;
    saturnRasiIndex?: number;
  };
}

export const REFERENCE_CHARTS: ReferenceChartTest[] = [
  {
    id: 'vivekananda',
    name: 'Swami Vivekananda',
    description: 'Born Jan 12, 1863, Kolkata. Classic reference for Dhanus Lagna with Sun in Dhanus and Moon in Kanni (Hasta nakshatra).',
    input: {
      name: 'Swami Vivekananda',
      gender: 'male',
      date: '1863-01-12',
      time: '06:33:00',
      place: 'Kolkata',
      latitude: 22.5726,
      longitude: 88.3639,
      timezone: 5.89, // LMT offset for Kolkata (5h 53m)
      ayanamsa: 'lahiri',
    },
    expected: {
      lagnaRasiIndex: 8, // Sagittarius (Dhanusu)
      lagnaRasiName: 'தனுசு (Sagittarius)',
      sunRasiIndex: 8, // Sagittarius
      sunRasiName: 'தனுசு (Sagittarius)',
      moonRasiIndex: 5, // Virgo (Kanni)
      moonRasiName: 'கன்னி (Virgo)',
      moonNakshatraIndex: 12, // Hasta (அஸ்தம்)
      moonNakshatraName: 'அஸ்தம் (Hasta)',
      marsRasiIndex: 0, // Aries (Mesham)
      saturnRasiIndex: 5, // Virgo (Kanni)
    },
  },
  {
    id: 'raman',
    name: 'Dr. B. V. Raman',
    description: 'Born Aug 8, 1912, Bengaluru. Renowned astrologer with Kumbha Lagna and Taurus Moon (Mrigashira 1 / Rohini border).',
    input: {
      name: 'Dr. B. V. Raman',
      gender: 'male',
      date: '1912-08-08',
      time: '19:38:00',
      place: 'Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
      timezone: 5.5,
      ayanamsa: 'lahiri',
    },
    expected: {
      lagnaRasiIndex: 10, // Aquarius (Kumbham)
      lagnaRasiName: 'கும்பம் (Aquarius)',
      sunRasiIndex: 3, // Cancer (Katakam)
      sunRasiName: 'கடகம் (Cancer)',
      moonRasiIndex: 1, // Taurus (Rishabham)
      moonRasiName: 'ரிஷபம் (Taurus)',
      moonNakshatraIndex: 4, // Mrigashira (மிருகசீரிஷம்)
      moonNakshatraName: 'மிருகசீரிஷம் (Mrigashira)',
      marsRasiIndex: 4, // Leo (Simmam)
      jupiterRasiIndex: 7, // Scorpio (Vrischigam)
      saturnRasiIndex: 1, // Taurus (Rishabham)
    },
  },
  {
    id: 'ramanujan',
    name: 'Srinivasa Ramanujan',
    description: 'Born Dec 22, 1887, Erode. Legendary mathematician with Mithuna Lagna and Pisces Moon (Uttara Bhadrapada nakshatra).',
    input: {
      name: 'Srinivasa Ramanujan',
      gender: 'male',
      date: '1887-12-22',
      time: '18:00:00',
      place: 'Erode',
      latitude: 11.3410,
      longitude: 77.7172,
      timezone: 5.5,
      ayanamsa: 'lahiri',
    },
    expected: {
      lagnaRasiIndex: 2, // Gemini (Mithunam)
      lagnaRasiName: 'மிதுனம் (Gemini)',
      sunRasiIndex: 8, // Sagittarius (Dhanusu)
      sunRasiName: 'தனுசு (Sagittarius)',
      moonRasiIndex: 11, // Pisces (Meenam)
      moonRasiName: 'மீனம் (Pisces)',
      moonNakshatraIndex: 25, // Uttara Bhadrapada (உத்திரட்டாதி)
      moonNakshatraName: 'உத்திரட்டாதி (Uttara Bhadrapada)',
      jupiterRasiIndex: 6, // Libra (Thulam)
    },
  },
  {
    id: 'epoch2000',
    name: 'J2000 Millennium Epoch Chart',
    description: 'Standard astronomical epoch Jan 1, 2000, 12:00 IST at Chennai. Sun in Dhanus, Moon in Thulam (Swati nakshatra).',
    input: {
      name: 'J2000 Benchmark',
      gender: 'male',
      date: '2000-01-01',
      time: '12:00:00',
      place: 'Chennai',
      latitude: 13.0827,
      longitude: 80.2707,
      timezone: 5.5,
      ayanamsa: 'lahiri',
    },
    expected: {
      lagnaRasiIndex: 11, // Pisces (Meenam)
      lagnaRasiName: 'மீனம் (Pisces)',
      sunRasiIndex: 8, // Sagittarius (Dhanusu)
      sunRasiName: 'தனுசு (Sagittarius)',
      moonRasiIndex: 6, // Libra (Thulam)
      moonRasiName: 'துலாம் (Libra)',
      moonNakshatraIndex: 14, // Swati (சுவாதி)
      moonNakshatraName: 'சுவாதி (Swati)',
      saturnRasiIndex: 0, // Aries (Mesham)
    },
  },
  {
    id: 'tamilNewYear2024',
    name: 'Tamil New Year 2024 (Mesha Sankranti)',
    description: 'April 14, 2024, 09:00 IST at Chennai. Sun ingress into Mesham (Chithirai 1), Saturn in Kumbham.',
    input: {
      name: 'Tamil New Year 2024',
      gender: 'male',
      date: '2024-04-14',
      time: '09:00:00',
      place: 'Chennai',
      latitude: 13.0827,
      longitude: 80.2707,
      timezone: 5.5,
      ayanamsa: 'lahiri',
    },
    expected: {
      lagnaRasiIndex: 1, // Taurus (Rishabham)
      lagnaRasiName: 'ரிஷபம் (Taurus)',
      sunRasiIndex: 0, // Aries (Mesham, Chithirai 1)
      sunRasiName: 'மேஷம் (Aries)',
      moonRasiIndex: 2, // Gemini (Mithunam)
      moonRasiName: 'மிதுனம் (Gemini)',
      moonNakshatraIndex: 5, // Arudra (திருவாதிரை)
      moonNakshatraName: 'திருவாதிரை (Arudra)',
      saturnRasiIndex: 10, // Aquarius (Kumbham)
    },
  },
];

export interface TestResult {
  chartId: string;
  name: string;
  passed: boolean;
  checks: {
    item: string;
    expected: string;
    computed: string;
    match: boolean;
    differenceDegrees?: number;
  }[];
}

export function runEngineTests(): TestResult[] {
  return REFERENCE_CHARTS.map(test => {
    const chart = generateBirthChart(test.input);
    const checks: TestResult['checks'] = [];

    // Check Lagna
    const lagnaMatch = chart.lagna.rasiIndex === test.expected.lagnaRasiIndex;
    checks.push({
      item: 'லக்னம் (Lagna Sign)',
      expected: test.expected.lagnaRasiName,
      computed: `${chart.lagna.rasiNameTamil} (${chart.lagna.rasiNameEnglish}) ${chart.lagna.degreeInRasi.toFixed(2)}°`,
      match: lagnaMatch,
    });

    // Check Sun
    const sun = chart.planets.find(p => p.id === 'sun')!;
    const sunMatch = sun.rasiIndex === test.expected.sunRasiIndex;
    checks.push({
      item: 'சூரியன் (Sun Sign)',
      expected: test.expected.sunRasiName,
      computed: `${sun.rasiNameTamil} (${sun.rasiNameEnglish}) ${sun.degreeInRasi.toFixed(2)}°`,
      match: sunMatch,
    });

    // Check Moon
    const moon = chart.planets.find(p => p.id === 'moon')!;
    const moonMatch = moon.rasiIndex === test.expected.moonRasiIndex;
    checks.push({
      item: 'சந்திரன் (Moon Sign)',
      expected: test.expected.moonRasiName,
      computed: `${moon.rasiNameTamil} (${moon.rasiNameEnglish}) ${moon.degreeInRasi.toFixed(2)}°`,
      match: moonMatch,
    });

    // Check Moon Nakshatra
    const nakMatch = moon.nakshatraIndex === test.expected.moonNakshatraIndex;
    checks.push({
      item: 'ஜன்ம நட்சத்திரம் (Moon Nakshatra)',
      expected: test.expected.moonNakshatraName,
      computed: `${moon.nakshatraNameTamil} (${moon.nakshatraNameEnglish}) பாதம் ${moon.pada}`,
      match: nakMatch,
    });

    if (test.expected.saturnRasiIndex !== undefined) {
      const sat = chart.planets.find(p => p.id === 'saturn')!;
      const satMatch = sat.rasiIndex === test.expected.saturnRasiIndex;
      checks.push({
        item: 'சனி (Saturn Sign)',
        expected: `Rasi Index: ${test.expected.saturnRasiIndex}`,
        computed: `${sat.rasiNameTamil} (${sat.degreeInRasi.toFixed(2)}°)`,
        match: satMatch,
      });
    }

    const allPassed = checks.every(c => c.match);
    return {
      chartId: test.id,
      name: test.name,
      passed: allPassed,
      checks,
    };
  });
}
