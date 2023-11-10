export function htmlSafeId(unEscapedId: string): string {
  return unEscapedId.replace(/\W/g, "_");
}
