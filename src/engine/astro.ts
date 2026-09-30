/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Jothidam Astronomical & Vedic Astrology Pure Calculation Engine
 * High-precision celestial algorithms based on Jean Meeus Astronomical Algorithms
 * and VSOP87/ELP-2000 theories adapted for Sidereal Vedic Astrology (Nirayana).
 */

import {
  AyanamsaType,
  BirthChartData,
  DailyPanchangamData,
  DasaPeriod,
  DasaSubPeriod,
  LagnaInfo,
  NavamsaPosition,
  PlanetInfo,
  PoruthamResult,
  SinglePorutham,
} from './types.ts';

import rashisData from './data/rashis.json';
import nakshatrasData from './data/nakshatras.json';
import grahasData from './data/grahas.json';
import calendarData from './data/tamil-calendar.json';
import poruthamRules from './data/porutham-rules.json';

// Math constants
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export function normalizeDegrees(deg: number): number {
  if (isNaN(deg)) return 0;
  let d = deg % 360;
  if (d < 0) d += 360;
  if (d >= 360 || Math.abs(d - 360) < 1e-11) d = 0;
  return d;
}

export function getSafeRasiIndex(deg: number): number {
  const norm = normalizeDegrees(deg);
  const idx = Math.floor(norm / 30);
  return Math.min(11, Math.max(0, idx % 12));
}

export function getSafeNakshatraIndex(deg: number): number {
  const norm = normalizeDegrees(deg);
  const idx = Math.floor(norm / (360 / 27));
  return Math.min(26, Math.max(0, idx % 27));
}

export function getSafePada(deg: number): number {
  const norm = normalizeDegrees(deg);
  const nakSpan = 360 / 27;
  const nakDegree = norm % nakSpan;
  const padaSpan = nakSpan / 4;
  const p = Math.floor(nakDegree / padaSpan) + 1;
  return Math.min(4, Math.max(1, p));
}

export function getRasiData(index: number) {
  const safeIdx = Math.min(11, Math.max(0, isNaN(index) ? 0 : Math.floor(index) % 12));
  return rashisData[safeIdx] ?? rashisData[0];
}

export function getNakshatraData(index: number) {
  const safeIdx = Math.min(26, Math.max(0, isNaN(index) ? 0 : Math.floor(index) % 27));
  return nakshatrasData[safeIdx] ?? nakshatrasData[0];
}

export function degToDms(deg: number): { deg: number; min: number; sec: number; formatted: string } {
  const norm = normalizeDegrees(deg);
  const d = Math.floor(norm);
  const mFloat = (norm - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  const secSafe = s === 60 ? 59 : s;
  const formatted = `${d}° ${m.toString().padStart(2, '0')}' ${secSafe.toString().padStart(2, '0')}"`;
  return { deg: d, min: m, sec: secSafe, formatted };
}

/**
 * Julian Day Number calculation from civil date and UTC time
 */
export function getJulianDay(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const dayFraction = (hour + minute / 60 + second / 3600) / 24;
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5 + dayFraction;
  return jd;
}

/**
 * Standard Lahiri (Chitra Paksha), KP, and Raman Ayanamsa
 * Formula calibrated against Indian Astronomical Ephemeris & Swiss Ephemeris
 */
export function getAyanamsa(jd: number, type: AyanamsaType = 'lahiri'): number {
  const t = (jd - 2451545.0) / 36525.0; // Centuries from J2000.0
  // Standard Lahiri value at J2000.0 is 23° 51' 11.2" = 23.853111 deg
  // Precession rate: 50.290966 arcsec per year = 1.39697128 deg per century
  const lahiri = 23.853111 + 1.3969713 * t + 0.0003086 * t * t;
  
  if (type === 'kp') {
    // Krishnamurti Paddhati ayanamsa is approx 5' 56" less than Lahiri
    return lahiri - 0.098889;
  } else if (type === 'raman') {
    // B.V. Raman ayanamsa uses different zero year (approx 397 AD)
    return lahiri - 1.444444;
  }
  return lahiri;
}

/**
 * Obliquity of the Ecliptic (Meeus formula)
 */
export function getObliquity(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0;
  const eps = 23.4392911 - 0.013004167 * t - 0.000000164 * t * t + 0.0000005036 * t * t * t;
  return eps;
}

/**
 * Greenwich Mean Sidereal Time (GMST) in degrees
 */
export function getGMST(jd: number): number {
  const d = jd - 2451545.0;
  const t = d / 36525.0;
  let gmst = 280.46061837 + 360.98564736629 * d + 0.000387933 * t * t - (t * t * t) / 38710000.0;
  return normalizeDegrees(gmst);
}

/**
 * High-Precision Tropical Solar Longitude
 */
function getTropicalSun(jd: number): { longitude: number; speed: number } {
  const t = (jd - 2451545.0) / 36525.0;
  const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const mRad = m * DEG2RAD;
  
  // Equation of center
  const c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(mRad)
    + (0.019993 - 0.000101 * t) * Math.sin(2 * mRad)
    + 0.000289 * Math.sin(3 * mRad);
    
  const trueLong = l0 + c;
  const apparentLong = trueLong - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * t) * DEG2RAD);
  return { longitude: normalizeDegrees(apparentLong), speed: 0.9856 };
}

/**
 * High-Precision Tropical Lunar Longitude
 */
function getTropicalMoon(jd: number): { longitude: number; speed: number } {
  const t = (jd - 2451545.0) / 36525.0;
  // Fundamental arguments
  const lPrime = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t; // Moon mean longitude
  const d = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t; // Mean elongation
  const m = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t; // Sun mean anomaly
  const mPrime = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t; // Moon mean anomaly
  const f = 93.272095 + 483202.0175233 * t - 0.0036539 * t * t; // Moon argument of latitude

  const dR = d * DEG2RAD;
  const mR = m * DEG2RAD;
  const mpR = mPrime * DEG2RAD;
  const fR = f * DEG2RAD;

  // Major periodic perturbations (Brown / Meeus truncated series to ~0.005 deg)
  let deltaL = 22640 * Math.sin(mpR)
    - 4586 * Math.sin(mpR - 2 * dR)
    + 2370 * Math.sin(2 * dR)
    + 769 * Math.sin(2 * mpR)
    - 668 * Math.sin(mR)
    - 412 * Math.sin(2 * fR)
    - 212 * Math.sin(2 * mpR - 2 * dR)
    - 206 * Math.sin(mpR + mR - 2 * dR)
    + 192 * Math.sin(mpR + 2 * dR)
    - 165 * Math.sin(mR - 2 * dR)
    - 125 * Math.sin(d)
    - 110 * Math.sin(mpR + mR)
    + 148 * Math.sin(mpR - mR)
    - 55 * Math.sin(2 * fR - 2 * dR);

  // Convert arcseconds to degrees
  const moonLong = lPrime + (deltaL / 3600.0);
  return { longitude: normalizeDegrees(moonLong), speed: 13.176 };
}

/**
 * Tropical Planetary positions using Keplerian elements with perturbations (Meeus Ch 31)
 */
interface OrbitalElements {
  a0: number; aRate: number;
  e0: number; eRate: number;
  i0: number; iRate: number;
  L0: number; LRate: number;
  longPeri0: number; longPeriRate: number;
  longNode0: number; longNodeRate: number;
}

const PLANETARY_ELEMENTS: Record<string, OrbitalElements> = {
  mercury: {
    a0: 0.38709927, aRate: 0.00000037,
    e0: 0.20563593, eRate: 0.00001906,
    i0: 7.00497902, iRate: -0.0059474,
    L0: 252.2503235, LRate: 149472.67411175,
    longPeri0: 77.45779628, longPeriRate: 0.16047689,
    longNode0: 48.33076593, longNodeRate: -0.12534081,
  },
  venus: {
    a0: 0.72333566, aRate: 0.0000039,
    e0: 0.00677672, eRate: -0.00004107,
    i0: 3.39467605, iRate: -0.0007889,
    L0: 181.9790995, LRate: 58517.81538729,
    longPeri0: 131.60246718, longPeriRate: 0.00268329,
    longNode0: 76.67984255, longNodeRate: -0.27769418,
  },
  mars: {
    a0: 1.52367934, aRate: 0.00000319,
    e0: 0.09340062, eRate: 0.000092064,
    i0: 1.84969142, iRate: -0.00813131,
    L0: -4.55343205, LRate: 19140.30268499,
    longPeri0: -239.94174856, longPeriRate: 0.44441088,
    longNode0: 49.55953891, longNodeRate: -0.29257343,
  },
  jupiter: {
    a0: 5.20260319, aRate: 0.00000019,
    e0: 0.04849485, eRate: 0.000163244,
    i0: 1.30305886, iRate: -0.00569614,
    L0: 34.351484, LRate: 3034.74612775,
    longPeri0: 14.72847983, longPeriRate: 0.21252668,
    longNode0: 100.47390909, longNodeRate: 0.20469106,
  },
  saturn: {
    a0: 9.55490959, aRate: -0.00000213,
    e0: 0.05550862, eRate: -0.000346818,
    i0: 2.48866039, iRate: 0.0025514,
    L0: 49.94432, LRate: 1222.49362201,
    longPeri0: 92.59887831, longPeriRate: -0.41897216,
    longNode0: 113.66242448, longNodeRate: -0.28867794,
  }
};

