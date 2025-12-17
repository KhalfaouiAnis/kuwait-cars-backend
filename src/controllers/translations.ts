import { loadTranslationForLanguage } from "@services/translation.js";
import { Request, Response } from "express";

export const serveTranslation = async (req: Request, res: Response) => {
  let translations = await loadTranslationForLanguage(
    req.params.lng,
    req.params.ns
  );
  if (!translations) {
    console.warn(
      `Falling back to English for ${(req.params.lng, req.params.ns)}`
    );
    translations = await loadTranslationForLanguage("en", "common");
  }

  if (!translations) {
    translations = { error: "Translations unavailable" };
  }

  res.set("Cache-Control", "public, max-age=300");
  res.json(translations);
};
