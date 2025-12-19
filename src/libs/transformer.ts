import { ValidationError } from "./error/ValidationError.js";

export const toJson = (data: string) => {
  if (data) {
    const cleanString = data.trim().replace(/^["']|["']$/, "");

    try {
      return JSON.parse(cleanString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new ValidationError([]);
    }
  }
};