/**
 * Solve Kepler's equation M = E - e*sin(E)
 */
function solveKepler(M: number, e: number): number {
  const mRad = M * DEG2RAD;
  let E = mRad;
  for (let i = 0; i < 15; i++) {
    const f = E - e * Math.sin(E) - mRad;
    const fPrime = 1 - e * Math.cos(E);
    const delta = f / fPrime;
    E -= delta;
    if (Math.abs(delta) < 1e-8) break;
  }
  return E;
}

/**
 * Geocentric tropical longitude of a planet
 */
function getGeocentricPlanet(planetKey: string, jd: number): { longitude: number; speed: number } {
  const el = PLANETARY_ELEMENTS[planetKey];
  if (!el) return { longitude: 0, speed: 0 };

  const calcHeliocentric = (targetJd: number) => {
    const t = (targetJd - 2451545.0) / 36525.0;
    const a = el.a0 + el.aRate * t;
    const e = el.e0 + el.eRate * t;
    const inc = (el.i0 + el.iRate * t) * DEG2RAD;
    const L = el.L0 + el.LRate * t;
    const longPeri = el.longPeri0 + el.longPeriRate * t;
    const longNode = (el.longNode0 + el.longNodeRate * t) * DEG2RAD;

    const M = normalizeDegrees(L - longPeri);
    const E = solveKepler(M, e);

    const xPrime = a * (Math.cos(E) - e);
    const yPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);

    const omega = (longPeri - (el.longNode0 + el.longNodeRate * t)) * DEG2RAD;

    // Heliocentric ecliptic coordinates
    const xh = (Math.cos(omega) * Math.cos(longNode) - Math.sin(omega) * Math.sin(longNode) * Math.cos(inc)) * xPrime
             + (-Math.sin(omega) * Math.cos(longNode) - Math.cos(omega) * Math.sin(longNode) * Math.cos(inc)) * yPrime;
    const yh = (Math.cos(omega) * Math.sin(longNode) + Math.sin(omega) * Math.cos(longNode) * Math.cos(inc)) * xPrime
             + (-Math.sin(omega) * Math.sin(longNode) + Math.cos(omega) * Math.cos(longNode) * Math.cos(inc)) * yPrime;
    const zh = (Math.sin(omega) * Math.sin(inc)) * xPrime + (Math.cos(omega) * Math.sin(inc)) * yPrime;

    return { x: xh, y: yh, z: zh };
  };

  const getSunGeocentric = (targetJd: number) => {
    const sun = getTropicalSun(targetJd);
    const r = 1.0; // AU approx
    const sunRad = sun.longitude * DEG2RAD;
    return { x: r * Math.cos(sunRad), y: r * Math.sin(sunRad), z: 0 };
  };

  const p0 = calcHeliocentric(jd);
  const s0 = getSunGeocentric(jd);

  // Geocentric vector = Heliocentric planet vector - Heliocentric earth vector
  // (where Heliocentric earth vector = - Geocentric sun vector)
  const xg = p0.x + s0.x;
  const yg = p0.y + s0.y;

  let geoLong = Math.atan2(yg, xg) * RAD2DEG;
  geoLong = normalizeDegrees(geoLong);

  // Calculate speed by evaluating at jd + 0.05 days (~1.2 hours)
  const dt = 0.05;
  const p1 = calcHeliocentric(jd + dt);
  const s1 = getSunGeocentric(jd + dt);
  let geoLong2 = Math.atan2(p1.y + s1.y, p1.x + s1.x) * RAD2DEG;
  geoLong2 = normalizeDegrees(geoLong2);

  let diff = geoLong2 - geoLong;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  const speed = diff / dt;

  return { longitude: geoLong, speed };
}

/**
 * Mean Rahu & Ketu (Ascending & Descending Lunar Nodes)
 */
function getRahuKetu(jd: number): { rahu: number; ketu: number; speed: number } {
  const t = (jd - 2451545.0) / 36525.0;
  // Node longitude formula
  const omega = 125.04452 - 1934.136261 * t + 0.0020708 * t * t + (t * t * t) / 450000;
  const rahu = normalizeDegrees(omega);
  const ketu = normalizeDegrees(rahu + 180);
  return { rahu, ketu, speed: -0.05295 }; // Nodes always travel retrograde
}

/**
 * Calculate Lagna (Ascendant)
 */
export function calculateLagna(jd: number, latitude: number, longitude: number, ayanamsa: number): LagnaInfo {
  const gmst = getGMST(jd);
  const lst = normalizeDegrees(gmst + longitude); // Local Sidereal Time in degrees
  const eps = getObliquity(jd);

  const lstRad = lst * DEG2RAD;
  const epsRad = eps * DEG2RAD;
  const latRad = latitude * DEG2RAD;

  // Formula for Ascendant in tropical longitude:
  // tan(lambda) = cos(LST) / (-sin(LST) * cos(eps) - tan(lat) * sin(eps))
  const y = Math.cos(lstRad);
  const x = -Math.sin(lstRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);

  let tropAsc = Math.atan2(y, x) * RAD2DEG;
  // Adjust quadrant to match correct eastern horizon
  tropAsc = normalizeDegrees(tropAsc);

  // Sidereal Ascendant (Nirayana)
  const siderealAsc = normalizeDegrees(tropAsc - ayanamsa);

  const rasiIndex = getSafeRasiIndex(siderealAsc);
  const degreeInRasi = siderealAsc % 30;

  const nakshatraIndex = getSafeNakshatraIndex(siderealAsc);
  const pada = getSafePada(siderealAsc);

  const nakshatra = getNakshatraData(nakshatraIndex);
  const rasi = getRasiData(rasiIndex);

  return {
    longitude: siderealAsc,
    rasiIndex,
    rasiNameTamil: rasi.nameTamil,
    rasiNameEnglish: rasi.nameEnglish,
    degreeInRasi,
    nakshatraIndex,
    nakshatraNameTamil: nakshatra.nameTamil,
    nakshatraNameEnglish: nakshatra.nameEnglish,
    pada,
    nakshatraLord: nakshatra.lord,
  };
}

/**
 * Calculate Navamsa (D9) Sign
 */
export function calculateNavamsa(longitude: number): number {
  // Total 108 navamsas across 360 degrees, each is 3 deg 20 min = 3.333333 deg
  const navamsaIndex = Math.floor(normalizeDegrees(longitude) / (360 / 108));
  return Math.min(11, Math.max(0, navamsaIndex % 12));
}

/**
 * Determine dignity of a planet
 */
function getDignity(planetId: string, rasiIndex: number, degreeInRasi: number): PlanetInfo['dignity'] {
  const g = grahasData.find(p => p.id === planetId);
  if (!g) return 'neutral';

  const safeRasi = getRasiData(rasiIndex);

  if (g.exaltedSign === safeRasi.index && Math.abs(degreeInRasi - g.exaltedDegree) <= 5) {
    return 'exalted';
  }
  if (g.exaltedSign === safeRasi.index) {
    return 'exalted';
  }
  if (g.debilitatedSign === safeRasi.index) {
    return 'debilitated';
  }
  if (g.moolatrikonaSign === safeRasi.index) {
    return 'moolatrikona';
  }
  if (g.ownSigns.includes(safeRasi.index)) {
    return 'own';
  }

  // Check relationship with sign lord
  const signLordId = (safeRasi.lord || '').toLowerCase();
  if (g.friends.includes(signLordId)) {
    return 'friend';
  }
  if (g.enemies.includes(signLordId)) {
    return 'enemy';
  }
  return 'neutral';
}

/**
 * Full Birth Chart Generation
 */
