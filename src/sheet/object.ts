import { isArticle, Topic } from "./type.ts";
import { colors, sprintf } from "../deps.ts";
import { strWidth } from "../helper/helper.ts";

const headColor = colors.cyan;
const themeColor = colors.brightBlue;
const commentedOutColor = colors.gray;
const TABSTOP = 4;

export type CribBud = [string[], string[], string[]]; // heads(topics), articleTheme, articles

const TOPIC_SEP = "..";

export function sheetIntoCribBuds(
  sheet: Topic,
  heads: string[],
  themes: string[],
  showSystemTopics: boolean,
): CribBud[] {
  let ret: CribBud[] = [];
  for (const [key, val] of Object.entries(sheet)) {
    if (!showSystemTopics && /^==.*==$/.test(key)) {
      continue;
    }
    const m = key.match(/^(\+)?\s*(.*)$/);
    const isTheme = !!m[1],
      head = m[2];

    if (!isArticle(val)) {
      const [hs, ts] = themes.length || isTheme
        ? [[...heads], [...themes, head]]
        : [[...heads, head], []];
      ret = [
        ...ret,
        ...sheetIntoCribBuds(val, hs, ts, showSystemTopics),
      ];
      continue;
    }
    const v = val == null ? [""] : typeof val == "string" ? [val] : val;
    const addee: CribBud = themes.length || isTheme
      ? [[...heads], [...themes, head], v]
      : [[...heads, head], [], v];
    if (key == "_") {
      insertUnderscoreEntry(ret, addee, heads);
    } else {
      ret.push(addee);
    }
  }
  return ret;
}
function insertUnderscoreEntry(
  buds: CribBud[],
  addee: CribBud,
  heads: string[],
) {
  const sliceEdge = heads.length,
    comp = JSON.stringify(heads);
  let i = buds.length - 1;
  while (i >= 0) {
    const hs = buds[i][0];
    if (
      !(hs.length >= sliceEdge &&
        JSON.stringify(hs.slice(0, sliceEdge)) == comp)
    ) {
      console.error(
        `not moved "_" key entry..`,
        "base:",
        heads,
        `evaluated (i:${i}, sliceEdge:${sliceEdge}):`,
        hs,
      );
      break;
    }
    i--;
  }
  buds.splice(i + 1, 0, addee);
}

export function filterByTopicQuery(
  buds: CribBud[],
  topicQuery: string[],
): CribBud[] {
  if (!topicQuery.length) {
    return buds;
  }
  const tqs = topicQuery.map((str: string) => str.toUpperCase());
  return buds.filter(([heads, ..._]: [string[], ...unknown[]]) =>
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
  for (const [heads, themes, articles] of buds) {
    const headLine = sprintf("%-20s", `[${headsIntoTopicLine(heads)}]`);
    const headLineLen = strWidth(headLine);
    const offset = headLineLen > 40
      ? 0
      : 40 - headLineLen + (headLineLen % TABSTOP ? TABSTOP : 0);
    const themeLine = themes.length
      ? themeColor(sprintf(`%-${offset}s`, headsIntoTopicLine(themes)))
      : " ".repeat(offset);
    const atcLines = articles.reduce(
      (acc: string[], article: string, i: number) => {
        const isCommentedOut = /^\s*\/\//.test(article);
        if (
          !opts.cmoutReveal && isCommentedOut ||
          opts.underHide && /^(?:\s*\/\/)?\s*-/.test(article)
        ) {
          return acc;
        }
        const line = `${i}\t${headColor(headLine)}\t${themeLine}\t${article}`;
        return [...acc, isCommentedOut ? commentedOutColor(line) : line];
      },
      [],
    );
    lines = [...lines, ...atcLines];
  }
  return lines;
}
export function cribBudsIntoTopics(buds: CribBud[]) {
  return buds.map(([heads, ..._]: [string[], ...unknown[]]) =>
    headsIntoTopicLine(heads)
  );
}

export function headsIntoTopicLine(heads: string[]) {
  return heads.map((head: string) => /\./.test(head) ? `"${head}"` : head).join(
    TOPIC_SEP,
  );
}
