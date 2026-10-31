import React from 'react';
import { Camera, Image, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';
import { SAMPLE_FILES, SampleFileDef } from './sampleFiles';

interface SampleGalleryProps {
  onSelectSample: (sample: SampleFileDef) => void;
  isLoading?: boolean;
}

export const SampleGallery: React.FC<SampleGalleryProps> = ({ onSelectSample, isLoading }) => {
  const { t } = useLanguage();

  const getIcon = (_category: string, id: string) => {
    if (id === 'sample-photo') return <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    if (id === 'sample-painting') return <Image className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    if (id === 'sample-illustration') return <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    return <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#243A73] dark:text-blue-400" />
            {t.samplesTitle}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {t.samplesSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SAMPLE_FILES.map((sample) => (
          <button
            key={sample.id}
            onClick={() => onSelectSample(sample)}
            disabled={isLoading}
            className="group flex flex-col p-3.5 rounded-xl text-left transition-all duration-200
              glass-card hover:border-[#243A73]/70 dark:hover:border-blue-500/70 hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 group-hover:scale-105 transition-transform">
                {getIcon(sample.category, sample.id)}
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {sample.badge}
              </span>
            </div>

            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-[#243A73] dark:group-hover:text-blue-400 transition-colors">
              {t[sample.titleKey]}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {t[sample.descKey]}
            </p>

            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold text-[#243A73] dark:text-blue-400">
              <span>{t.uploadBrowse}</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