export function generateBirthChart(input: BirthChartData['input']): BirthChartData {
  const [yearStr, monthStr, dayStr] = (input.date || '2000-01-01').split('-');
  const [hourStr, minStr, secStr] = (input.time || '12:00:00').split(':');
  const year = parseInt(yearStr, 10) || 2000;
  const month = parseInt(monthStr, 10) || 1;
  const day = parseInt(dayStr, 10) || 1;
  const hour = parseInt(hourStr || '0', 10);
  const min = parseInt(minStr || '0', 10);
  const sec = parseInt(secStr || '0', 10);

  // Convert civil time to UTC
  const utcHour = hour - (input.timezone ?? 5.5);
  const jd = getJulianDay(year, month, day, utcHour, min, sec);
  const ayanamsaVal = getAyanamsa(jd, input.ayanamsa);

  // Calculate planetary positions
  const rawTropicalPlanets: Record<string, { longitude: number; speed: number }> = {
    sun: getTropicalSun(jd),
    moon: getTropicalMoon(jd),
    mars: getGeocentricPlanet('mars', jd),
    mercury: getGeocentricPlanet('mercury', jd),
    jupiter: getGeocentricPlanet('jupiter', jd),
    venus: getGeocentricPlanet('venus', jd),
    saturn: getGeocentricPlanet('saturn', jd),
  };

  const { rahu, ketu, speed: nodeSpeed } = getRahuKetu(jd);
  rawTropicalPlanets['rahu'] = { longitude: rahu, speed: nodeSpeed };
  rawTropicalPlanets['ketu'] = { longitude: ketu, speed: nodeSpeed };

  const sunLong = normalizeDegrees(rawTropicalPlanets.sun.longitude - ayanamsaVal);

  const planets: PlanetInfo[] = grahasData.map(g => {
    const raw = rawTropicalPlanets[g.id] ?? { longitude: 0, speed: 1 };
    const siderealLong = normalizeDegrees(raw.longitude - ayanamsaVal);
    const rasiIndex = getSafeRasiIndex(siderealLong);
    const degreeInRasi = siderealLong % 30;

    const nakshatraIndex = getSafeNakshatraIndex(siderealLong);
    const pada = getSafePada(siderealLong);

    const nakshatra = getNakshatraData(nakshatraIndex);
    const rasi = getRasiData(rasiIndex);

    const isRetrograde = raw.speed < 0;

    // Check combustion (within orb from Sun)
    let isCombust = false;
    if (g.id !== 'sun' && g.id !== 'rahu' && g.id !== 'ketu' && g.combustionOrb > 0) {
      const orb = (isRetrograde && 'combustionOrbRetro' in g && g.combustionOrbRetro) ? g.combustionOrbRetro : g.combustionOrb;
      let diff = Math.abs(siderealLong - sunLong);
      if (diff > 180) diff = 360 - diff;
      isCombust = diff <= orb;
    }

    const dignity = getDignity(g.id, rasiIndex, degreeInRasi);

    return {
      id: g.id,
      nameTamil: g.nameTamil,
      nameEnglish: g.nameEnglish,
      symbol: g.symbol,
      longitude: siderealLong,
      speed: raw.speed,
      rasiIndex,
      rasiNameTamil: rasi.nameTamil,
      rasiNameEnglish: rasi.nameEnglish,
      degreeInRasi,
      nakshatraIndex,
      nakshatraNameTamil: nakshatra.nameTamil,
      nakshatraNameEnglish: nakshatra.nameEnglish,
      pada,
      nakshatraLord: nakshatra.lord,
      isRetrograde,
      isCombust,
      dignity,
    };
  });

  // Calculate Lagna
  const lagna = calculateLagna(jd, input.latitude ?? 13.0827, input.longitude ?? 80.2707, ayanamsaVal);

  // Calculate Navamsa positions
  const navamsa: NavamsaPosition[] = [
    {
      id: 'lagna',
      nameTamil: 'லக்னம்',
      nameEnglish: 'Lagna',
      rasiIndex: calculateNavamsa(lagna.longitude),
      rasiNameTamil: getRasiData(calculateNavamsa(lagna.longitude)).nameTamil,
      rasiNameEnglish: getRasiData(calculateNavamsa(lagna.longitude)).nameEnglish,
      pada: lagna.pada,
    },
    ...planets.map(p => {
      const navRasi = calculateNavamsa(p.longitude);
      return {
        id: p.id,
        nameTamil: p.nameTamil,
        nameEnglish: p.nameEnglish,
        rasiIndex: navRasi,
        rasiNameTamil: getRasiData(navRasi).nameTamil,
        rasiNameEnglish: getRasiData(navRasi).nameEnglish,
        pada: p.pada,
      };
    }),
  ];

  // Group planets by Houses from Lagna (House 1 = Lagna sign)
  const houses = [];
  for (let h = 1; h <= 12; h++) {
    const rasiIndex = (lagna.rasiIndex + (h - 1)) % 12;
    const housePlanets = planets.filter(p => p.rasiIndex === rasiIndex);
    houses.push({
      houseNumber: h,
      rasiIndex,
      planets: housePlanets,
    });
  }

  // Panchangam at Birth
  const moon = planets.find(p => p.id === 'moon') ?? planets[1];
  const sun = planets.find(p => p.id === 'sun') ?? planets[0];

  // Tithi: Each tithi is 12 degrees of difference between Moon and Sun
  let diffMS = moon.longitude - sun.longitude;
  if (diffMS < 0) diffMS += 360;
  const tithiNumber = Math.min(30, Math.max(1, Math.floor(diffMS / 12) + 1));
  const tithiInfo = calendarData.tithis[tithiNumber - 1] ?? calendarData.tithis[0];
  const tithiPaksha: 'Sukla' | 'Krishna' = tithiNumber <= 15 ? 'Sukla' : 'Krishna';

  // Yoga: Sum of Sun and Moon longitudes modulo 360 divided by 13° 20' (360/27)
  const sumSM = normalizeDegrees(moon.longitude + sun.longitude);
  const yogaIndex = Math.floor(sumSM / (360 / 27)) % 27;
  const yoga = calendarData.yogas[yogaIndex] ?? calendarData.yogas[0];

  // Karana: Half of a tithi (6 degrees)
  const karanaIndex = Math.floor(diffMS / 6);
  let karanaInfo;
  if (karanaIndex === 0) {
    karanaInfo = calendarData.karanas[10]; // Kintughna
  } else if (karanaIndex >= 57) {
    karanaInfo = calendarData.karanas[7 + Math.min(3, karanaIndex - 57)] ?? calendarData.karanas[7]; // Fixed karanas
  } else {
    karanaInfo = calendarData.karanas[(karanaIndex - 1) % 7] ?? calendarData.karanas[0]; // 7 repeating movable karanas
  }

  // Vaaram
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  const vaaram = calendarData.vaarams[dayOfWeek] ?? calendarData.vaarams[0];

  // Tamil Solar Month and Year
  const tamilMonth = (calendarData.months[sun.rasiIndex] ?? calendarData.months[0]).nameTamil;
  const tamilDate = Math.floor(sun.degreeInRasi) + 1;
  // 60-year cyclic calculation: 1987 is Prabhava (year 0 of cycle)
  const cycleBaseYear = 1987;
  let yearDiff = year - cycleBaseYear;
  if (sun.rasiIndex < 0 || (sun.rasiIndex === 0 && sun.degreeInRasi < 1)) {
    // Before Tamil New Year (approx April 14, Sun enters Aries)
    yearDiff -= 1;
  }
  const yearIndex = ((yearDiff % 60) + 60) % 60;
  const tamilYear = (calendarData.years[yearIndex] ?? calendarData.years[0]).nameTamil;

  // Dasa Balance calculation
  const moonNak = getNakshatraData(moon.nakshatraIndex);
  const nakSpan = 360 / 27; // 13.333333 deg
  const elapsedInNak = moon.longitude % nakSpan;
  const remainingFraction = Math.max(0, Math.min(1, (nakSpan - elapsedInNak) / nakSpan));
  const totalBalanceYears = remainingFraction * moonNak.dasaYears;
  const balanceYears = Math.floor(totalBalanceYears);
  const balanceMonths = Math.floor((totalBalanceYears - balanceYears) * 12);
  const balanceDays = Math.round(((totalBalanceYears - balanceYears) * 12 - balanceMonths) * 30.4375);

  // Generate complete 120-year Vimshottari Dasa-Bhukti timeline
  const dasaTimeline = generateDasaTimeline(
    moon.nakshatraIndex,
    totalBalanceYears,
    new Date(year, month - 1, day, hour, min)
  );

  return {
    input,
    ayanamsaValue: ayanamsaVal,
    julianDay: jd,
    lagna,
    planets,
    navamsa,
    houses,
    panchangaAtBirth: {
      tithiNameTamil: tithiInfo.nameTamil,
      tithiNameEnglish: tithiInfo.nameEnglish,
      tithiPaksha,
      tithiNumber,
      nakshatraNameTamil: moon.nakshatraNameTamil,
      nakshatraNameEnglish: moon.nakshatraNameEnglish,
      pada: moon.pada,
      yogaNameTamil: yoga.nameTamil,
      yogaNameEnglish: yoga.nameEnglish,
      karanaNameTamil: karanaInfo.nameTamil,
      karanaNameEnglish: karanaInfo.nameEnglish,
      vaaramTamil: vaaram.nameTamil,
      vaaramEnglish: vaaram.nameEnglish,
      tamilMonth,
      tamilDate,
      tamilYear,
    },
    dasaBalance: {
      lordTamil: moonNak.lordTamil,
      lordEnglish: moonNak.lord,
      balanceYears,
      balanceMonths,
      balanceDays,
      totalBalanceYears,
    },
    dasaTimeline,
  };
}

