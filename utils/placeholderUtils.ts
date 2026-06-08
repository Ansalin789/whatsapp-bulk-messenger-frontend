export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type ConvertResult = {
  text: string; // transformed body with {{1}}, {{2}}...
  variables: string[]; // ordered variable names
  exampleBodyText?: string[][]; // nested array suitable for components[].example.body_text
};

/**
 * Convert a body containing named placeholders like {{var1}} into a
 * positional form {{1}}, {{2}}, ... preserving first-appearance order.
 * Returns the transformed text, ordered variable names, and an example
 * body_text array built from `previewValues` or sample_<var> fallbacks.
 */
export function convertNamedToPositional(
  body: string,
  previewValues: Record<string, string> = {},
): ConvertResult {
  const placeholderRegex = /{{\s*(.*?)\s*}}/g;
  const orderedVars: string[] = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = placeholderRegex.exec(body)) !== null) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      orderedVars.push(name);
    }
  }

  let transformed = body;
  for (let i = 0; i < orderedVars.length; i++) {
    const varName = orderedVars[i];
    const pos = i + 1;
    const re = new RegExp(`{{\\s*${escapeRegExp(varName)}\\s*}}`, "g");
    transformed = transformed.replace(re, `{{${pos}}}`);
  }

  const exampleBodyText =
    orderedVars.length > 0
      ? [orderedVars.map((v) => (previewValues[v]?.trim() || `sample_${v}`))]
      : undefined;

  return {
    text: transformed,
    variables: orderedVars,
    exampleBodyText,
  };
}

export default convertNamedToPositional;
