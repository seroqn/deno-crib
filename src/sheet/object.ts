import { isArticle, Topic } from "./type.ts";
import { colors, sprintf } from "../deps.ts";

const headColor = colors.cyan;
const commentedOutColor = colors.gray;

export type CribBud = [string[], string[]]; ; // heads and articles

const TOPIC_SEP = "..";

export function sheetIntoCribBuds(
  sheet: Topic,
  heads: string[],
  showSystemTopics: boolean,
): CribBud[] {
  let ret: CribBud[] = [];
  for (const [key, val] of Object.entries(sheet)) {
    if (!showSystemTopics && /^==.*==$/.test(key)) {
      continue;
    }
    if (!isArticle(val)) {
      ret = [
        ...ret,
        ...sheetIntoCribBuds(val, [...heads, key], showSystemTopics),
      ];
      continue;
    } else if (key != "_") {
      ret.push([[...heads, key], val]);
      continue;
    }
    let i = ret.length - 1;
    for (let edge = heads.length, comp = JSON.stringify(heads); i >= 0; i--) {
      const hs = ret[i][0];
      if (!(hs.length > edge && JSON.stringify(hs.slice(0, edge)) == comp)) {
        console.error(i, hs, hs.slice(0, edge), heads);
        break;
      }
    }
    ret.splice(i + 1, 0, [[...heads, key], val]);
  }
  return ret;
}

export function filterByTopicQuery(buds: CribBud[], topicQuery: string[]) {
  if (!topicQuery.length) {
    return buds;
  }
  const tqs = topicQuery.map((str: string) => str.toUpperCase());
  return buds.filter(([heads, _]: [string[], unknown]) =>
    tqs.every((q: string) =>
      heads.some((head: string) => head.toUpperCase().includes(q))
    )
  );
}

type Opts = {
  underHide: boolean;
  cmoutReveal: boolean;
};
export function cribBudsIntoLines(buds: CribBud[], opts: Opts): string[] {
  let lines = [];
  for (const [heads, articles] of buds) {
    const headLine = headColor(
      sprintf("%-21s", `[${headsIntoTopicLine(heads)}]`),
    );
    const atcLines = articles.reduce(
      (acc: string[], article: string | null, i: number) => {
        const isCommentedOut = /^\s*\/\//.test(article);
        if (
          article == null || !opts.cmoutReveal && isCommentedOut ||
          opts.underHide && /^(?:\s*\/\/)?\s*-/.test(article)
        ) {
          return acc;
        }
        const line = `${i}\t${headLine}\t${article}`;
        return [...acc, isCommentedOut ? commentedOutColor(line) : line];
      },
      [],
    );
    lines = [...lines, ...atcLines];
  }
  return lines;
}
export function cribBudsIntoTopics(buds: CribBud[]) {
  return buds.map(([heads, _]: [string[], unknown]) =>
    headsIntoTopicLine(heads)
  );
}

export function headsIntoTopicLine(heads: string[]) {
  return heads.map((head: string) => /\./.test(head) ? `"${head}"` : head).join(
    TOPIC_SEP,
  );
}
