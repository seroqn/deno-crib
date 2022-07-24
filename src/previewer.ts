import { colors } from "./deps.ts";
import { isReadable } from "./mod.ts";

const currLineColor = colors.brightYellow.bold;
const commentedOutColor = colors.gray;
const themeColor = colors.brightBlue.bold;

if (Deno.args.length != 4) {
  console.error("crib-previewer: invalid arguments", Deno.args);
  Deno.exit();
}
let [tmpPath, currIdx, jhead, jtheme] = Deno.args;
++currIdx;

if (!isReadable(tmpPath)) {
  console.log(`file is not readable: "${tmpPath}"`);
  Deno.exit();
}

const jtopic2articles = JSON.parse(Deno.readTextFileSync(tmpPath));
const key = jhead + jtheme;
if (key in jtopic2articles) {
  let i = 0;
  for (const article of jtopic2articles[key]) {
    if (i == 0) {
      if (jtheme != "") {
        console.log(themeColor(article));
      }
    } else if (/^\s*\/\//.test(article)) {
      console.log(
        i == currIdx
          ? commentedOutColor.bold(article)
          : commentedOutColor(article),
      );
    } else {
      console.log(i == currIdx ? currLineColor(article) : article);
    }
    i++;
  }
}
