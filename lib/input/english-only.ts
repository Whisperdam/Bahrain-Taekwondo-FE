import { toast } from "sonner";
import { useLangStore } from "@/lib/i18n/store";

/**
 * Everything typed into the app is kept in English, so records stay consistent.
 * The backend enforces the same rules (EnglishOnlyInput); filtering here means
 * people cannot type a character that would be refused later.
 *
 *   text      printable ASCII: English letters, digits and punctuation
 *   name      English letters, spaces, hyphens, apostrophes and full stops
 *   username  English letters, digits, dots, dashes and underscores
 */
export type EnglishKind = "text" | "name" | "username";

const NOT_ASCII = /[^\x20-\x7E]/g;
const NOT_ASCII_MULTILINE = /[^\x20-\x7E\n\r\t]/g;
const NOT_NAME = /[^A-Za-z .'-]/g;
const NOT_USERNAME = /[^A-Za-z0-9._-]/g;

export function toEnglish(value: string, kind: EnglishKind = "text", multiline = false): string {
  const ascii = value.replace(multiline ? NOT_ASCII_MULTILINE : NOT_ASCII, "");
  if (kind === "name") return ascii.replace(NOT_NAME, "");
  if (kind === "username") return ascii.replace(NOT_USERNAME, "");
  return ascii;
}

/** Input types where free text is typed; dates, numbers, passwords and files are left alone. */
const TEXT_TYPES = new Set(["text", "search", "email", "tel", "url"]);

export function isTextType(type: string | undefined): boolean {
  return type === undefined || TEXT_TYPES.has(type);
}

const MESSAGE = {
  en: "Please type in English only.",
  ar: "يرجى الكتابة باللغة الإنجليزية فقط.",
} as const;

/** Tells the person why nothing appeared. One toast at a time, however fast they type. */
export function warnEnglishOnly(): void {
  const lang = useLangStore.getState().lang;
  toast.warning(MESSAGE[lang] ?? MESSAGE.en, { id: "english-only", duration: 2500 });
}

/**
 * Cleans the value of the field that just changed, in place, so whoever handles the
 * change event (React state, react-hook-form) only ever sees English text. Keeps the
 * caret where it was.
 */
export function cleanEventTarget(
  target: HTMLInputElement | HTMLTextAreaElement,
  kind: EnglishKind,
  multiline: boolean,
): void {
  const raw = target.value;
  const clean = toEnglish(raw, kind, multiline);
  if (clean === raw) return;

  const caret = target.selectionStart ?? raw.length;
  const caretAfter = toEnglish(raw.slice(0, caret), kind, multiline).length;
  target.value = clean;
  try {
    target.setSelectionRange(caretAfter, caretAfter);
  } catch {
    // some input types (email) do not support selection; the caret simply goes to the end
  }
  warnEnglishOnly();
}
