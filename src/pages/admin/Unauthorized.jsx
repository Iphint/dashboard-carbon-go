import { ShieldOff, ArrowLeft } from 'lucide-react';
import { useAdminLanguage } from '../../context/LanguageContext';

export default function Unauthorized() {
  const { t } = useAdminLanguage();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('accessDenied')}</h1>
        <p className="text-gray-500 mb-8">
          {t('accessDeniedDesc')}
        </p>
        <a
          href="/admin/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToLogin')}
        </a>
      </div>
    </div>
  );
}
