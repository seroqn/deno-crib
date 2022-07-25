import { getSheetFilePath } from "./sheet/file.ts";
import { isReadable } from "./mod.ts";
import { escapeStringRegexp } from "./deps.ts";

function _splitQjhead(qjhead: string) {
  if (qjhead == "") {
    return [];
  }
  const heads = [];
  for (
    const ms of qjhead.matchAll(/(?:^|\.\.)(?:"(.*?)"|(.*?))(?=(?:\.\.|$))/g)
  ) {
    const head = ms[1] ?? ms[2] ?? "";
    if (!head) {
      throw new Error(`head parse error: "${qjhead}"`);
    }
    heads.push(head);
  }
  return heads;
}
function _nextIndent(lines: string[], i: number, indent: number) {
  const regexp = new RegExp(String.raw`(?<=^\s{${indent},})[^- ].*?:`);
  for (let len = lines.length; i < len; i++) {
    const line = lines[i];
    if (/^\s*#|^\s*$/.test(line)) {
      continue;
    }
    let r = regexp.exec(line);
    if (r) {
      return r.index;
    }
    break;
  }
  return -1;
}
function _findHeadRow(
  lines: string[],
  heads: string[],
  row: number,
  indent: number,
) {
  let h = 0, hlen = heads.length;
  indent = _nextIndent(lines, row, indent);
  if (indent == -1) {
    return [-1, -1];
  }
  let stopRe = new RegExp(String.raw`^\s{${indent},}\S|^\s*$`);
  let headRe = new RegExp(
    String.raw`^\s{${indent}}(["']?)(?:\+\s*)?${
      escapeStringRegexp(heads[h])
    }\1:`,
  );
  for (let i = row, len = lines.length; i < len; i++) {
    const line = lines[i];
    if (/^\s*#/.test(line)) {
      continue;
    } else if (!stopRe.test(line)) {
      break;
    } else if (!headRe.test(line)) {
      continue;
    } else if (++h >= hlen) {
      return [i, indent];
    }
    indent = _nextIndent(lines, i + 1, indent + 1);
    if (indent == -1) {
      break;
    }
    stopRe = new RegExp(String.raw`^\s{${indent},}\S|^\s*$`);
    headRe = new RegExp(
      String.raw`^\s{${indent}}(["']?)(?:\+\s*)?${
        escapeStringRegexp(heads[h])
      }\1:`,
    );
  }
  return [-1, -1];
}

if (Deno.args.length != 1) {
  console.error("crib-jumpTo: invalid arguments", Deno.args);
  Deno.exit();
}
const path = getSheetFilePath();
if (!isReadable(path)) {
  console.error(`file is not readable: "${path}"`);
  Deno.exit();
}
const [_, jhead, theme, article] = Deno.args[0].split("\t");

const qjhead = jhead.trim().slice(1, -1); // remove `[` `] `
const heads = _splitQjhead(qjhead);
const qtheme = theme.trim();
const themes = _splitQjhead(qtheme);
if (!heads.length) {
  console.error(`invalid heads: '${jhead}'`);
  Deno.exit();
}
const lines = Deno.readTextFileSync(path).split("\n");
let [row, indent] = _findHeadRow(lines, heads, 0, 0);
if (row != -1 && themes.length) {
  const [r, i] = _findHeadRow(lines, themes, row + 1, indent);
  if (r == -1) {
    console.error(`fail in finding theme`, themes);
  }
  row = r == -1 ? row : r;
}

// output: (path, row, searchWord)
console.log(path);
console.log(String(row + 1)); // 文字列化しないと ansi-color 付きの数字を出力して bash がエラーを出す
console.log(heads.slice(-1)[0]);
