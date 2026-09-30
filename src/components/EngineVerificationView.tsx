/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { runEngineTests, TestResult, REFERENCE_CHARTS } from '../engine/test-suite.ts';
import { LanguageType } from '../engine/types.ts';
import { CheckCircle2, XCircle, RefreshCw, BookOpen, ShieldCheck, HelpCircle } from 'lucide-react';

interface EngineVerificationViewProps {
  language: LanguageType;
}

export const EngineVerificationView: React.FC<EngineVerificationViewProps> = ({ language }) => {
  const [testResults, setTestResults] = useState<TestResult[]>(() => runEngineTests());

  const handleRerun = () => {
    setTestResults(runEngineTests());
  };

  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.passed).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Run Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {language === 'ta' ? 'வானியல் & ஜோதிட கணிப்பு சோதனைகள்' : 'Astronomical & Astrological Engine Verification'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-tamil">
            {language === 'ta'
              ? '5 புகழ்பெற்ற வரலாற்று ஜாதகங்களைக் கொண்டு லக்னம், சூரியன், சந்திரன் மற்றும் நட்சத்திரப் பாதங்கள் சரிபார்க்கப்படுகின்றன.'
              : 'Verified against 5 documented historical charts testing Ascendant, Sun, Moon, and Nakshatra positions.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
            {passedTests} / {totalTests} {language === 'ta' ? 'தேர்வுகள் வெற்றி' : 'Passed'}
          </div>
          <button
            onClick={handleRerun}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ta' ? 'மீண்டும் சோதி' : 'Re-run Tests'}</span>
          </button>
        </div>
      </div>

      {/* Test Result Cards */}
      <div className="space-y-4">
        {testResults.map((res, idx) => {
          const ref = REFERENCE_CHARTS[idx];
          return (
            <div
              key={res.chartId}
              className={`rounded-xl border p-4 shadow-md transition-all ${
                res.passed
                  ? 'border-emerald-900/40 bg-slate-950/80'
                  : 'border-rose-900/40 bg-slate-950/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {res.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <h3 className="text-base font-bold text-slate-100">{res.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({ref.input.date} · {ref.input.time} IST · {ref.input.place})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 pl-6">
                    {ref.description}
                  </p>
                </div>

                <div className="pl-6 sm:pl-0">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                      res.passed
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {res.passed ? (language === 'ta' ? 'துல்லியமானது (PASS)' : 'PASSED') : (language === 'ta' ? 'சரிபார்க்கவும் (FAIL)' : 'FAILED')}
                  </span>
                </div>
              </div>

              {/* Checks Table */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800">
                      <th className="py-2 px-3">{language === 'ta' ? 'அளவுரு' : 'Celestial Item'}</th>
                      <th className="py-2 px-3">{language === 'ta' ? 'எதிர்பார்க்கப்படும் நிலை' : 'Expected'}</th>
                      <th className="py-2 px-3">{language === 'ta' ? 'கணிக்கப்பட்ட நிலை' : 'Computed'}</th>
                      <th className="py-2 px-3 text-center">{language === 'ta' ? 'முடிவு' : 'Match'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {res.checks.map((chk, cIdx) => (
                      <tr key={cIdx} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-medium text-slate-200">{chk.item}</td>
                        <td className="py-2 px-3 text-slate-400">{chk.expected}</td>
                        <td className="py-2 px-3 font-mono text-amber-200">{chk.computed}</td>
                        <td className="py-2 px-3 text-center">
                          {chk.match ? (
                            <span className="text-emerald-400 font-bold">✓ PASS</span>
                          ) : (
                            <span className="text-rose-400 font-bold">✗ FAIL</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Traditional Convention Citations & Explicit Uncertainties */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <BookOpen className="w-4 h-4" />
          <span>{language === 'ta' ? 'பாரம்பரிய விதிகள் மற்றும் மூல நூல்கள் (Sources & Conventions)' : 'Traditional Conventions & Citing Sources'}</span>
        </div>

        <div className="space-y-3 text-xs text-slate-300 font-tamil leading-relaxed">
          <p>
            <strong>1. அயனாம்சம் (Ayanamsa Convention):</strong> இந்திய அரசின் அதிகாரப்பூர்வ சித்ரபக்ஷ லஹிரி அயனாம்சம் (Lahiri Chitra Paksha - Standard J2000 value ~ 23° 51' 11") முதன்மையாகப் பயன்படுத்தப்படுகிறது. மேலும் கே.பி. (KP Ayanamsa) மற்றும் பி.வி. ராமன் (Raman Ayanamsa) தெரிவுகளும் வழங்கப்பட்டுள்ளன.
          </p>
          <p>
            <strong>2. திருமணப் பொருத்தம் (10 Poruthams):</strong> தமிழ்நாடு மரபுவழி பஞ்சாங்கங்களான <em>பாம்பு பஞ்சாங்கம்</em>, மற்றும் பாரம்பரிய ஜோதிட நூல்களான <em>ஜாதக அலங்காரம்</em>, <em>குமாரசுவாமியம்</em> ஆகியவற்றின் விதிகள் தொகுக்கப்பட்டுள்ளன.
          </p>
          <p>
            <strong>3. ரஜ்ஜு விதி (Rajju Convention):</strong> தமிழ்நாட்டில் &ldquo;ரஜ்ஜு தட்டினால் திருமணம் தவிர்க்கப்பட வேண்டும்&rdquo; என்ற தலையாய விதி பின்பற்றப்படுகிறது. குறிப்பாக சிரசு (தலை) மற்றும் கண்ட (கழுத்து) ரஜ்ஜு கடுமையானதாகக் கருதப்படுகிறது.
          </p>
        </div>

        {/* Known traditional variations explicitly explained */}
        <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'அறிந்து கொள்ள வேண்டிய மரபு வேறுபாடுகள் (Traditional Variations):' : 'Known Traditional Rule Variations (Explained instead of guessing):'}</span>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>மத்தியம ரஜ்ஜு மற்றும் ஏக நட்சத்திர விதி:</strong> ஒரே நட்சத்திரம் (ரோகிணி, திருவாதிரை, மகம், அஸ்தம், சுவாதி, திருவோணம், உத்திரட்டாதி, ரேவதி) அமைந்தால் சில மரபுகளில் சம்மதிக்கப்படுகிறது; மற்றவற்றில் தவிர்க்கப்படுகிறது. இந்த மென்பொருள் இதை &ldquo;மத்திமம்&rdquo; என வகைப்படுத்துகிறது.
            </li>
            <li>
              <strong>செவ்வாய் தோஷம் 2-ம் இடம்:</strong> வட இந்தியாவில் 2-ம் இடம் செவ்வாய் தோஷமாகச் சிலரால் கருதப்படுவதில்லை; ஆனால் தென்னிந்திய/தமிழ் மரபில் குடும்ப ஸ்தானமான 2-ம் இடம் தெளிவாக தோஷ ஸ்தானமாகவே கருதப்படுகிறது.
            </li>
            <li>
              <strong>ராகு-கேது உச்ச/நீச வீடுகள்:</strong> ரிஷபத்தில் ராகு உச்சம், விருச்சிகத்தில் கேது உச்சம் என்பது பெரும்பான்மை தமிழ் பஞ்சாங்க முறை. மிதுனம்/தனுசு என்பதும் சில உரைகளில் உண்டு.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
