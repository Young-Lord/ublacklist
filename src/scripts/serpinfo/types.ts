import { z } from "zod";
import { parseMatchPattern } from "../../common/match-pattern.ts";
import {
  buttonCommandSchema,
  propertyCommandSchema,
  regexSchema,
  rootsCommandSchema,
} from "./commands.ts";

const matchPatternSchema = z
  .string()
  .refine((value) => parseMatchPattern(value) != null, "Invalid match pattern");

const propNameSchema = z.string().regex(
  // Identifier { "$"? (@asciiLetter | "_") (@digit | @asciiLetter | "_")* }
  /^\$?[A-Za-z_][0-9A-Za-z_]*$/,
  "Invalid prop name",
);

export type ResultDescription = z.infer<typeof resultDescriptionSchema>;

const resultDescriptionSchema = z.object({
  name: z.string().optional(),
  root: rootsCommandSchema,
  url: propertyCommandSchema,
  props: z.record(propNameSchema, propertyCommandSchema).optional(),
  button: buttonCommandSchema.optional(),
  preserveSpace: z.boolean().optional(),
});

export type SerpDescription = z.infer<typeof serpDescriptionSchema>;

const serpDescriptionSchema = z.object({
  name: z.string(),
  matches: matchPatternSchema.array(),
  excludeMatches: matchPatternSchema.array().optional(),
  includeRegex: regexSchema.optional(),
  excludeRegex: regexSchema.optional(),
  userAgent: z.enum(["any", "desktop", "mobile"]).optional(),
  results: resultDescriptionSchema
    .nullable()
    .catch(() => null)
    .array(),
  commonProps: z.record(propNameSchema, z.string()).optional(),
  delay: z.boolean().or(z.number()).optional(),
});

const personSchema = z.string().or(
  z.object({
    name: z.string(),
    email: z.email().optional(),
    url: z.url().optional(),
  }),
);

// https://github.com/colinhacks/zod/issues/61
const bugsSchema = z
  .url()
  .or(z.object({ url: z.url(), email: z.email() }))
  .or(z.object({ url: z.url(), email: z.undefined() }))
  .or(z.object({ url: z.undefined(), email: z.email() }));

export type SerpInfo = z.infer<typeof serpInfoSchema>;

export const serpInfoSchema = z.object({
  SERPINFO_VERSION: z.literal("1.0").optional(),

  // Inspired by package.json
  name: z.string(),
  version: z.string().optional(),
  description: z.string().optional(),
  homepage: z.url().optional(),
  bugs: bugsSchema.optional(),
  license: z.string().optional(),
  author: personSchema.optional(),
  contributors: personSchema.array().optional(),

  lastModified: z.iso.datetime().optional(),
  pages: serpDescriptionSchema.array(),
});

export type SerpInfoStrict = z.infer<typeof serpInfoStrictSchema>;

export const serpInfoStrictSchema = serpInfoSchema.extend({
  pages: serpDescriptionSchema
    .extend({
      results: resultDescriptionSchema.array(),
    })
    .array(),
});
