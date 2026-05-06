import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "es" | "en")) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`./locales/${locale}.json`)).default;
  const flat = (messages as { translation?: Record<string, unknown> }).translation ?? messages;

  return { locale, messages: flat };
});
