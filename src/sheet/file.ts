import { isTopic, Topic } from "./type.ts";
import { existsSync, parseYaml, path, xdg } from "../deps.ts";
import { APPNAME_L } from "../const/app.ts";

export function getSheetFilePath(): string {
  const FBASE = "crib.yml";
  const homepath = Deno.env.get("CRIB_HOME");
  if (homepath) {
    return path.join(homepath, FBASE);
  }
  const configPaths = xdg.configDirs().map((rootdir: string) =>
    path.join(rootdir, APPNAME_L, FBASE)
  );
  return configPaths.find((pth: string) => existsSync(pth)) ?? configPaths[0];
}

export function loadSheetFile(pth: string): Topic | undefined {
  if (!existsSync(pth)) {
    console.error(`Setting file not exists in "${pth}"`);
    return undefined;
  }
  const raw = Deno.readTextFileSync(pth);
  let sheet: Topic | undefined;
  try {
    const parsee: unknown = parseYaml(raw);
    if (isTopic(parsee)) {
      sheet = parsee;
    }
  } catch (e: unknown) {
    console.error(`Setting parsed error: `, e);
    throw (e);
  }
  return sheet;
}
