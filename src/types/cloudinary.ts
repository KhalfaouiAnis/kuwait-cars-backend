import z from "zod";

export const CloudinarySignRequestSchema = z.object({
  mediaType: z.string(),
  audioFlag: z.string().optional(),
});

export type CloudinarySignRequestInterface = z.infer<
  typeof CloudinarySignRequestSchema
>;
