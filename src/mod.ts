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
  let buds = sheetIntoCribBuds(sheet, [], showSystemTopics);
  const topicQuery = args.length ? args[0] : [];
  return filterByTopicQuery(buds, topicQuery);
}

export function listTopics(buds: CribBuds[]) {
  for (const topic of cribBudsIntoTopics(buds)) {
    console.log(topic);
  }
}

export function displayWithFzf(
  buds: CribBuds[],
  underHide: boolean,
  cmoutReveal: boolean,
) {
  const lines = cribBudsIntoLines(buds, { underHide, cmoutReveal });
  for (const line of lines) {
    console.log(line);
  }
}

export async function writeArticleMap(pth: string, buds: CribBuds[]) {
  const h = {};
  for (const [heads, themes, articles] of buds) {
    const themeLine = headsIntoTopicLine(themes);
    h[`[${headsIntoTopicLine(heads)}]${themeLine}`] = [
      themes.length ? `[ ${themeLine} ]` : "",
      ...articles,
    ];
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
