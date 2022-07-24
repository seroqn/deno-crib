import { getSheetFilePath, loadSheetFile } from "./sheet/file.ts";
import {
  CribBuds,
  cribBudsIntoLines,
  cribBudsIntoTopics,
  filterByTopicQuery,
  headsIntoTopicLine,
  sheetIntoCribBuds,
} from "./sheet/object.ts";

export function loadSheetAndReturnCribBuds(
  options: { systemTopics?: boolean },
  args: [string[]?],
): CribBuds[] {
  const pth = getSheetFilePath();
  const sheet = loadSheetFile(pth);
  if (sheet == null) {
    Deno.exit(1);
  }
  const showSystemTopics = !!options.systemTopics;
  let cribBuds = sheetIntoCribBuds(sheet, [], showSystemTopics);
  const topicQuery = args.length ? args[0] : [];
  return filterByTopicQuery(cribBuds, topicQuery);
}

export function listTopics(cribBuds: CribBuds[]) {
  for (const topic of cribBudsIntoTopics(cribBuds)) {
    console.log(topic);
  }
}

export function displayWithFzf(
  cribBuds: CribBuds[],
  underHide: boolean,
  cmoutReveal: boolean,
) {
  const lines = cribBudsIntoLines(cribBuds, { underHide, cmoutReveal });
  for (const line of lines) {
    console.log(line);
  }
}

export async function writeArticleMap(pth: string, cribBuds: CribBuds[]) {
  const h = {};
  for (const [heads, articles] of cribBuds) {
    h[`[${headsIntoTopicLine(heads)}]`] = articles;
  }
  Deno.writeTextFile(pth, JSON.stringify(h));
}
export function isReadable(pth: string) {
  try {
    if (Deno.statSync(pth).isFile) {
      return true;
    }
  } catch (e) {
  }
  return false;
}
