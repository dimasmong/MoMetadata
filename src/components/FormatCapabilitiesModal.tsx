import React from 'react';
import { Modal } from './common/Modal';
import { getAllCapabilities } from '../core/capabilityRegistry';
import { useLanguage } from '../i18n';
import { Badge } from './common/Badge';
import { Check, X, AlertTriangle } from 'lucide-react';

export interface FormatCapabilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormatCapabilitiesModal: React.FC<FormatCapabilitiesModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const capabilities = getAllCapabilities();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.capabilitiesModal.title}
      subtitle={t.capabilitiesModal.subtitle}
      maxWidth="4xl"
    >
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-semibold">
              <th className="py-2.5 px-3">{t.capabilitiesModal.formatCol}</th>
              <th className="py-2.5 px-3">{t.capabilitiesModal.categoryCol}</th>
              <th className="py-2.5 px-3 text-center">{t.capabilitiesModal.readCol}</th>
              <th className="py-2.5 px-3 text-center">{t.capabilitiesModal.editCol}</th>
              <th className="py-2.5 px-3 text-center">{t.capabilitiesModal.removeCol}</th>
              <th className="py-2.5 px-3 text-center">{t.capabilitiesModal.verifyCol}</th>
              <th className="py-2.5 px-3">{t.capabilitiesModal.limitationsCol}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {capabilities.map((cap) => (
              <tr
                key={cap.format}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                  {cap.format}
                  <div className="text-[10px] text-slate-400 font-normal">
                    {cap.extensions.map((e) => `.${e}`).join(', ')}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <Badge variant="slate" size="sm">
                    {cap.category}
                  </Badge>
                </td>
                <td className="py-3 px-3 text-center">
                  {cap.readSupport ? (
                    <span className="inline-flex text-emerald-600 dark:text-emerald-400" title="Supported">
                      <Check className="w-4 h-4 mx-auto" />
                    </span>
                  ) : (
                    <span className="inline-flex text-slate-400" title="Unsupported">
                      <X className="w-4 h-4 mx-auto" />
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-center">
                  {cap.editSupport ? (
                    <span className="inline-flex text-emerald-600 dark:text-emerald-400" title="Supported">
                      <Check className="w-4 h-4 mx-auto" />
                    </span>
                  ) : (
                    <span className="inline-flex text-slate-400" title="Unsupported">
                      <X className="w-4 h-4 mx-auto" />
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-center">
                  {cap.removeSupport ? (
                    <span className="inline-flex text-emerald-600 dark:text-emerald-400" title="Supported">
                      <Check className="w-4 h-4 mx-auto" />
                    </span>
                  ) : (
                    <span className="inline-flex text-slate-400" title="Unsupported">
                      <X className="w-4 h-4 mx-auto" />
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-center">
                  {cap.verificationSupport ? (
                    <span className="inline-flex text-emerald-600 dark:text-emerald-400" title="Supported">
                      <Check className="w-4 h-4 mx-auto" />
                    </span>
                  ) : (
                    <span className="inline-flex text-slate-400" title="Unsupported">
                      <X className="w-4 h-4 mx-auto" />
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
                  {cap.limitations.map((lim, i) => (
                    <div key={i} className="flex items-start gap-1.5 mb-1 last:mb-0">
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <span>{lim}</span>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};
