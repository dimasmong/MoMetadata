import React from 'react';
import { 
  ShieldCheck, 
  FileStack, 
  Zap, 
  CheckCircle2, 
  EyeOff, 
  Layers 
} from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';

export const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#243A73] dark:text-[#8EA9ED]" />,
      title: t.featLocalTitle,
      desc: t.featLocalDesc
    },
    {
      icon: <FileStack className="w-6 h-6 text-emerald-500" />,
      title: t.featFormatsTitle,
      desc: t.featFormatsDesc
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: t.featLosslessTitle,
      desc: t.featLosslessDesc
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-blue-500" />,
      title: t.featVerificationTitle,
      desc: t.featVerificationDesc
    },
    {
      icon: <EyeOff className="w-6 h-6 text-purple-500" />,
      title: t.featPrivacyTitle,
      desc: t.featPrivacyDesc
    },
    {
      icon: <Layers className="w-6 h-6 text-indigo-500" />,
      title: t.featBatchTitle,
      desc: t.featBatchDesc
    }
  ];

  return (
    <section id="features-section" className="py-12 sm:py-16 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.featuresHeading}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {t.featuresSubheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl glass-card hover:border-[#243A73]/50 dark:hover:border-[#8EA9ED]/50 transition-all duration-200"
            >
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 w-fit mb-4">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                {feat.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
