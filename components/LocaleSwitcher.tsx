import { useLocale, useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  return (
    <div className='flex items-center h-8 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-2'>
      <LocaleSwitcherSelect defaultValue={locale} label={t('label')}>
        {routing.locales.map((cur) => (
          <option key={cur} value={cur}>
            {t('locale', { locale: cur })}
          </option>
        ))}
      </LocaleSwitcherSelect>
    </div>
  );
}
