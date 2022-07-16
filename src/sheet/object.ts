import { isArticle, Topic } from "./type.ts";
import { sprintf } from "../deps.ts";

export type HAndA = [string[], string[]]; // heads and articles

const TOPIC_SEP = "..";

export function sheetIntoHeadsAndArticles(
  sheet: Topic,
  heads: string[],
  showSystemTopics: boolean,
): HAndA[] {
  let ret: HAndA[] = [];
  for (const [key, val] of Object.entries(sheet)) {
    if (!showSystemTopics && /^==.*==$/.test(key)) {
      continue;
    }
    if (isArticle(val)) {
      ret.push([[...heads, key], val]);
    } else {
      ret = [
        ...ret,
        ...sheetIntoHeadsAndArticles(val, [...heads, key], showSystemTopics),
      ];
    }
  }
  return ret;
}

export function filterByTopicQuery(hAndAs: HAndA[], topicQuery: string[]) {
  if (!topicQuery.length) {
    return hAndAs;
  }
  const tqs = topicQuery.map((str: string) => str.toUpperCase());
  return hAndAs.filter(([heads, _]: [string[], unknown]) =>
    tqs.every((q: string) =>
      heads.some((head: string) => head.toUpperCase().includes(q))
    )
  );
}

type Opts = {
  underHide: boolean;
  cmoutReveal: boolean;
};
export function hAndAsIntoLines(hAndAs: HAndA[], opts: Opts): string[] {
  let lines = [];
  for (const [heads, atcs] of hAndAs) {
    const headLine = sprintf("%-21s", `[${headsIntoTopicLine(heads)}]`);
    lines = [
      ...lines,
      ...atcs.reduce((acc: string[], article: string | null) => {
        if (
          article == null || !opts.cmoutReveal && /^\s*\/\//.test(article) ||
          opts.underHide && /^(?:\s*\/\/)?\s*-/.test(article)
        ) {
          return acc;
        }
        return [...acc, `${headLine}\t${article}`];
      }, []),
    ];
  }
  return lines;
}
export function hAndAsIntoTopics(hAndAs: HAndA[]) {
  return hAndAs.map(([heads, _]: [string[], unknown]) =>
    headsIntoTopicLine(heads)
  );
}

function headsIntoTopicLine(heads: string[]) {
  return heads.map((head: string) => /\./.test(head) ? `"${head}"` : head).join(
    TOPIC_SEP,
  );
}
