import { colors } from "./deps.ts";

const currLineColor = colors.brightYellow.bold;
const commentedOutColor = colors.gray;

if (Deno.args.length != 3) {
  Deno.exit();
}
const [path, currIdx, jhead] = Deno.args;
let isReadable = false;
try {
  if (Deno.statSync(path).isFile) {
    isReadable = true;
  }
} catch (e) {
}
if (!isReadable) {
  console.log(`file is not readable: "${path}"`);
  Deno.exit();
}

const jhead2articles = JSON.parse(Deno.readTextFileSync(path));
if (jhead in jhead2articles) {
  let i = 0;
  for (const article of jhead2articles[jhead]) {
    if (/^\s*\/\//.test(article)){
      console.log(i == currIdx ? commentedOutColor.bold(article) : commentedOutColor(article));
    } else {
      console.log(i == currIdx ? currLineColor(article) : article);
    }
    i++;
  }
}
