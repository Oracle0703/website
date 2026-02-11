import { cookies } from "next/headers";
import { getThemeFromCookieValue, THEME_COOKIE } from "./theme";

export const getTheme = () => {
  const cookieValue = cookies().get(THEME_COOKIE)?.value;
  return getThemeFromCookieValue(cookieValue);
};
