import { Inbox } from 'lucide-react';
import { useAdminLanguage } from '../../context/LanguageContext';

export default function EmptyState({ title, description, icon: Icon = Inbox }) {
  const { t } = useAdminLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title || t('noData')}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">{description || t('noDataDesc')}</p>
    </div>
  );
}