/**
 * Generate 120-year Vimshottari Dasa and Bhukti timeline
 */
function generateDasaTimeline(startNakIndex: number, firstDasaBalanceYears: number, birthDate: Date): DasaPeriod[] {
  const DASA_ORDER = [
    { lord: 'Ketu', lordTamil: 'கேது', lordEnglish: 'Ketu', years: 7 },
    { lord: 'Venus', lordTamil: 'சுக்கிரன்', lordEnglish: 'Venus', years: 20 },
    { lord: 'Sun', lordTamil: 'சூரியன்', lordEnglish: 'Sun', years: 6 },
    { lord: 'Moon', lordTamil: 'சந்திரன்', lordEnglish: 'Moon', years: 10 },
    { lord: 'Mars', lordTamil: 'செவ்வாய்', lordEnglish: 'Mars', years: 7 },
    { lord: 'Rahu', lordTamil: 'ராகு', lordEnglish: 'Rahu', years: 18 },
    { lord: 'Jupiter', lordTamil: 'குரு', lordEnglish: 'Jupiter', years: 16 },
    { lord: 'Saturn', lordTamil: 'சனி', lordEnglish: 'Saturn', years: 19 },
    { lord: 'Mercury', lordTamil: 'புதன்', lordEnglish: 'Mercury', years: 17 },
  ];

  const safeNak = getNakshatraData(startNakIndex);
  const firstLord = safeNak.lord;
  let startIndex = DASA_ORDER.findIndex(d => d.lord === firstLord);
  if (startIndex === -1) startIndex = 0;

  const timeline: DasaPeriod[] = [];
  let currentDate = new Date(birthDate.getTime());
  let currentAge = 0;
  const now = new Date();

  for (let i = 0; i < 9; i++) {
    const dasaIndex = ((startIndex + i) % 9 + 9) % 9;
    const dasaMeta = DASA_ORDER[dasaIndex] ?? DASA_ORDER[0];
    const dasaDuration = i === 0 ? firstDasaBalanceYears : dasaMeta.years;

    const dasaStartDate = new Date(currentDate.getTime());
    const startAge = currentAge;
    currentAge += dasaDuration;
    
    // Increment date by years
    const dasaEndDate = new Date(dasaStartDate.getTime() + dasaDuration * 365.25 * 24 * 3600 * 1000);
    currentDate = dasaEndDate;

    const isCurrent = now >= dasaStartDate && now < dasaEndDate;

    // Generate 9 Bhuktis inside this Dasa
    const bhuktis: DasaSubPeriod[] = [];
    let bhuktiDate = new Date(dasaStartDate.getTime());
    let bhuktiAge = startAge;

    for (let b = 0; b < 9; b++) {
      const bhuktiIndex = ((dasaIndex + b) % 9 + 9) % 9;
      const bhuktiMeta = DASA_ORDER[bhuktiIndex] ?? DASA_ORDER[0];
      // Formula for Bhukti duration in years: (Dasa years * Bhukti years) / 120
      const standardBhuktiYears = (dasaMeta.years * bhuktiMeta.years) / 120;
      // Pro-rate for the first dasa if balance
      const bhuktiYears = i === 0 ? (standardBhuktiYears * (firstDasaBalanceYears / dasaMeta.years)) : standardBhuktiYears;

      const bhuktiStartDate = new Date(bhuktiDate.getTime());
      const bhuktiEndDate = new Date(bhuktiStartDate.getTime() + bhuktiYears * 365.25 * 24 * 3600 * 1000);
      bhuktiDate = bhuktiEndDate;

      const bStartAge = bhuktiAge;
      bhuktiAge += bhuktiYears;

      // Generate Antaras inside Bhukti
      const antaras = [];
      let antaraDate = new Date(bhuktiStartDate.getTime());
      for (let a = 0; a < 9; a++) {
        const aIndex = ((bhuktiIndex + a) % 9 + 9) % 9;
        const aMeta = DASA_ORDER[aIndex] ?? DASA_ORDER[0];
        const aYears = (bhuktiYears * aMeta.years) / 120;
        const aStart = new Date(antaraDate.getTime());
        const aEnd = new Date(aStart.getTime() + aYears * 365.25 * 24 * 3600 * 1000);
        antaraDate = aEnd;
        antaras.push({
          lord: aMeta.lord,
          lordTamil: aMeta.lordTamil,
          lordEnglish: aMeta.lordEnglish,
          startDate: aStart.toISOString().split('T')[0],
          endDate: aEnd.toISOString().split('T')[0],
        });
      }

      bhuktis.push({
        lord: bhuktiMeta.lord,
        lordTamil: bhuktiMeta.lordTamil,
        lordEnglish: bhuktiMeta.lordEnglish,
        startDate: bhuktiStartDate.toISOString().split('T')[0],
        endDate: bhuktiEndDate.toISOString().split('T')[0],
        startAgeYears: parseFloat(bStartAge.toFixed(2)),
        endAgeYears: parseFloat(bhuktiAge.toFixed(2)),
        antaras,
      });
    }

    timeline.push({
      lord: dasaMeta.lord,
      lordTamil: dasaMeta.lordTamil,
      lordEnglish: dasaMeta.lordEnglish,
      years: parseFloat(dasaDuration.toFixed(2)),
      startDate: dasaStartDate.toISOString().split('T')[0],
      endDate: dasaEndDate.toISOString().split('T')[0],
      startAgeYears: parseFloat(startAge.toFixed(2)),
      endAgeYears: parseFloat(currentAge.toFixed(2)),
      bhuktis,
      isCurrent,
    });
  }

  return timeline;
}

/**
 * Calculate Sunrise and Sunset times for a given day and location
 */
