import { headsIntoTopicLine, sheetIntoCribBuds } from "src/sheet/object.ts";
import { assertEquals, describe, it } from "./deps.ts";

describe("sheet/object", () => {
  describe("sheetIntoCribBuds()", () => {
    it("空のシートなら空のリスト", () => {
      const sheet = {};
      const expected = [];
      assertEquals(sheetIntoCribBuds(sheet, [], [], false), expected);
    });
    it("一階層シート", () => {
      const sheet = {
        awk: [
          "substr(str, first:int[, last:int]) :: str の first から last までを部分文字列として取得",
          "index(str, needle:string)          :: str の中の needle の位置, 見つからないときは 0",
        ],
      };
      const expected = [
        [["awk"], [], [
          "substr(str, first:int[, last:int]) :: str の first から last までを部分文字列として取得",
          "index(str, needle:string)          :: str の中の needle の位置, 見つからないときは 0",
        ]],
      ];
      assertEquals(sheetIntoCribBuds(sheet, [], [], false), expected);
    });
    it("多階層シート", () => {
      const sheet = {
        aaaaa: {
          abcabc: ["abababab", "acacacac"],
          adeade: {
            adfg: ["adfhadfh", "adfiadfi"],
            adfh: ["adfhi", "adfhj"],
          },
        },
        bbbbb: [
          "bcdbcd",
          "bdebde",
        ],
      };
      const expected = [
        [["aaaaa", "abcabc"], [], ["abababab", "acacacac"]],
        [["aaaaa", "adeade", "adfg"], [], ["adfhadfh", "adfiadfi"]],
        [["aaaaa", "adeade", "adfh"], [], ["adfhi", "adfhj"]],
        [["bbbbb"], [], ["bcdbcd", "bdebde"]],
      ];
      assertEquals(sheetIntoCribBuds(sheet, [], [], false), expected);
    });
    it("先頭が `+` から始まるトピックは theme として扱う", () => {
      const sheet = {
        aaaaa: {
          abcabc: ["abababab", "acacacac"],
          "+adeade": {
            adfg: ["adfhadfh", "adfiadfi"],
            "+adfh": ["adfhi", "adfhj"],
          },
        },
        bbbbb: {
          "+ bddddd": ["bcdbcd", "bdebde", "bdfbdf"],
        },
      };
      const expected = [
        [["aaaaa", "abcabc"], [], ["abababab", "acacacac"]],
        [["aaaaa"], ["adeade", "adfg"], ["adfhadfh", "adfiadfi"]],
        [["aaaaa"], ["adeade", "adfh"], ["adfhi", "adfhj"]],
        [["bbbbb"], ["bddddd"], ["bcdbcd", "bdebde", "bdfbdf"]],
      ];
      assertEquals(sheetIntoCribBuds(sheet, [], [], false), expected);
    });
    it("最端であり、 `_` でもあるトピックは先頭に移動させる", () => {
      const sheet = {
        aaaaa: {
          abcabc: ["abababab", "acacacac"],
          "+adeade": {
            adfg: ["adfhadfh", "adfiadfi"],
            "+adfh": ["adfhi", "adfhj"],
            _: "aadd",
          },
          _: "aabbcc",
        },
        bbbbb: {
          "+ bddddd": ["bcdbcd", "bdebde", "bdfbdf"],
          _: { bgbgbg: "bgggg", bhbhbh: "bhhhh" },
        },
        _: "abcde",
      };
      const expected = [
        [["_"], [], ["abcde"]],
        [["aaaaa", "_"], [], ["aabbcc"]],
        [["aaaaa", "abcabc"], [], ["abababab", "acacacac"]],
        [["aaaaa"], ["adeade", "_"], ["aadd"]],
        [["aaaaa"], ["adeade", "adfg"], ["adfhadfh", "adfiadfi"]],
        [["aaaaa"], ["adeade", "adfh"], ["adfhi", "adfhj"]],
        [["bbbbb"], ["bddddd"], ["bcdbcd", "bdebde", "bdfbdf"]],
        [["bbbbb", "_", "bgbgbg"], [], ["bgggg"]],
        [["bbbbb", "_", "bhbhbh"], [], ["bhhhh"]],
      ];
      assertEquals(sheetIntoCribBuds(sheet, [], [], false), expected);
    });
  });

  describe("filterByTopicQuery()", () => {
    // TODO
  });

  describe("headsIntoTopicLine()", () => {
    it('join with ".."', () => {
      assertEquals(headsIntoTopicLine(["foo", "bar", "baz"]), "foo..bar..baz");
    });
    it("case including space", () => {
      assertEquals(
        headsIntoTopicLine(["f oo", "b a r", "baz"]),
        "f oo..b a r..baz",
      );
    });
    it('including ".", it is quoted', () => {
      assertEquals(
        headsIntoTopicLine(["foo", "b.ar", "baz."]),
        'foo.."b.ar".."baz."',
      );
    });
  });

  describe("cribBudsIntoLines()", () => {
    // TODO
  });

  describe("cribBudsIntoTopics()", () => {
    // TODO
  });
});
