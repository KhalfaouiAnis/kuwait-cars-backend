import fs from "fs/promises";
import path from "path";

const translationCache = new Map();
const TRANSLATIONS_DIR = path.resolve(process.cwd(), "public", "translations");

export async function loadTranslationForLanguage(lang: string, ns: string) {
  const cacheKey = `translations_${lang}_${ns}`;

  // Check cache (30min expiry)
  const cached = translationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
    return cached.data;
  }

  const filePath = path.join(TRANSLATIONS_DIR, lang, `${ns}.json`);

  try {
    await fs.access(filePath);

    const data = JSON.parse(await fs.readFile(filePath, "utf8"));
    translationCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.warn(
        `Translation file not found for ${lang} namespace ${ns}: ${error.message}`
      );
    }
    return null;
  }
}
