import { Command } from "./deps.ts";
import {
  displayWithFzf,
  listTopics,
  loadSheetAndReturnHAndAs,
  writeArticleMap,
} from "./mod.ts";

const { options, args } = await new Command()
  .name("crib")
  .description("show crib sheet written YAML with fzf.")
  .option("-t, --topics", "list topics and exit. (standalone)", {
    standalone: true,
  })
  .option("-q, --query <query>", "set initial query <query> with fzf.", {
    default: "",
  })
  .option("-U, --under-hide", 'hide underitems beginning "-"')
  .option(
    "-c, --commentout-reveal",
    'reveal commented-out entry biginning "//".',
  )
  .option("-s, --system-topics", 'show system-topics like "==ENTRY==".')
  .arguments("[topics...]")
  .parse(Deno.args);

const hAndAs = loadSheetAndReturnHAndAs(options, args);

if ("topics" in options) {
  console.log("=cat=");
  listTopics(hAndAs);
  Deno.exit(0);
}

console.log("=fzf=");
console.log(options.query);
const tmpFPath = Deno.makeTempFileSync({ prefix: "deno-crib-" });
writeArticleMap(tmpFPath, hAndAs);
console.log(tmpFPath);

const underHide = options.underHide ?? false;
const cmoutReveal = options.commentoutReveal ?? false;
displayWithFzf(hAndAs, underHide, cmoutReveal);
