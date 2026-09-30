/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, LanguageType } from '../engine/types.ts';
import { User, Search, Trash2, Download, Upload, Plus, Calendar, MapPin, Eye } from 'lucide-react';

interface ProfilesViewProps {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onDeleteProfile: (id: string) => void;
  onSaveProfile: (profile: UserProfile) => void;
  language: LanguageType;
}

export const ProfilesView: React.FC<ProfilesViewProps> = ({
  profiles,
  onSelectProfile,
  onDeleteProfile,
  onSaveProfile,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = profiles.filter(
    p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.place.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profiles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jothidam_profiles_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = event => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            parsed.forEach(p => {
              if (p.name && p.date && p.time) {
                onSaveProfile(p);
              }
            });
          }
        } catch (err) {
          console.error('Import error', err);
        }
      };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            <span>{language === 'ta' ? 'சேமிக்கப்பட்ட ஜாதகங்கள்' : 'Saved Jathagam Profiles'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'ta'
              ? 'உங்கள் சாதனத்திலேயே (Offline Local Storage) பாதுகாப்பாக சேமிக்கப்படும்.'
              : 'Stored safely in offline local storage on your device.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ta' ? 'ஏற்றுமதி (JSON)' : 'Export JSON'}</span>
          </button>

          {/* Import JSON */}
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'ta' ? 'இறக்குமதி' : 'Import'}</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder={language === 'ta' ? 'பெயர் அல்லது ஊர் வாரியாக தேடுங்கள்...' : 'Search by name or place...'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
        />
      </div>

      {/* Profile Cards */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
          <User className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">
            {language === 'ta' ? 'சுயவிவரங்கள் எதுவும் கிடைக்கவில்லை.' : 'No profiles found.'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ta'
              ? 'ஜாதக கணிப்பு பக்கத்தில் விவரங்களை உள்ளிட்டு "சுயவிவரமாக சேமி" பொத்தானை அழுத்தவும்.'
              : 'Enter birth details on the Jathagam tab and click "Save Profile".'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-100 font-tamil truncate">
                    {p.name}
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                    {p.gender === 'male' ? (language === 'ta' ? 'ஆண்' : 'Male') : (language === 'ta' ? 'பெண்' : 'Female')}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>{p.date} · {p.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate">{p.place}</span>
                  </div>
                </div>

                {p.notes && (
                  <p className="mt-2 text-xs text-slate-500 italic line-clamp-2">
                    "{p.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onSelectProfile(p)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'ஜாதகம் பார்க்க' : 'Open Chart'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(language === 'ta' ? 'இந்த சுயவிவரத்தை நீக்கவா?' : 'Delete this profile?')) {
                      onDeleteProfile(p.id);
                    }
                  }}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                  title={language === 'ta' ? 'நீக்கு' : 'Delete'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
