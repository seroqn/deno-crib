import { isArticle, Topic } from "./type.ts";
import { colors, sprintf } from "../deps.ts";

const headColor = colors.cyan;
const commentedOutColor = colors.gray;

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
    const headLine = headColor(
      sprintf("%-21s", `[${headsIntoTopicLine(heads)}]`),
    );
    const atcLines = atcs.reduce((acc: string[], article: string | null) => {
      const isCommentedOut = /^\s*\/\//.test(article);
      if (
        article == null || !opts.cmoutReveal && isCommentedOut ||
        opts.underHide && /^(?:\s*\/\/)?\s*-/.test(article)
      ) {
        return acc;
      }
      const line = `${headLine}\t${article}`;
      return [...acc, isCommentedOut ? commentedOutColor(line) : line];
    }, []);
    lines = [...lines, ...atcLines];
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
