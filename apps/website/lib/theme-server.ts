import { cookies } from "next/headers";
import { getThemeFromCookieValue, THEME_COOKIE } from "./theme";

export const getTheme = async () => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(THEME_COOKIE)?.value;
  return getThemeFromCookieValue(cookieValue);
};
