import { cookies } from "next/headers";
import { getLocaleFromCookieValue, LOCALE_COOKIE } from "./i18n-core";

export const getLocale = () => {
  const cookieValue = cookies().get(LOCALE_COOKIE)?.value;
  return getLocaleFromCookieValue(cookieValue);
};
