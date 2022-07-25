import { getSheetFilePath, loadSheetFile } from "src/sheet/file.ts";
import { APPNAME_L } from "src/const/app.ts";
import { afterEach, assertEquals, describe, it, path } from "./deps.ts";
import { delEnv, Helper, setEnv } from "./helper.ts";

describe("sheet/file", () => {
  const FBASE = "crib.yml";
  const helper = new Helper();
  afterEach(() => {
    helper.restore();
  });

  describe("getSheetFilePath()", () => {
    it("$CRIB_HOME が定義されているならそれを起点にしたパスを返す", () => {
      const tmpDir = helper.getTmpDir();
      setEnv("CRIB_HOME", tmpDir);
      assertEquals(getSheetFilePath(), path.join(tmpDir, FBASE));
    });
    it(`$CRIB_HOME が未定義なら xdg.configDirs() 以下の存在する "${APPNAME_L}" ディレクトリを返す`, () => {
      delEnv("CRIB_HOME");
      const tmpDir = helper.getTmpDir();
      const existDir = path.join(tmpDir, "exist");
      const homeDir = path.join(existDir, APPNAME_L);
      const fpath = path.join(homeDir, FBASE);
      Deno.mkdirSync(homeDir, { recursive: true });
      Deno.writeTextFileSync(fpath, "foobar:");
      const xdgConfigDirs = [
        path.join(tmpDir, "foo"), // no exists
        path.join(tmpDir, "bar"), // no exists
        existDir,
        path.join(tmpDir, "baz"), // no exists
      ];
      setEnv("XDG_CONFIG_DIRS", xdgConfigDirs.join(path.delimiter));
      assertEquals(getSheetFilePath(), fpath);
    });
    it(`$CRIB_HOME が未定義で xdg.configDirs() 以下の "${APPNAME_L}" が存在しなければ一番先頭のものを返す`, () => {
      delEnv("CRIB_HOME");
      const tmpDir = helper.getTmpDir();
      setEnv("XDG_CONFIG_HOME", tmpDir);
      assertEquals(
        getSheetFilePath(),
        path.join(tmpDir, APPNAME_L, FBASE),
      );
    });
  });

  describe("loadSheetFile()", () => {
    it("parse settingfile", () => {
      const tmpDir = helper.getTmpDir();
      const fpath = path.join(tmpDir, FBASE);
      Deno.writeTextFileSync(
        fpath,
        [
          ` # config`,
          ` ==Inbox==:`,
          `   - 'aaa'`,
          `   - 'bbb'`,
          ` shell:`,
          `   tips:`,
          `     + readは遅い:`,
          `       - 'read は 1バイトずつ読んで改行文字を探しているから遅い cf)) https://www.allbsd.org/~hrs/blog/2020-03-28-sh-built-in-read.html sh の組み込みコマンド read は遅い'`,
          `     + バックスラッシュを多重化しなければいけないときがある:`,
          `       - 'my)) deno-crib/bin/crib; sed ''s!\\!\\\\\\\\!g''; バッククォートの中のバッククォートの式のときなど'`,
        ].join("\n"),
      );
      const expected = {
        "==Inbox==": ["aaa", "bbb"],
        shell: {
          tips: {
            "+ readは遅い": [
              "read は 1バイトずつ読んで改行文字を探しているから遅い cf)) https://www.allbsd.org/~hrs/blog/2020-03-28-sh-built-in-read.html sh の組み込みコマンド read は遅い",
            ],
            "+ バックスラッシュを多重化しなければいけないときがある": [
              "my)) deno-crib/bin/crib; sed 's!\\!\\\\\\\\!g'; バッククォートの中のバッククォートの式のときなど",
            ],
          },
        },
      };
      assertEquals(loadSheetFile(fpath), expected);
    });
  });
});
