import { cookies } from "next/headers";
import { getLocaleFromCookieValue, LOCALE_COOKIE } from "./i18n-core";

export const getLocale = async () => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE)?.value;
  return getLocaleFromCookieValue(cookieValue);
};
