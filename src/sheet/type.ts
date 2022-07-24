export type Topic = { [topic: string]: Topic | Article };
export type Article = Array<string | null> | string | null;

export function isTopic(t: any): t is Topic {
  return (
    t && typeof t == "object" &&
    Object.values(t).every((u: any) => isArticle(u) || isTopic(u))
  );
}
export function isArticle(a: any): a is Article {
  return (
    a == null || typeof a == "string" ||
    Array.isArray(a) && a.every((b: any) => b == null || typeof b == "string")
  );
}