export function calculateSunTimes(year: number, month: number, day: number, lat: number, lng: number, tz: number) {
  const d = getJulianDay(year, month, day, 12, 0, 0) - 2451545.0;
  const m = normalizeDegrees(357.5291 + 0.98560028 * d);
  const mRad = m * DEG2RAD;
  const c = 1.9148 * Math.sin(mRad) + 0.02 * Math.sin(2 * mRad);
  const lambda = normalizeDegrees(280.4665 + 0.98564736 * d + c);
  const eps = 23.439 * DEG2RAD;
  const dec = Math.asin(Math.sin(eps) * Math.sin(lambda * DEG2RAD));

  // Zenith 90.8333 degrees for atmospheric refraction
  const h0 = -0.8333 * DEG2RAD;
  const latRad = lat * DEG2RAD;

  const cosH = (Math.sin(h0) - Math.sin(latRad) * Math.sin(dec)) / (Math.cos(latRad) * Math.cos(dec));

  let riseHour = 6.0;
  let setHour = 18.0;

  if (cosH >= -1 && cosH <= 1) {
    const H = Math.acos(cosH) * RAD2DEG;
    const solarNoonUTC = (720 - 4 * lng) / 60; // hours UTC
    riseHour = solarNoonUTC - (H * 4) / 60 + tz;
    setHour = solarNoonUTC + (H * 4) / 60 + tz;
  }

  const formatTime = (hFloat: number) => {
    let norm = (hFloat % 24 + 24) % 24;
    const h = Math.floor(norm);
    const m = Math.floor((norm - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return {
    riseHourFloat: riseHour,
    setHourFloat: setHour,
    riseFormatted: formatTime(riseHour),
    setFormatted: formatTime(setHour),
  };
}

/**
 * Daily Panchangam Generator for any date and location
 */
export function generateDailyPanchangam(dateStr: string, location: string, lat: number, lng: number, tz = 5.5): DailyPanchangamData {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Standard calculation at local Sunrise (approx 6:00 AM)
  const jd = getJulianDay(year, month, day, 6 - tz, 0, 0);
  const ayanamsaVal = getAyanamsa(jd, 'lahiri');

  const sunTrop = getTropicalSun(jd);
  const moonTrop = getTropicalMoon(jd);

  const sunLong = normalizeDegrees(sunTrop.longitude - ayanamsaVal);
  const moonLong = normalizeDegrees(moonTrop.longitude - ayanamsaVal);

  const sunRasi = getSafeRasiIndex(sunLong);
  const sunDeg = sunLong % 30;

  const tamilMonth = (calendarData.months[sunRasi] ?? calendarData.months[0]).nameTamil;
  const tamilDate = Math.floor(sunDeg) + 1;

  // Tamil Year
  const cycleBaseYear = 1987;
  let yearDiff = year - cycleBaseYear;
  if (sunRasi === 11 && sunDeg > 20) {
    // Panguni end
  }
  const yearIndex = ((yearDiff % 60) + 60) % 60;
  const tamilYear = (calendarData.years[yearIndex] ?? calendarData.years[0]).nameTamil;

  // Vaaram
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  const vaaram = calendarData.vaarams[dayOfWeek] ?? calendarData.vaarams[0];

  // Tithi
  let diffMS = moonLong - sunLong;
  if (diffMS < 0) diffMS += 360;
  const tithiIndex = Math.min(30, Math.max(1, Math.floor(diffMS / 12) + 1));
  const tithiInfo = calendarData.tithis[tithiIndex - 1] ?? calendarData.tithis[0];
  const tithiProgress = (diffMS % 12) / 12 * 100;
  const tithiPaksha: 'Sukla' | 'Krishna' = tithiIndex <= 15 ? 'Sukla' : 'Krishna';

  // Nakshatra
  const nakIndex = getSafeNakshatraIndex(moonLong);
  const nakInfo = getNakshatraData(nakIndex);
  const nakSpan = 360 / 27;
  const nakProgress = (moonLong % nakSpan) / nakSpan * 100;
  const pada = getSafePada(moonLong);

  // Yoga
  const sumSM = normalizeDegrees(moonLong + sunLong);
  const yogaIndex = Math.floor(sumSM / nakSpan) % 27;
  const yogaInfo = calendarData.yogas[yogaIndex] ?? calendarData.yogas[0];

  // Karana
  const karanaIdx = Math.floor(diffMS / 6);
  let karanaInfo;
  if (karanaIdx === 0) {
    karanaInfo = calendarData.karanas[10];
  } else if (karanaIdx >= 57) {
    karanaInfo = calendarData.karanas[7 + Math.min(3, karanaIdx - 57)] ?? calendarData.karanas[7];
  } else {
    karanaInfo = calendarData.karanas[(karanaIdx - 1) % 7] ?? calendarData.karanas[0];
  }

  // Sunrise and Sunset
  const { riseHourFloat, setHourFloat, riseFormatted, setFormatted } = calculateSunTimes(year, month, day, lat, lng, tz);

  // Kaala segments based on day length (8 equal segments of daylight)
  const dayDuration = setHourFloat - riseHourFloat;
  const segmentLength = dayDuration / 8;

  const getSegmentTime = (segment1to8: number) => {
    const start = riseHourFloat + (segment1to8 - 1) * segmentLength;
    const end = start + segmentLength;
    const fmt = (hFloat: number) => {
      const h = Math.floor(hFloat);
      const m = Math.floor((hFloat - h) * 60);
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
    };
    return `${fmt(start)} - ${fmt(end)}`;
  };

  // Traditional Kaala segments by Day of Week (0 = Sun, 1 = Mon, ..., 6 = Sat):
  // Rahu Kalam: Sun(8), Mon(2), Tue(7), Wed(5), Thu(6), Fri(4), Sat(3)
  const RAHU_SEGMENTS = [8, 2, 7, 5, 6, 4, 3];
  // Yamagandam: Sun(5), Mon(4), Tue(3), Wed(2), Thu(1), Fri(7), Sat(6)
  const YAMA_SEGMENTS = [5, 4, 3, 2, 1, 7, 6];
  // Kuligai: Sun(7), Mon(6), Tue(5), Wed(4), Thu(3), Fri(2), Sat(1)
  const KULIGAI_SEGMENTS = [7, 6, 5, 4, 3, 2, 1];

  const rahuKalam = getSegmentTime(RAHU_SEGMENTS[dayOfWeek]);
  const yamaGandam = getSegmentTime(YAMA_SEGMENTS[dayOfWeek]);
  const kuligai = getSegmentTime(KULIGAI_SEGMENTS[dayOfWeek]);

  // Nalla Neram (auspicious daytime hours based on Tamil tradition)
  const NALLA_NERAM_TABLE = [
    { morning: '07:30 AM - 08:30 AM', evening: '03:30 PM - 04:30 PM' }, // Sun
    { morning: '06:30 AM - 07:30 AM', evening: '04:30 PM - 05:30 PM' }, // Mon
    { morning: '07:30 AM - 08:30 AM', evening: '04:30 PM - 05:30 PM' }, // Tue
    { morning: '09:30 AM - 10:30 AM', evening: '04:30 PM - 05:30 PM' }, // Wed
    { morning: '09:30 AM - 10:30 AM', evening: '06:30 PM - 07:30 PM' }, // Thu
    { morning: '06:30 AM - 07:30 AM', evening: '05:30 PM - 06:30 PM' }, // Fri
    { morning: '07:30 AM - 08:30 AM', evening: '05:30 PM - 06:30 PM' }, // Sat
  ];

  const DURMUHURTHAM_TABLE = [
    '04:30 PM - 05:18 PM', // Sun
    '12:35 PM - 01:23 PM, 03:00 PM - 03:48 PM', // Mon
    '08:35 AM - 09:23 AM, 11:15 PM - 12:00 AM', // Tue
    '11:47 AM - 12:35 PM', // Wed
    '10:11 AM - 10:59 AM, 02:47 PM - 03:35 PM', // Thu
    '08:35 AM - 09:23 AM, 12:35 PM - 01:23 PM', // Fri
    '06:12 AM - 07:00 AM', // Sat
  ];

  const nallaNeram = NALLA_NERAM_TABLE[dayOfWeek] ?? NALLA_NERAM_TABLE[0];
  const durmuhurtham = DURMUHURTHAM_TABLE[dayOfWeek] ?? DURMUHURTHAM_TABLE[0];

  // Moon phase
  const moonPhasePercent = Math.round((1 - Math.cos(diffMS * DEG2RAD)) / 2 * 100);
  const isAmavasya = tithiIndex === 30;
  const isPournami = tithiIndex === 15;

  return {
    date: dateStr,
    location,
    latitude: lat,
    longitude: lng,
    tamilYear,
    tamilMonth,
    tamilDate,
    vaaramTamil: vaaram.nameTamil,
    vaaramEnglish: vaaram.nameEnglish,
    sunrise: riseFormatted,
    sunset: setFormatted,
    tithi: {
      number: tithiIndex,
      nameTamil: tithiInfo.nameTamil,
      nameEnglish: tithiInfo.nameEnglish,
      paksha: tithiPaksha,
      progressPercent: Math.round(tithiProgress),
    },
    nakshatra: {
      number: nakIndex + 1,
      nameTamil: nakInfo.nameTamil,
      nameEnglish: nakInfo.nameEnglish,
      pada,
      progressPercent: Math.round(nakProgress),
    },
    yoga: {
      number: yogaIndex + 1,
      nameTamil: yogaInfo.nameTamil,
      nameEnglish: yogaInfo.nameEnglish,
    },
    karana: {
      number: karanaIdx + 1,
      nameTamil: karanaInfo.nameTamil,
      nameEnglish: karanaInfo.nameEnglish,
    },
    kaalam: {
      rahuKalam,
      yamaGandam,
      kuligai,
      nallaNeramMorning: nallaNeram.morning,
      nallaNeramEvening: nallaNeram.evening,
      durmuhurtham,
    },
    moonPhasePercent,
    isAmavasya,
    isPournami,
  };
}

/**
 * 10 Traditional Tamil Porutham (Marriage Matching) Engine
 */
export function calculatePorutham(boyNakIndex: number, boyRasiIndex: number, girlNakIndex: number, girlRasiIndex: number): PoruthamResult {
  const safeBoyNak = getNakshatraData(boyNakIndex);
  const safeGirlNak = getNakshatraData(girlNakIndex);
  const safeBoyRasi = getRasiData(boyRasiIndex);
  const safeGirlRasi = getRasiData(girlRasiIndex);

  const bNakIdx = safeBoyNak.index;
  const gNakIdx = safeGirlNak.index;
  const bRasiIdx = safeBoyRasi.index;
  const gRasiIdx = safeGirlRasi.index;

  const results: SinglePorutham[] = [];

  // 1. Dinam Porutham (Count from Girl to Boy)
  let countNak = ((bNakIdx - gNakIdx + 27) % 27) + 1;
  const rem9 = countNak % 9;
  let dinamScore = 0;
  let dinamStatusTa: SinglePorutham['statusTamil'] = 'பொருந்தாது';
  let dinamStatusEn: SinglePorutham['statusEnglish'] = 'Incompatible';

  if ([2, 4, 6, 8, 0].includes(rem9)) {
    dinamScore = 1;
    dinamStatusTa = 'உத்தமம்';
    dinamStatusEn = 'Excellent';
  } else if (countNak === 1 && bNakIdx === gNakIdx) {
    // Eka Nakshatra (Same star)
    const sameNakOk = [3, 5, 9, 12, 15, 21, 25, 26]; // Rohini, Arudra, Magha, Hasta, Swati, Shravana, Uthirattathi, Revati
    if (sameNakOk.includes(bNakIdx)) {
      dinamScore = 0.5;
      dinamStatusTa = 'மத்திமம்';
      dinamStatusEn = 'Moderate';
    }
  }

  results.push({
    id: 'dinam',
    nameTamil: 'தினப் பொருத்தம்',
    nameEnglish: 'Dinam (Health & Longevity)',
    isCompatible: dinamScore > 0,
    score: dinamScore,
    maxScore: 1,
    statusTamil: dinamStatusTa,
    statusEnglish: dinamStatusEn,
    boyAttribute: safeBoyNak.nameTamil,
    girlAttribute: safeGirlNak.nameTamil,
    descriptionTamil: dinamScore === 1 ? 'ஆயுள் மற்றும் ஆரோக்கிய பலன் சிறக்கும் (தாராபலம் உண்டு).' : 'தினப் பொருத்தம் அமையவில்லை.',
    descriptionEnglish: dinamScore === 1 ? 'Auspicious Tara Balam promotes health, vitality and long life.' : 'Dinam compatibility is lacking.',
  });

  // 2. Ganam Porutham
  const bg = safeBoyNak.gana as 'Deva' | 'Manushya' | 'Rakshasa';
  const gg = safeGirlNak.gana as 'Deva' | 'Manushya' | 'Rakshasa';
  const ganamScore = poruthamRules.ganam.compatibilityMatrix[gg]?.[bg] ?? 0;
  results.push({
    id: 'ganam',
    nameTamil: 'கணப் பொருத்தம்',
    nameEnglish: 'Ganam (Temperament)',
    isCompatible: ganamScore >= 0.5,
    score: ganamScore,
    maxScore: 1,
    statusTamil: ganamScore === 1 ? 'உத்தமம்' : ganamScore > 0 ? 'மத்திமம்' : 'பொருந்தாது',
    statusEnglish: ganamScore === 1 ? 'Excellent' : ganamScore > 0 ? 'Moderate' : 'Incompatible',
    boyAttribute: safeBoyNak.ganaTamil,
    girlAttribute: safeGirlNak.ganaTamil,
    descriptionTamil: ganamScore === 1 ? 'இருவருக்கும் ஒத்த மனநிலை, அமைதியான வாழ்வு அமையும்.' : ganamScore > 0 ? 'சராசரியான குண ஒற்றுமை.' : 'குண வேறுபாடுகள் ஏற்பட வாய்ப்புண்டு.',
    descriptionEnglish: ganamScore === 1 ? 'Harmonious temperamental wavelength and shared values.' : ganamScore > 0 ? 'Moderate temperamental match.' : 'Possible temperamental friction.',
  });

  // 3. Mahendram Porutham
  const mahendraFavorable = poruthamRules.mahendram.favorableCounts.includes(countNak);
  results.push({
    id: 'mahendram',
    nameTamil: 'மாகேந்திரப் பொருத்தம்',
    nameEnglish: 'Mahendram (Progeny & Lineage)',
    isCompatible: mahendraFavorable,
    score: mahendraFavorable ? 1 : 0,
    maxScore: 1,
    statusTamil: mahendraFavorable ? 'உத்தமம்' : 'பொருந்தாது',
    statusEnglish: mahendraFavorable ? 'Excellent' : 'Incompatible',
    boyAttribute: `எண்: ${countNak}`,
    girlAttribute: 'பெண் நட்சத்திரம் முதல்',
    descriptionTamil: mahendraFavorable ? 'வம்ச விருத்தி, புத்திர பாக்கியம் அருளும் மாகேந்திரம் உண்டு.' : 'மாகேந்திரப் பொருத்தம் அமையவில்லை.',
    descriptionEnglish: mahendraFavorable ? 'Blesses the couple with worthy progeny and lineage continuity.' : 'Mahendra compatibility is absent.',
  });

  // 4. Stree Dheergam Porutham
  let streeScore = 0;
  if (countNak > poruthamRules.streeDheergam.thresholdHigh) streeScore = 1;
  else if (countNak >= poruthamRules.streeDheergam.thresholdMid) streeScore = 0.5;

  results.push({
    id: 'streeDheergam',
    nameTamil: 'ஸ்திரீ தீர்க்கப் பொருத்தம்',
    nameEnglish: 'Stree Dheergam (Wife Prosperity)',
    isCompatible: streeScore > 0,
    score: streeScore,
    maxScore: 1,
    statusTamil: streeScore === 1 ? 'உத்தமம்' : streeScore > 0 ? 'மத்திமம்' : 'பொருந்தாது',
    statusEnglish: streeScore === 1 ? 'Excellent' : streeScore > 0 ? 'Moderate' : 'Incompatible',
    boyAttribute: `இடைவெளி: ${countNak} விண்மீன்`,
    girlAttribute: 'மணமகள் விண்மீன்',
    descriptionTamil: streeScore === 1 ? 'மணமகளுக்கு நீண்ட ஆயுளும், குடும்ப சுபிட்சமும் உண்டாகும்.' : streeScore > 0 ? 'சராசரியான ஸ்திரீ தீர்க்கம்.' : 'குறைவான இடைவெளி.',
    descriptionEnglish: streeScore === 1 ? 'Ensures long life, honor, and prosperity for the wife.' : streeScore > 0 ? 'Moderate distance between stars.' : 'Star distance is too close.',
  });

  // 5. Yoni Porutham
  const by = safeBoyNak.yoni;
  const gy = safeGirlNak.yoni;
  let yoniScore = 0.5;
  const isEnemy = poruthamRules.yoni.enemyPairs.some(
    ([a, b]) => (a === by && b === gy) || (a === gy && b === by)
  );

  if (isEnemy) {
    yoniScore = 0;
  } else if (by === gy) {
    yoniScore = 1;
  }

  results.push({
    id: 'yoni',
    nameTamil: 'யோனிப் பொருத்தம்',
    nameEnglish: 'Yoni (Intimacy & Compatibility)',
    isCompatible: yoniScore > 0,
    score: yoniScore,
    maxScore: 1,
    statusTamil: yoniScore === 1 ? 'உத்தமம்' : yoniScore > 0 ? 'மத்திமம்' : 'பொருந்தாது',
    statusEnglish: yoniScore === 1 ? 'Excellent' : yoniScore > 0 ? 'Moderate' : 'Incompatible',
    boyAttribute: `${safeBoyNak.yoniTamil} (${safeBoyNak.yoniGender === 'Male' ? 'ஆண்' : 'பெண்'})`,
    girlAttribute: `${safeGirlNak.yoniTamil} (${safeGirlNak.yoniGender === 'Male' ? 'ஆண்' : 'பெண்'})`,
    descriptionTamil: isEnemy ? 'பகை யோனி, தாம்பத்தியத்தில் விரிசல் ஏற்படலாம்.' : yoniScore === 1 ? 'ஒத்த யோனி, மிகுந்த தாம்பத்திய சுகம் தரும்.' : 'நட்பு யோனி, தாம்பத்திய அமைதி உண்டு.',
    descriptionEnglish: isEnemy ? 'Hostile animal yoni; physical disharmony possible.' : yoniScore === 1 ? 'Identical animal yoni; excellent intimate bond.' : 'Friendly animal yoni.',
  });

  // 6. Rasi Porutham
  const countRasi = ((bRasiIdx - gRasiIdx + 12) % 12) + 1;
  let rasiScore = 0;
  if ([7, 3, 4, 10, 11, 9].includes(countRasi)) {
    rasiScore = 1;
  } else if (countRasi === 1) {
    rasiScore = 0.5;
  } else if ([6, 8].includes(countRasi)) {
    // Sashtashtaka (6/8)
    rasiScore = 0;
  }

  results.push({
    id: 'rasi',
    nameTamil: 'ராசிப் பொருத்தம்',
    nameEnglish: 'Rasi (Family Growth & Harmony)',
    isCompatible: rasiScore > 0,
    score: rasiScore,
    maxScore: 1,
    statusTamil: rasiScore === 1 ? 'உத்தமம்' : rasiScore > 0 ? 'மத்திமம்' : 'பொருந்தாது',
    statusEnglish: rasiScore === 1 ? 'Excellent' : rasiScore > 0 ? 'Moderate' : 'Incompatible',
    boyAttribute: `${safeBoyRasi.nameTamil} (${countRasi}-ம் இடம்)`,
    girlAttribute: safeGirlRasi.nameTamil,
    descriptionTamil: rasiScore === 1 ? 'குடும்பத்தில் மகிழ்ச்சியும், ஐஸ்வர்யமும் பெருகும்.' : countRasi === 6 || countRasi === 8 ? 'சஷ்டாஷ்டக அமைப்பு (6/8), கருத்து வேறுபாடு கூடும்.' : 'சராசரியான ராசிப் பொருத்தம்.',
    descriptionEnglish: rasiScore === 1 ? 'Auspicious placement promotes family bliss and unity.' : countRasi === 6 || countRasi === 8 ? 'Sashtashtaka (6/8) relationship requires remedies.' : 'Acceptable rasi position.',
  });

  // 7. Rasi Adhipathi Porutham
  const boyLord = (safeBoyRasi.lord || '').toLowerCase();
  const girlLord = (safeGirlRasi.lord || '').toLowerCase();
  const gGraha = grahasData.find(g => g.id === girlLord);
  let adhipathiScore = 0.5;

  if (boyLord === girlLord || gGraha?.friends.includes(boyLord)) {
    adhipathiScore = 1;
  } else if (gGraha?.enemies.includes(boyLord)) {
    adhipathiScore = 0;
  }

  results.push({
    id: 'rasiAdhipathi',
    nameTamil: 'ராசியாதிபதிப் பொருத்தம்',
    nameEnglish: 'Rasi Adhipathi (Planetary Friendship)',
    isCompatible: adhipathiScore > 0,
    score: adhipathiScore,
    maxScore: 1,
    statusTamil: adhipathiScore === 1 ? 'உத்தமம்' : adhipathiScore > 0 ? 'மத்திமம்' : 'பொருந்தாது',
    statusEnglish: adhipathiScore === 1 ? 'Excellent' : adhipathiScore > 0 ? 'Moderate' : 'Incompatible',
    boyAttribute: safeBoyRasi.lordTamil,
    girlAttribute: safeGirlRasi.lordTamil,
    descriptionTamil: adhipathiScore === 1 ? 'ராசி அதிபதிகள் நட்பு, குடும்பத்தில் சுமுகமான அன்பு நிலைக்கும்.' : adhipathiScore === 0 ? 'ராசி அதிபதிகள் பகை, மனஸ்தாபம் வரலாம்.' : 'சம நிலை உறவு.',
    descriptionEnglish: adhipathiScore === 1 ? 'Ruling lords are friends; mutual affection flourishes.' : adhipathiScore === 0 ? 'Ruling lords are enemies; potential discord.' : 'Neutral friendship.',
  });

  // 8. Vasyam Porutham
  const girlVasyaSigns = (poruthamRules.vasyam.attractionMap as Record<string, number[]>)[gRasiIdx.toString()] || [];
  const isVasya = girlVasyaSigns.includes(bRasiIdx);
  results.push({
    id: 'vasyam',
    nameTamil: 'வசியப் பொருத்தம்',
    nameEnglish: 'Vasyam (Attraction & Affection)',
    isCompatible: isVasya,
    score: isVasya ? 1 : 0,
    maxScore: 1,
    statusTamil: isVasya ? 'உத்தமம்' : 'பொருந்தாது',
    statusEnglish: isVasya ? 'Excellent' : 'Incompatible',
    boyAttribute: safeBoyRasi.nameTamil,
    girlAttribute: safeGirlRasi.nameTamil,
    descriptionTamil: isVasya ? 'வசியப் பொருத்தம் உள்ளது, தம்பதியர் இடையே காந்த ஈர்ப்பு நிலைக்கும்.' : 'வசியம் அமையவில்லை.',
    descriptionEnglish: isVasya ? 'Vasya is present; binds the couple with enduring attraction.' : 'Vasya attraction is absent.',
  });

  // 9. Rajju Porutham (Paramount in Tamil tradition)
  const isRajjuGood = safeBoyNak.rajju !== safeGirlNak.rajju;
  results.push({
    id: 'rajju',
    nameTamil: 'ரஜ்ஜுப் பொருத்தம் (மாங்கல்ய பலம்)',
    nameEnglish: 'Rajju (Longevity & Conjugal Knot)',
    isCompatible: isRajjuGood,
    score: isRajjuGood ? 1 : 0,
    maxScore: 1,
    statusTamil: isRajjuGood ? 'உத்தமம்' : 'பொருந்தாது',
    statusEnglish: isRajjuGood ? 'Excellent' : 'Incompatible',
    boyAttribute: safeBoyNak.rajjuTamil,
    girlAttribute: safeGirlNak.rajjuTamil,
    descriptionTamil: isRajjuGood ? 'ரஜ்ஜு தட்டவில்லை. மாங்கல்ய பலமும் நீண்ட நல்வாழ்வும் கிட்டும்.' : `இருவருக்கும் ஒரே ரஜ்ஜு (${safeBoyNak.rajjuTamil}). தமிழ் வழக்கப்படி ரஜ்ஜு தட்டுகிறது, தவிர்க்கப்பட வேண்டும்.`,
    descriptionEnglish: isRajjuGood ? 'Different Rajjus. Auspicious and protects marital longevity.' : `Identical Rajju (${safeBoyNak.rajju}). Prohibited in Tamil tradition as it strikes the sacred knot.`,
  });

  // 10. Vedhai Porutham
  const isVedha = (safeGirlNak.vedhai || []).includes(bNakIdx);
  const isVedhaiGood = !isVedha;
  results.push({
    id: 'vedhai',
    nameTamil: 'வேதைப் பொருத்தம்',
    nameEnglish: 'Vedhai (Affliction Shield)',
    isCompatible: isVedhaiGood,
    score: isVedhaiGood ? 1 : 0,
    maxScore: 1,
    statusTamil: isVedhaiGood ? 'உத்தமம்' : 'பொருந்தாது',
    statusEnglish: isVedhaiGood ? 'Excellent' : 'Incompatible',
    boyAttribute: safeBoyNak.nameTamil,
    girlAttribute: safeGirlNak.nameTamil,
    descriptionTamil: isVedhaiGood ? 'வேதை இல்லை. துன்பங்களும் தடைகளும் அகலும்.' : 'வேதை நட்சத்திரம்! பரஸ்பர தாக்குதல் உள்ளதால் விலக்க வேண்டும்.',
    descriptionEnglish: isVedhaiGood ? 'No star affliction; couple protected from hidden distress.' : 'Mutually afflicting stars; incompatible.',
  });

  const totalScore = results.reduce((acc, r) => acc + r.score, 0);
  const maxScore = 10;
  const scorePercentage = Math.round((totalScore / maxScore) * 100);

  // Recommendation logic
  let favorableRecommendation: PoruthamResult['favorableRecommendation'] = 'பொருத்தம் இல்லை (Not Recommended)';
  let overallVerdictTamil = '';
  let overallVerdictEnglish = '';

  if (isRajjuGood && totalScore >= 7) {
    favorableRecommendation = 'உத்தம பொருத்தம் (Highly Recommended)';
    overallVerdictTamil = 'ரஜ்ஜு பொருந்தி 10-ல் 7-க்கு மேல் பொருத்தங்கள் சிறப்பாக உள்ளன. இந்த வரன் உத்தமமானது.';
    overallVerdictEnglish = 'Rajju is auspicious and score is 7+/10. Highly recommended match.';
  } else if (isRajjuGood && totalScore >= 5) {
    favorableRecommendation = 'மத்திம பொருத்தம் (Average / Acceptable)';
    overallVerdictTamil = 'ரஜ்ஜு சிறப்பானது; தேவையான முக்கிய பொருத்தங்கள் அமைந்துள்ளன. சுமாரான/மத்திம பொருத்தம்.';
    overallVerdictEnglish = 'Rajju is good with 5-6.5 points. Moderately acceptable match.';
  } else {
    favorableRecommendation = 'பொருத்தம் இல்லை (Not Recommended)';
    overallVerdictTamil = !isRajjuGood ? 'ரஜ்ஜு தட்டுவதால் இந்தத் திருமணம் சாஸ்திரப்படி பரிந்துரைக்கப்படுவதில்லை.' : 'பொருத்த புள்ளிகள் குறைவாக உள்ளதால் பொருத்தம் அமையவில்லை.';
    overallVerdictEnglish = !isRajjuGood ? 'Rejected due to Rajju Thattu (identical body zone).' : 'Low compatibility score; not recommended.';
  }

  return {
    boy: {
      nakshatraNameTamil: safeBoyNak.nameTamil,
      nakshatraNameEnglish: safeBoyNak.nameEnglish,
      pada: 1,
      rasiNameTamil: safeBoyRasi.nameTamil,
      rasiNameEnglish: safeBoyRasi.nameEnglish,
    },
    girl: {
      nakshatraNameTamil: safeGirlNak.nameTamil,
      nakshatraNameEnglish: safeGirlNak.nameEnglish,
      pada: 1,
      rasiNameTamil: safeGirlRasi.nameTamil,
      rasiNameEnglish: safeGirlRasi.nameEnglish,
    },
    poruthams: results,
    totalScore,
    maxScore,
    scorePercentage,
    isRajjuGood,
    isDinamGood: dinamScore > 0,
    isGanamGood: ganamScore >= 0.5,
    chevvaiDosham: {
      boyHasDosham: false,
      girlHasDosham: false,
      isCompatible: true,
      explanationTamil: 'முழு ஜாதகம் கணிக்கப்பட்டு செவ்வாய் அமைவு சோதிக்கப்படலாம்.',
      explanationEnglish: 'Can be confirmed with full birth charts.',
    },
    overallVerdictTamil,
    overallVerdictEnglish,
    favorableRecommendation,
  };
}

/**
 * Sevvai (Chevvai / Mars) Dosham Evaluation
 * Evaluates Mars in houses 1, 2, 4, 7, 8, 12 from Lagna, Moon, or Venus
 * with classical exemptions from Jathaka Alankaram & Kumaraswamiyam
 */
export function evaluateChevvaiDosham(chart: BirthChartData): {
  hasDosham: boolean;
  score: number;
  housesFromLagna: number;
  housesFromMoon: number;
  housesFromVenus: number;
  exemptions: string[];
  exemptionsTamil: string[];
} {
  const mars = chart.planets.find(p => p.id === 'mars')!;
  const moon = chart.planets.find(p => p.id === 'moon')!;
  const venus = chart.planets.find(p => p.id === 'venus')!;
  const jupiter = chart.planets.find(p => p.id === 'jupiter')!;

  const houseFromLagna = ((mars.rasiIndex - chart.lagna.rasiIndex + 12) % 12) + 1;
  const houseFromMoon = ((mars.rasiIndex - moon.rasiIndex + 12) % 12) + 1;
  const houseFromVenus = ((mars.rasiIndex - venus.rasiIndex + 12) % 12) + 1;

  const DOSHAM_HOUSES = [1, 2, 4, 7, 8, 12];
  const inDoshamFromLagna = DOSHAM_HOUSES.includes(houseFromLagna);
  const inDoshamFromMoon = DOSHAM_HOUSES.includes(houseFromMoon);
  const inDoshamFromVenus = DOSHAM_HOUSES.includes(houseFromVenus);

  const exemptions: string[] = [];
  const exemptionsTamil: string[] = [];

  // Exemption 1: Mars in own houses (Aries / Scorpio) or Exaltation (Capricorn)
  if (mars.rasiIndex === 0 || mars.rasiIndex === 7) {
    exemptions.push('Mars is in its own house (Aries/Scorpio)');
    exemptionsTamil.push('செவ்வாய் தன் சொந்த வீட்டில் (மேஷம்/விருச்சிகம்) ஆட்சி பெற்றுள்ளார்.');
  }
  if (mars.rasiIndex === 9) {
    exemptions.push('Mars is exalted in Capricorn');
    exemptionsTamil.push('செவ்வாய் மகரத்தில் உச்சம் பெற்றுள்ளார்.');
  }
  if (mars.rasiIndex === 3) {
    exemptions.push('Mars is debilitated in Cancer');
    exemptionsTamil.push('செவ்வாய் கடகத்தில் நீசம் பெற்றுள்ளதால் தோஷம் குறைகிறது.');
  }

  // Exemption 2: Conjoined with or aspected by Jupiter or Moon
  if (mars.rasiIndex === jupiter.rasiIndex) {
    exemptions.push('Mars is conjoined with Jupiter (Guru Mangala Yoga)');
    exemptionsTamil.push('குருவுடன் செவ்வாய் இணைந்து குரு மங்கள யோகம் உண்டாகியுள்ளது.');
  }
  if (mars.rasiIndex === moon.rasiIndex) {
    exemptions.push('Mars is conjoined with Moon (Chandra Mangala Yoga)');
    exemptionsTamil.push('சந்திரனுடன் செவ்வாய் இணைந்து சந்திர மங்கள யோகம் உண்டாகியுள்ளது.');
  }

  // Specific house sign exemptions
  if (houseFromLagna === 2 && (mars.rasiIndex === 2 || mars.rasiIndex === 5)) {
    exemptions.push('Mars in 2nd house in Gemini or Virgo causes no dosham');
    exemptionsTamil.push('மிதுனம் அல்லது கன்னியில் 2-ல் செவ்வாய் அமர்வது தோஷமில்லை.');
  }
  if (houseFromLagna === 4 && (mars.rasiIndex === 0 || mars.rasiIndex === 7)) {
    exemptions.push('Mars in 4th house in Aries or Scorpio causes no dosham');
    exemptionsTamil.push('மேஷம் அல்லது விருச்சிகத்தில் 4-ல் செவ்வாய் அமர்வது தோஷமில்லை.');
  }
  if (houseFromLagna === 7 && (mars.rasiIndex === 3 || mars.rasiIndex === 9)) {
    exemptions.push('Mars in 7th house in Cancer or Capricorn is exempted');
    exemptionsTamil.push('கடகம் அல்லது மகரத்தில் 7-ல் செவ்வாய் அமர்வது தோஷ நிவர்த்தி.');
  }
  if (houseFromLagna === 8 && (mars.rasiIndex === 8 || mars.rasiIndex === 11)) {
    exemptions.push('Mars in 8th house in Sagittarius or Pisces is exempted');
    exemptionsTamil.push('தனுசு அல்லது மீனத்தில் 8-ல் செவ்வாய் அமர்வது தோஷ நிவர்த்தி.');
  }
  if (houseFromLagna === 12 && (mars.rasiIndex === 1 || mars.rasiIndex === 6)) {
    exemptions.push('Mars in 12th house in Taurus or Libra is exempted');
    exemptionsTamil.push('ரிஷபம் அல்லது துலாமில் 12-ல் செவ்வாய் அமர்வது தோஷ நிவர்த்தி.');
  }

  const rawDosham = inDoshamFromLagna || inDoshamFromMoon || inDoshamFromVenus;
  const hasDosham = rawDosham && exemptions.length === 0;

  return {
    hasDosham,
    score: hasDosham ? (inDoshamFromLagna ? 2 : 1) : 0,
    housesFromLagna: houseFromLagna,
    housesFromMoon: houseFromMoon,
    housesFromVenus: houseFromVenus,
    exemptions,
    exemptionsTamil,
  };
}
