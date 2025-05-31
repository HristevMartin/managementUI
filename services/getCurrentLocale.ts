import Cookies from 'js-cookie';

export function getCurrentLocale() {
    let lang = Cookies.get('NEXT_LOCALE');
    return lang
}   