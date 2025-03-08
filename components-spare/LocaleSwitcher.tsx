import { useLocale, useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  return (
    <div style={{border: '2px solid grey', borderRadius: '6px' , width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}>
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
