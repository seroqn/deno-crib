# crib
YAML 形式で記述したチートシートを [fzf](https://github.com/junegunn/fzf) で一覧するコマンド `crib` を提供します。<br>


## Installation
[Deno](https://deno.land/) が必要です。事前に `deno` コマンドが使えるようにしてください。<br>
このプロダクトの `bin` ディレクトリにパスを通してください。<br>

```shell
export PATH="$HOME/path/to/deno-crib/bin:$PATH"
```

チートシートを置くディレクトリを `CRIB_HOME` 環境変数で指定してください。<br>
このディレクトリ以下の `crib.yml` というファイルがチートシートファイルと見なされます。<br>
`CRIB_HOME` 環境変数を設定していない場合、非Windows 環境だと `"$XDG_CONFIG_HOME/crib"` が、Windows 環境だと `%AppData%\xdg.config` が使われます。

```shell
export CRIB_HOME="$HOME/.crib"
```


## crib-file notations
```yaml:crib.yml
# YAML ファイルのコメントは `#` で始まる文字列です。

# `==foobar==` のように先頭と末尾に `==` があるトピックはシステムが使います。
==INBOX==:
  - 'foo bar baz'

# Topic として辞書のキーを、その下に Article として文字列のリストを指定します。
awk:
  - 'substr(str, first:int[, last:int]) :: str の first から last までを部分文字列として取得'
  - 'index(str, needle:string)          :: str の中の needle の位置, 見つからないときは 0'
  - '//foo bar'   # `//` で始まる Article はコメントアウトされ、`-c` オプション付きで実行されない限り fzf の候補に現れません。

# Topic や Article に使う文字列は YAML の特殊文字を含まなければクォートしなくても有効ですが、 Article はクォートで統一することを推奨します。


# Topic は入れ子にできます。Topic の文字列は fzf の検索対象ではありません。`crib` コマンドに引数として与えた文字列で Topic が絞り込まれます。
git:
  操作:
    # `+` から始まる Topic は fzf の検索対象になります。(`+` のあとに任意の空白文字を入れることができます。)
    # （ただし、fzf は環境によっては日本語を受け付けないのでキーワードをアルファベットで書くなど工夫が必要かもしれません。）
    # `+` から先にある入れ子の Topic は全て fzf での検索対象になります。
    + origin/main (master) を素早く remote に合わせる:
      - '$ git fetch'
      - '$ git branch -f main origin/main'
  基礎知識:
    + HEAD:
      - 'alias = @'
      - '@~ :: 最新の1つ前 (=ORIG_HEAD)'
```

