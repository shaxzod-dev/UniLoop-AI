import { uz } from "@/i18n/messages/uz";

export const messages = uz;

export type TranslationKey = keyof typeof messages;

export function t(key: TranslationKey): string {
  return messages[key];
}
