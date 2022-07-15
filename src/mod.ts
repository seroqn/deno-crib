import { getSettingFilePath, loadSettingFile } from "./sheet/file.ts";
import {
  filterByTopicQuery,
  HAndA,
  hAndAsIntoLines,
  hAndAsIntoTopics,
  sheetIntoHeadsAndArticles,
} from "./sheet/object.ts";

export function loadAndReturnHAndAs(
  options: { systemTopics?: boolean },
  args: [string[]?],
): HAndA[] {
  const pth = getSettingFilePath();
  const sheet = loadSettingFile(pth);
  if (sheet == null) {
    Deno.exit(1);
  }
  const showSystemTopics = !!options.systemTopics;
  let hAndAs = sheetIntoHeadsAndArticles(sheet, [], showSystemTopics);
  const topicQuery = args.length ? args[0] : [];
  return filterByTopicQuery(hAndAs, topicQuery);
}

export function listTopics(hAndAs: HAndA[]) {
  for (const topic of hAndAsIntoTopics(hAndAs)) {
    console.log(topic);
  }
}

export function displayWithFzf(
  hAndAs: HAndA[],
  underHide: boolean,
  cmoutReveal: boolean,
) {
  const lines = hAndAsIntoLines(hAndAs, { underHide, cmoutReveal });
  for (const line of lines) {
    console.log(line);
  }
}
