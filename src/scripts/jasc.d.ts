declare class Jasc {
    static jascType: string;
    static "__#1@#_RE_REGEXP": RegExp;
    static "__#1@#_ACQ_REGEXP": RegExp;
    static "__#1@#_NATIVE_CODE_REGEXP": RegExp[];
    static "__#1@#_FILETYPE_REG_LIST": (string | RegExp)[][];
    static "__#1@#_FILETYPE_MIME_MAP": any;
    static "__#1@#jasc_add_events": any;
    static "__#1@#jasc_devAdd_events": any;
    static "__#1@#jasc_add_exEvents": any;
    static "__#1@#_devEventCount": number;
    static "__#1@#plugins": {};
    static "__#1@#_pluginCount": number;
    static "__#1@#_global": {};
    static _vibrateIntervalId: any;
    static _hardwareAcceleration: any;
    static requestAnimationFrame: any;
    static now: any;
    static getTime(): any;
    static "__#1@#_touchHoverKill"(): void;
    static _isHardwareAcceleration(): boolean;
    /**
     * jascネットワーク グローバル変数管理
     * @static
     */
    static global: {
        /**
         * グローバル変数取得
         * @param {string} key - キー
         * @param {any} [defaultValue] - デフォルト値
         * @returns {any} 値
         */
        get(key: string, defaultValue?: any): any;
        /**
         * グローバル変数設定
         * @param {string} key - キー
         * @param {any} value - 値
         * @returns {undefined}
         * @throws {Error} キーが空の場合
         */
        set(key: string, value: any): undefined;
        /**
         * グローバル変数削除
         * @param {string} key - キー
         * @returns {undefined}
         */
        delete(key: string): undefined;
        /**
         * グローバル変数オブジェクト取得(管理用)
         * @returns {object} jasc.#_global
         */
        _getDictionary(): object;
    };
    /**
     * jasc改造機能
     * @static
     */
    static develop: {
        /**
         * jascイベントリスナの種類を追加
         * @param {string} name - イベント名
         * @returns {0|1} 実行結果
         */
        createEvent(name: string): 0 | 1;
        /**
         * プラグインの登録
         * @param {function} plugin - プラグイン
         * @param {string} [name=""] - プラグイン名
         * @param {object} [opt] - オプション
         * @param {string|string[]} [opt.eventTypes] - プラグイン実行イベントタイプ
         * @param {boolean} [opt.jascClassJoin] - プラグインをjascクラスに登録するか
         * @param {boolean} [opt.jascJoin] - プラグインをjascインスタンスに登録するか
         * @param {boolean} [opt.overwrite] - 登録インスタンス、クラスを上書きするか
         * @returns {string|false} 登録プラグイン名
         * @static
         */
        addPlugins(plugin: Function, name?: string, opt?: {
            eventTypes?: string | string[];
            jascClassJoin?: boolean;
            jascJoin?: boolean;
            overwrite?: boolean;
        }): string | false;
        /**
         * プラグインが適用されているか
         * @param {string} name - プラグイン名
         * @returns {boolean} プラグインが適用されているか
         */
        hasPlugins(name: string): boolean;
    };
    /**
     * DOM取得(jQuery非対応版)
     * @param {string} [str] - 取得対象
     * @param {Window|Document|HTMLElement} [par=document] - 取得対象の親
     * @returns {Window|Document|HTMLElement|HTMLElement[]}
     * @static
     */
    static acq(str?: string, par?: Window | Document | HTMLElement): Window | Document | HTMLElement | HTMLElement[];
    /**
     * DOM取得(jQuery非対応版)
     * @param {string} [str] - 取得対象
     * @param {Window|Document|HTMLElement} [par=document] - 取得対象の親
     * @returns {Window|Document|HTMLElement|HTMLElement[]}
     * @static
     */
    static $: typeof Jasc.acq;
    /**
     * classを反転(jQuery非対応版)
     * @param {string|HTMLElement|HTMLElement[]} name - class反転対象
     * @param {string} str - class名
     * @returns {undefined}
     * @static
     */
    static toggleClass(name: string | HTMLElement | HTMLElement[], str: string): undefined;
    /**
     * css変数取得&書き換え
     * @param {string} name - css変数名
     * @param {string} [val] - css変数値
     * @param {HTMLElement} [setDom=document.documentElement] - jQuery非対応版
     * @returns {string|false} css変数値
     * @static
     */
    static cssVariableIO(name: string, val?: string, setDom?: HTMLElement): string | false;
    /**
     * スクロールバー存在判定X
     * @param {HTMLElement} [elem=document.body] - 対象
     * @returns {boolean}
     * @static
     */
    static scrollbarXVisible(elem?: HTMLElement): boolean;
    /**
     * スクロールバー存在判定Y
     * @param {HTMLElement} [elem=document.body] - 対象
     * @returns {boolean}
     * @static
     */
    static scrollbarYVisible(elem?: HTMLElement): boolean;
    /**
     * スクロール位置判定
     * @param {Event} e - Scrollイベント
     * @param {number} [margin=0] - 上限下限の許容値
     * @returns {"top"|"bottom"|"scrolling"} 現在のスクロール位置
     * @static
     */
    static getScrollVerticalPosition(e: Event, margin?: number): "top" | "bottom" | "scrolling";
    /**
     * 動的url
     * @param {string} url - 変更後url
     * @param {object} [data] - 保持するデータ
     * @param {boolean} [log] - ブラウザの履歴に書き込むか
     * @returns {undefined}
     * @static
     */
    static historyPush(url: string, data?: object, log?: boolean): undefined;
    /**
     * urlパラメータ分解
     * @param {string} data - url
     * @returns {object}
     * @static
     */
    static getUrlVars(url: any): object;
    /**
     * クリップボードにコピー
     * @param {string} data - コピーするデータ
     * @returns {Promise<undefined>} 完了後実行
     * @static
     */
    static copy2Clipboard(data: string): Promise<undefined>;
    /**
     * 変数の型統一変換[破壊的関数]
     * @param {object} data - 変数
     * @param {number} [nestingDepth=0] - 再帰する深さ
     * @returns {object} 変数
     * @static
     */
    static dataTypeFormatting(data: object, nestingDepth?: number): object;
    /**
     * 値がNative Codeか判定
     * @param {any} value - 値
     * @param {boolean} [severe=true] - 厳格な判定
     * @returns {boolean} 結果
     */
    static isNativeCode(value: any, severe?: boolean): boolean;
    /**
     * 指定時間待機
     * @param {number} [ms=1000] - 待機時間
     * @returns {Promise<undefined>}
     * @static
     */
    static sleep(ms?: number): Promise<undefined>;
    /**
     * 連想配列かどうか判定
     * @param {object} obj - 連想配列
     * @returns {boolean}
     * @static
     */
    static isAssociative(obj: object): boolean;
    /**
     * setを比較する
     * @param {Set} a - set1
     * @param {Set} b - set2
     * @returns {boolean}
     * @static
     */
    static equalSet(a: Set, b: Set): boolean;
    /**
     * オブジェクトをディープコピーする
     *
     * ※ 以下の全て参照渡し(他非対応オブジェクトなどは全て参照渡し)
     * Function, Promise, Class(一部除く), WeakMap, WeakSet
     * @param {object} obj - オブジェクト
     * @param {Object | boolean} [opt] - オプション(内容はtrueで値渡し(or コピー)、falseで参照渡し)
     * @param {boolean} [opt.copyArray=true] - 配列をコピー
     * @param {boolean} [opt.copyAssociative=true] - 連想配列をコピー
     * @param {boolean} [opt.copyDOM=false] - DOM要素をコピー
     * @param {boolean} [opt.copyDate=true] - Dateをコピー
     * @param {boolean} [opt.copyArrayBuffer=true] - ArrayBufferをコピー
     * @param {boolean} [opt.copyDataView=true] - DataViewをコピー
     * @param {boolean} [opt.copyMap=false] - Mapをコピー
     * @param {boolean} [opt.copySet=false] - Setをコピー
     * @param {boolean} [opt.copyRegExp=false] - RegExpをコピー
     * @param {boolean} [opt.copySymbol=false] - Symbolをコピー
     * @param {boolean} [opt.copyError=false] - Errorをコピー
     * @param {boolean} [opt.cloneClass=false] - clone関数が存在するClassをコピー
     * @returns {object} コピーされたオブジェクト
     * @static
     */
    static deepCopy(obj: object, opt?: any | boolean): object;
    /**
     * 連想配列を結合(上書き)[破壊的関数]
     * @param {object} parents - 結合先
     * @param {object} [child] - 結合元
     * @returns {undefined}
     * @static
     */
    static overwriteAssociative(parents: object, child?: object): undefined;
    /**
     * 連想配列に自動でkeyを作成、割り当て
     * @param {object} obj - 連想配列
     * @param {any} [data] - 代入内容
     * @param {string} [baseName=""] - 基準名
     * @param {string} [prefix="-"] - 通し番号結合文字
     * @returns {string} 作成されたkey名
     * @static
     */
    static setAssociativeAutoName(obj?: object, data?: any, baseName?: string, prefix?: string): string;
    /**
     * オブジェクトの断層を特定
     *
     * 例:
     * "obj.a.b.c" => c
     * @param {object} obj - オブジェクト
     * @param {string|string[]} keys - キー
     * @param {any} [notFound="__NOT_FOUND__"] - 存在しない場合やエラーの返り値
     * @param {boolean} [createObj=false] - 存在しなかった場合にオブジェクトを作成
     * @returns {any} 値
     * @static
     */
    static getDotKey(obj: object, keys: string | string[], notFound?: any, createObj?: boolean): any;
    static _getDotSearch(obj: any, keys: any, notFound: any, createObj?: boolean): any;
    /**
     * 不明なスペースを半角スペースに
     * @param {string} str - 対象文字列
     * @returns {string} 変換後
     * @static
     */
    static unifiedSpace(str: string): string;
    /**
     * 全ての文字を共通化
     * @param {string} str - 対象文字列
     * @returns {string} 変換後
     * @static
     */
    static normalize(str: string, useLowerCase?: boolean): string;
    /**
     * 正規表現文字列エスケープ
     * @param {string} str - 対象文字列
     * @returns {string} 変換後
     * @static
     */
    static escapeRegExp(str: string): string;
    /**
     * 類似文字列検索
     * @param {string} str - 対象文字列
     * @param {string[]} list - 比較文字列リスト
     * @returns {[string, number]|false} 類似文字列と類似度
     * @static
     */
    static similarString(str: string, list: string[]): [string, number] | false;
    /**
     * レーベンシュタイン距離
     * @param {string} str1 - 対象文字列
     * @param {string} str2 - 比較文字列
     * @returns {number} 類似度
     * @static
     */
    static levenshteinDistance(str1: string, str2: string): number;
    /**
     * N-gram
     * @param {string} a - 対象文字列
     * @param {string} b - 比較文字列
     * @param {number} n - N-gramの長さ
     * @returns {number} 類似度
     * @static
     */
    static calcNgram(a: string, b: string, n: number): number;
    static _getToNgram(text: any, n?: number): {};
    static _getValuesSum(object: any): any;
    /**
     * UTF-8でのバイト数を取得
     * @param {string} str - 対象文字列
     * @returns {number} バイト数
     * @static
     */
    static utf8ByteLength(str: string): number;
    /**
     * 自作ワンタイムパスワード
     * @param {number} key - キーのseed
     * @returns {number} 結果
     * @static
     */
    static totp(key: number): number;
    /**
     * GASのUtilities.formatDateの移植(弱体)
     * @param {Date} date - 日付
     * @param {string} format - フォーマット
     * @returns {string} フォーマット結果
     * @static
     */
    static formatDate(date: Date, format: string): string;
    /**
     * 乱数生成
     * @param {number} [min=1] - 最小値
     * @param {number} [max=0] - 最大値
     * @param {number} [step=1] - ステップ
     * @returns {number} 乱数
     */
    static random(min?: number, max?: number, step?: number): number;
    /**
     * 小数点以下を程よく丸める
     * @param {number} num - 数値
     * @returns {number} 数値
     */
    static roundToPrecision(num: number): number;
    /**
     * jsの小数丸め誤差を無視して比較する
     * @param {number} a - 比較数値
     * @param {number} b - 比較数値
     * @returns {boolean} 比較結果
     * @static
     */
    static compareFloats(a: number, b: number): boolean;
    /**
     * 厳格な数値チェック
     * @param {number} n - 数値
     * @returns {boolean} 数値かどうか
     * @static
     */
    static isNumber(n: number): boolean;
    /**
     * 数値変換
     * @param {any} n - 数値に変換する
     * @param {boolean} [noNaN=false] - NaNを0にするか
     * @returns {number} 数値
     * @static
     */
    static toNumber(n: any, noNaN?: boolean): number;
    /**
     * Arduinoのmapの移植
     * @param {number} val - 値
     * @param {number} fromMin - 現在の最小値
     * @param {number} fromMax - 現在の最大値
     * @param {number} toMin - 結果の最小値
     * @param {number} toMax - 結果の最大値
     * @returns {number} 結果
     * @static
     */
    static map(val: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number;
    /**
     * 数値、配列の合計
     * @param {...number|number[]} data - 数値
     * @returns {number} 合計
     * @static
     */
    static sum(...data: (number | number[])[]): number;
    /**
     * 範囲制限
     * @param {number} val - 数値
     * @param {number} baseMin - 最小値
     * @param {number} baseMax - 最大値
     */
    static constrain(val: number, baseMin: number, baseMax: number): number;
    /**
     * Pythonのrangeの移植
     * @param {number} start - 開始
     * @param {number} [end] - 終了
     * @param {number} [step=1] - ステップ
     * @returns {array} 結果
     * @static
     */
    static range(start: number, end?: number, step?: number): any[];
    /**
     * 均等に数値を分割
     * @param {number} val - 全体数
     * @param {number} cou - 分割数
     * @returns {array} 分割結果
     * @static
     */
    static divideEqually(val: number, cou: number): any[];
    /**
     * 配列を分割(n個ずつ)
     * @param {array} arr - 配列
     * @param {number} size - 分割数
     * @returns {array} 分割結果
     * @static
     */
    static chunk(arr: any[], size: number): any[];
    /**
     * 配列を分割(n個に)
     * @param {array} arr - 配列
     * @param {number} size - 分割数
     * @returns {array} 分割結果
     * @static
     */
    static chunkDivide(arr: any[], size: number): any[];
    /**
     * 線形補間
     * @param {number} start - 開始
     * @param {number} end - 終了
     * @param {number} t - 時間(0~1)
     * @returns {number} 結果
     */
    static animationLeap(start: number, end: number, t: number): number;
    /**
     * 滑らかな線形補間
     * @param {number} start - 開始
     * @param {number} end - 終了
     * @param {number} t - 時間(0~1)
     * @returns {number} 結果
     */
    static animationSmoothDamp(start: number, end: number, t: number): number;
    /**
     * ラジアンから度に変換
     * @param {number} radian - ラジアン
     * @returns {number} 度
     * @static
     */
    static rad2deg(radian: number): number;
    /**
     * 度からラジアンに変換
     * @param {number} degree - 度
     * @returns {number} ラジアン
     * @static
     */
    static deg2rad(degree: number): number;
    /**
     * ラジアンを正規化(0~2πに変換)
     * @param {number} radian - 角度
     * @param {boolean} [symmetric = false] - 範囲を0~2πから-π~πに変更する
     * @returns {number} 角度
     * @static
     */
    static normalizeRadian(radian: number, symmetric?: boolean): number;
    /**
     * 度を正規化(0~360に変換)
     * @param {number} degree - 角度
     * @returns {number} 角度
     * @static
     */
    static normalizeDegree(degree: number): number;
    /**
     * 2つのラジアンの差が許容範囲内か判定
     * @param {number} radian1 - 角度
     * @param {number} radian2 - 角度
     * @param {number} [tolerance=1e-4] - 許容範囲
     * @param {boolean} [toHalf=false] - [0,π], [π/2,π*(3/2)]は同一と見なす
     * @returns {boolean} 結果
     */
    static isRadiansEqual(radian1: number, radian2: number, tolerance?: number, toHalf?: boolean): boolean;
    /**
     * ファイル選択画面表示
     * @param {string} [accept="*"] - 受け付ける拡張子
     * @param {boolean} [multiple=false] - 複数選択
     * @param {number} [timeout=180000] - タイムアウト(ms)
     * @param {boolean} [directory=false] - ディレクトリ選択
     * @returns {Promise<File[]>} 選択結果
     * @static
     */
    static showOpenFileDialog(accept?: string, multiple?: boolean, timeout?: number, directory?: boolean): Promise<File[]>;
    static _getDropFilesEvent(items: any, callback: any): Promise<void>;
    /**
     * File(配列)をFileListに変換
     * @param {File[] | File} files - ファイル配列
     * @returns {FileList} ファイルリスト
     * @static
     */
    static arrayToFileList(files: File[] | File): FileList;
    /**
     * ファイルの種類を判定
     * @param {File} fileObj - ファイルオブジェクト
     * @returns {Promise<array>} ファイルタイプ
     * @static
     */
    static getFileType(fileObj: File): Promise<any[]>;
    /**
     * ファイルのMINEタイプ取得
     * @param {string} ext - 拡張子
     * @returns {string|array} ファイルタイプ
     * @static
     */
    static getMimeType(ext: string): string | any[];
    /**
     * 通知許可
     * @returns {Promise<boolean>} 許可状態
     * @static
     */
    static allowNotification(): Promise<boolean>;
    /**
     * 通知送信
     * @param {string} title - タイトル
     * @param {string} text - 本文
     * @param {object} opt - オプション
     * @returns {Notification} 通知オブジェクト
     * @static
     */
    static sendNotification(title: string, text: string, opt?: object): Notification;
    /**
     * 全画面表示解除
     * @param {document} [elem] - 全画面表示の解除
     * @returns {Promise<undefined>|null} 全画面表示解除
     * @static
     */
    static exitFullscreen(elem?: Document): Promise<undefined> | null;
    /**
     * 全画面表示状態のDOMを取得
     * @param {document} [elem] - 全画面表示状態のDOM
     * @returns {HTMLElement} 全画面表示状態のDOM
     * @static
     */
    static getFullscreen(elem?: Document): HTMLElement;
    /**
     * カメラを止める
     * @param {HTMLVideoElement | MediaStream} stream - 映像
     * @returns {undefined}
     * @static
     */
    static stopCamera(stream: HTMLVideoElement | MediaStream): undefined;
    /**
     * Streamを全停止する
     * @param {HTMLVideoElement | MediaStream} stream - Stream
     * @returns {undefined}
     * @static
     */
    static stopStream: typeof Jasc.stopCamera;
    /**
     * 位置情報を取得する
     * @param {Object} [opt={}] - オプション
     * @param {number} [opt.maximumAge=0] - キャッシュ時間
     * @param {number} [opt.timeout=Infinity] - タイムアウト
     * @param {boolean} [opt.enableHighAccuracy=false] - 高精度で返却
     * @returns {Promise<Position>} 位置情報
     * @throws {Error} geolocation is not supported
     * @static
     */
    static getCurrentPosition({ maximumAge, timeout, enableHighAccuracy }?: {
        maximumAge?: number;
        timeout?: number;
        enableHighAccuracy?: boolean;
    }): Promise<Position>;
    /**
     * バイブレーションを実行させる
     * @param {number|number[]} duration - ミリ秒
     * @returns {boolean} 実行結果
     * @static
     */
    static playVibrate(duration?: number | number[]): boolean;
    /**
     * バイブレーション動作をループさせる
     * @param {number|number[]} duration - ミリ秒
     * @param {number} [wait=100] - 待機時間
     * @returns {undefined}
     * @static
     */
    static setVibrateInterval(duration: number | number[], wait?: number): undefined;
    /**
     * ループしているバイブレーション動作を停止させる
     * @returns {boolean} 停止結果
     * @static
     */
    static clearVibrateInterval(): boolean;
    /**
     * 合成音声の種類を取得する
     * @param {string} [lang=null] - 言語(特定言語抽出機能)
     * @returns {Promise<{lang: string, name: string}[]>} 合成音声の種類
     * @static
     */
    static getVoiceNameList(lang?: string): Promise<{
        lang: string;
        name: string;
    }[]>;
    /**
     * 合成音声を再生する
     * @param {string} text - テキスト
     * @param {object} [opt] - オプション
     * @param {string} [opt.lang="ja-JP"] - 言語
     * @param {string} [opt.voiceName=null] - 音声名(部分一致許容)
     * @param {number} [opt.volume=1] - 音量(0~1)
     * @param {number} [opt.pitch=1] - 音程(0~2)
     * @param {number} [opt.rate=1] - 音速(0.1~10)
     * @param {boolean} [opt.addQueue=true] - 再生キューに追加
     * @param {boolean} [opt.obligation=false] - 上書き再生
     * @param {number} [opt.tryCount=5] - 再生試行回数
     * @param {function(number):undefined} [opt.tryCallback=null] - 試行コールバック
     * @returns {SpeechSynthesisVoice | false | null} 合成音声
     * @static
     */
    static playSpeech(text?: string, { lang, voiceName, volume, pitch, rate, addQueue, obligation, tryCount, tryCallback }?: {
        lang?: string;
        voiceName?: string;
        volume?: number;
        pitch?: number;
        rate?: number;
        addQueue?: boolean;
        obligation?: boolean;
        tryCount?: number;
        tryCallback?: (arg0: number) => undefined;
    }): SpeechSynthesisVoice | false | null;
    /**
     * 合成音声の再生を一時停止する
     * @returns {boolean}
     * @static
     */
    static pauseSpeech(): boolean;
    /**
     * 合成音声の一時停止を再開する
     * @returns {boolean}
     * @static
     */
    static resumeSpeech(): boolean;
    /**
     * 合成音声の再生をキャンセルする
     * @returns {undefined}
     * @static
     */
    static cancelSpeech(): undefined;
    /**
     * Service Workerを削除
     * @returns {number} 削除件数
     * @throws {ReferenceError} navigator.serviceWorker is not supported
     * @async
     * @static
     */
    static unregisterServiceWorker(): number;
    /**
     * class同士の演算補助
     * オーバーロード方法1
     *
     * `customOperator(Object,"+")(a => b => a + b)`
     * を定義で
     * `1["+"](3) // => 4`
     * となる
     *
     * @param {object} obj - 対象オブジェクト
     * @param {string} [op="+"] - 演算子
     * @returns {void}
     * @static
     */
    static customOperator(obj: object, op?: string): void;
    /**
     * cookieの値を取得
     * @param {string} name - 名前
     * @returns {string|null} 値
     * @static
     */
    static getCookie(name: string): string | null;
    /**
     * cookieの値を削除
     * @param {string} name - 名前
     * @returns {boolean} 成功したか
     * @static
     */
    static removeCookie(name: string): boolean;
    /**
     * cookieを追加・更新
     * @param {string} name - 名前
     * @param {string} value - 値
     * @param {object} [opt] - オプション
     * @param {number} [opt.days=3] - 日数
     * @returns {boolean} 成功したか
     * @static
     */
    static setCookie(name: string, value: string, opt?: {
        days?: number;
    }): boolean;
    /**
     * replaceのPromises対応版
     * @param {string} str - 文字列
     * @param {RegExp} regex - 正規表現
     * @param {function(string,...any):Promise<string>} asyncFn - replace時実行非同期関数
     * @returns {Promise<string>} 変換後
     * @async
     * @static
     */
    static replaceAsync(str: string, regex: RegExp, asyncFn: (arg0: string, ...args: any[]) => Promise<string>): Promise<string>;
    /**
     * definePropertyをprototypeに使用した際の問題対策
     * - prototypeを探るにはdepthを3にすると良い
     * @param {object} obj - オブジェクト
     * @param {number} [depth=0] - 深さ
     * @param {boolean} [isEnumerable=false] - enumerableを取得するか
     * @returns {string[]} 名前
     * @static
     */
    static getObjectPropertyNames(obj: object, depth?: number, isEnumerable?: boolean): string[];
    /**
     * hasOwnPropertyを使いやすく
     * @param {object} obj - オブジェクト
     * @param {string} key - 名前
     * @returns {[boolean, any]} 結果
     * @static
     */
    static objHasOwnProperty(obj: object, key: string): [boolean, any];
    /**
     * メゾットがセッターかを判定
     * @param {object} obj - オブジェクト
     * @param {string} key - 名前
     * @returns {boolean} 結果
     * @static
     */
    static isSetter(obj: object, key: string): boolean;
    /**
     * メゾットがゲッターかを判定
     * @param {object} obj - オブジェクト
     * @param {string} key - 名前
     * @returns {boolean} 結果
     * @static
     */
    static isGetter(obj: object, key: string): boolean;
    /**
     * 乱数生成
     * @memberof Jasc
     * @param {number} [seed=88675123] - 乱数シード
     * @returns {Jasc.Random} 乱数
     * @static
     */
    static Random: {
        new (seed?: number): {
            "__#2@#x": number;
            "__#2@#y": number;
            "__#2@#z": number;
            "__#2@#w": number;
            next(): number;
            nextInt(min?: number, max?: number): number;
        };
    };
    /**
     * カスタムログ
     * @memberof Jasc
     * @param {object} [arg] - オプション
     * @param {boolean} [arg.debug=false] - 通常表示を表示するか
     * @param {boolean} [arg.oblInd=true] - 必須表示を表示するか
     * @param {string} [arg.prefix=""] - 前に表示する名称
     * @param {object} [arg.style] - カスタムスタイル
     * @returns {Jasc.ConsoleCustomLog}
     * @static
     */
    static ConsoleCustomLog: {
        new (arg?: {}): {
            "__#3@#isDebug": any;
            "__#3@#isOblInd": any;
            "__#3@#prefix": any;
            "__#3@#timeArr": {};
            style: any;
            /**
             * デバックモードON/OFF
             * @param {boolean} flag - デバックモード
             * @returns {undefined}
             */
            debug: boolean;
            /**
             * 必須表示ON/OFF
             * @param {boolean} flag - 必須表示
             * @returns {undefined}
             */
            obligationIndication: boolean;
            /**
             * 接頭語取得
             * @returns {string}
             */
            head: string;
            /**
             * カスタムスタイルを追加
             * @param {string} name - 名前
             * @param {string} style - スタイル
             * @returns {undefined}
             */
            custom(name: string, style: string): undefined;
            /**
             * フォーマットして出力
             * @param {any[]} data - データ
             * @param {function} output - 出力関数
             * //@private
             */
            _formatOutput(data: any[], output: Function): void;
            /**
             * ログ表示
             * @param {...any} data - ログ
             * @param {string} type - [最後-1]表示スタイル名(又はcssスタイル)
             * @param {boolean} [obligation=false] - [最後]必須表示
             * @returns {undefined}
             */
            log(...data: any[]): undefined;
            /**
             * 警告表示
             * @param {any} errObj - ログ
             * @param {boolean} [obligation=false] - 必須表示
             * @returns {undefined}
             */
            warn(...data: any[]): undefined;
            /**
             * エラー表示
             * @param {any} errObj - ログ
             * @param {boolean} [obligation=false] - 必須表示
             * @returns {undefined}
             */
            error(...data: any[]): undefined;
            /**
             * 時間計測
             * @param {string} name - 名前
             * @param {boolean} [obligation=false] - 必須表示
             * @returns {number|false} 経過時間
             */
            time(name: string, obligation?: boolean): number | false;
        };
    };
    /**
     * 画像管理
     * @memberof Jasc
     * @param {object} urls - URL
     * @returns {Jasc.AssetsManager}
     * @static
     */
    static AssetsManager: {
        new (urls?: {}): {
            "__#4@#url2Map": any;
            "__#4@#imageMap": any;
            /**
             * 画像追加
             * @param {object} [opt] - オプション
             * @param {string} [name] - 画像呼び出し名
             * @param {string} [url] - 画像URL
             * @returns {Promise<Image>}
             */
            getImage({ name, url }?: object): Promise<new (width?: number, height?: number) => HTMLImageElement>;
            /**
             * キャッシュ追加
             * @param {HTMLImageElement} data - 画像
             * @param {string} name - 画像呼び出し名
             * @returns {undefined}
             */
            addCache(data: HTMLImageElement, name: string): undefined;
            /**
             * アセット削除
             * @param {string} name - アセット呼び出し名
             * @returns {undefined}
             */
            del(name: string): undefined;
            /**
             * アセット全削除
             * @returns {undefined}
             */
            clear(): undefined;
        };
    };
    /**
     * Base62変換
     * @memberof Jasc
     * @returns {Jasc.Base62}
     * @static
     */
    static Base62: {
        new (): {};
        /**
         * 変換文字列
         * @type {string}
         * @static
         * @readonly
         */
        readonly _CHARSET: string;
        /**
         * CHARSET文字数
         * @type {number}
         * @static
         * @readonly
         */
        readonly _BASE: number;
        /**
         * 変換表
         * @type {object}
         * @static
         * @readonly
         */
        readonly _CHAR_INDEX: object;
        /**
         * 変換表(BigInt版)
         * @type {object}
         * @static
         * @readonly
         */
        readonly _BIGINT_CHAR_INDEX: object;
        /**
         * 10進数を62進数に変換
         * @param {number | bigint} [num=0] - 10進数
         * @returns {string}
         * @static
         */
        encode(num?: number | bigint): string;
        /**
         * 62進数を10進数に変換
         * @param {string} str - 62進数
         * @returns {number}
         * @static
         */
        decode(str: string): number;
        /**
         * 10進数を62進数に変換(BigInt版)
         * @param {number | bigint} [num=0] - 10進数
         * @returns {string}
         * @static
         */
        encodeBigInt(num?: number | bigint): string;
        /**
         * 62進数を10進数に変換(BigInt版)
         * @param {string} str - 62進数
         * @returns {bigint}
         * @static
         */
        decodeBigInt(str: string): bigint;
    };
    _jasc_debug: boolean;
    _ccLog: {
        "__#3@#isDebug": any;
        "__#3@#isOblInd": any;
        "__#3@#prefix": any;
        "__#3@#timeArr": {};
        style: any;
        /**
         * デバックモードON/OFF
         * @param {boolean} flag - デバックモード
         * @returns {undefined}
         */
        debug: boolean;
        /**
         * 必須表示ON/OFF
         * @param {boolean} flag - 必須表示
         * @returns {undefined}
         */
        obligationIndication: boolean;
        /**
         * 接頭語取得
         * @returns {string}
         */
        head: string;
        /**
         * カスタムスタイルを追加
         * @param {string} name - 名前
         * @param {string} style - スタイル
         * @returns {undefined}
         */
        custom(name: string, style: string): undefined;
        /**
         * フォーマットして出力
         * @param {any[]} data - データ
         * @param {function} output - 出力関数
         * //@private
         */
        _formatOutput(data: any[], output: Function): void;
        /**
         * ログ表示
         * @param {...any} data - ログ
         * @param {string} type - [最後-1]表示スタイル名(又はcssスタイル)
         * @param {boolean} [obligation=false] - [最後]必須表示
         * @returns {undefined}
         */
        log(...data: any[]): undefined;
        /**
         * 警告表示
         * @param {any} errObj - ログ
         * @param {boolean} [obligation=false] - 必須表示
         * @returns {undefined}
         */
        warn(...data: any[]): undefined;
        /**
         * エラー表示
         * @param {any} errObj - ログ
         * @param {boolean} [obligation=false] - 必須表示
         * @returns {undefined}
         */
        error(...data: any[]): undefined;
        /**
         * 時間計測
         * @param {string} name - 名前
         * @param {boolean} [obligation=false] - 必須表示
         * @returns {number|false} 経過時間
         */
        time(name: string, obligation?: boolean): number | false;
    };
    _textNode_allowedTextTag: string[];
    _textNode_allowedNodeType: (3 | 4 | 8)[];
    requestAnimationFrame: any;
    now: any;
    getTime: typeof Jasc.getTime;
    /**
     * 初期設定
     * @param {Object} args json形式
     * @param {boolean} [args.isGame=false] - ゲームモードを使用するか
     * @param {string} [args.libPath="./jascLib/"] - ライブラリのフォルダまでのpath
     * @param {Object<string, boolean>} [args.useLib={}] - ライブラリを使用する場合に記述
     * @param {Array<string|string[]>} [args.openFuncList=["jasc.acq", "Jasc.isAssociative"]] - グローバル関数化する関数名を記述する
     * @returns {undefined}
     */
    set initSetting(args: {
        isGame?: boolean;
        libPath?: string;
        useLib?: {
            [x: string]: boolean;
        };
        openFuncList?: Array<string | string[]>;
    });
    /**
     * 初期設定
     * @returns {Object} json形式
     */
    get initSetting(): any;
    /**
     * 設定
     * @param {Object} args json形式
     * @param {boolean} [args.logDebug=false] - デバッグログを出力するか
     * @param {number} [args.gameFps=60] - ゲームのFPS最大値を指定
     * @param {number} [args.BBFCapacity=30] - 1フレームの実行限界数(溢れは持ち越し)
     * @param {number} [args.isCanvasAutoResize=false] - canvasを自動で画面サイズに合わせてresize
     * @param {Object<string,HTMLCanvasElement>} [args.canvas] - 使用するcanvasを指定
     * @returns {undefined}
     */
    set setting(args: {
        logDebug?: boolean;
        gameFps?: number;
        BBFCapacity?: number;
        isCanvasAutoResize?: number;
        canvas?: {
            [x: string]: HTMLCanvasElement;
        };
    });
    /**
     * 設定
     * @returns {Object} json形式
     */
    get setting(): any;
    _updateOnlineStatus: any;
    /**
     * 疑似イベントリスナー
     * @param {string} [eventType=""] - イベントの種類
     * @param {function} [callback] - イベントのコールバック関数
     * @param {string} [name=auto] - 削除時の参照用名称
     * @param {object} [option] - オプション
     * @param {boolean} [option.returnName=false] - 登録した名称を返すか
     * @param {boolean} [option.once=false] - 一度だけ実行
     * @param {boolean} [option.runAnimationFrame=false] - requestAnimationFrameのタイミングで実行
     * @returns {-1|0|1|string|string[]} -1:イベント登録成功(即時実行) 0:イベント登録成功 1:イベント登録失敗
     */
    addEventListener: any;
    /**
     * 疑似イベントリスナー
     * @param {string} [eventType=""] - イベントの種類
     * @param {function} [callback] - イベントのコールバック関数
     * @param {string} [name=auto] - 削除時の参照用名称
     * @param {object} [option] - オプション
     * @param {boolean} [option.returnName=false] - 登録した名称を返すか
     * @param {boolean} [option.once=false] - 一度だけ実行
     * @param {boolean} [option.runAnimationFrame=false] - requestAnimationFrameのタイミングで実行
     * @returns {-1|0|1|string|string[]} -1:イベント登録成功(即時実行) 0:イベント登録成功 1:イベント登録失敗
     */
    on: any;
    /**
     * 疑似イベントリスナーの削除
     * @param {string} eventType - イベントの種類
     * @param {string} [name=""] - 削除時の参照用名称
     * @returns {0|1|2|object} 0:イベント削除成功 1:イベント削除失敗 2:イベント削除失敗(無効なイベント名)
     */
    removeEventListener: any;
    /**
     * 疑似イベントリスナーの削除
     * @param {string} [eventType=""] - イベントの種類
     * @param {string} [name] - 削除時の参照用名称
     * @returns {0|1|2|string[]} 0:イベント削除成功 1:イベント削除失敗 2:イベント削除失敗(無効なイベント名)
     */
    off: any;
    /**
     * 疑似イベントリスナーの発火
     * @param {string} [eventType=""] - イベントの種類
     * @param {any[]} [args] - イベントの引数
     * @returns {number} - 発火したイベント数
     */
    _dispatchEvent(eventType?: string, ...args?: any[]): number;
    /**
     * jascネットワーク グローバル変数管理
     */
    global: {
        /**
         * グローバル変数取得
         * @param {string} key - キー
         * @param {any} [defaultValue] - デフォルト値
         * @returns {any} 値
         */
        get(key: string, defaultValue?: any): any;
        /**
         * グローバル変数設定
         * @param {string} key - キー
         * @param {any} value - 値
         * @returns {undefined}
         * @throws {Error} キーが空の場合
         */
        set(key: string, value: any): undefined;
        /**
         * グローバル変数削除
         * @param {string} key - キー
         * @returns {undefined}
         */
        delete(key: string): undefined;
        /**
         * グローバル変数オブジェクト取得(管理用)
         * @returns {object} jasc.#_global
         */
        _getDictionary(): object;
    };
    /**
     * DOM取得
     * @param {string|jQuery|HTMLElement} [str] - 取得対象
     * @param {Window|Document|jQuery|HTMLElement} [par=document] - 取得対象の親
     * @returns {Window|Document|HTMLElement|HTMLElement[]}
     */
    acq: any;
    /**
     * DOM取得
     * @param {string|jQuery|HTMLElement} [str] - 取得対象
     * @param {Window|Document|jQuery|HTMLElement} [par=document] - 取得対象の親
     * @returns {Window|Document|HTMLElement|HTMLElement[]}
     */
    $: any;
    /**
     * jQueryオブジェクト→DOM変換
     * @param {Window|Document|jQuery|HTMLElement|HTMLElement[]} obj
     * @returns {Window|Document|HTMLElement|HTMLElement[]}
     */
    jQueryObjToDOM: any;
    /**
     * classを反転
     * @param {string|jQuery|HTMLElement|HTMLElement[]} name - class反転対象
     * @param {string} str - class名
     * @returns {undefined}
     */
    toggleClass(name: string | jQuery | HTMLElement | HTMLElement[], str: string): undefined;
    /**
     * css変数取得&書き換え
     * @param {string} name - css変数名
     * @param {string} [val] - css変数値
     * @returns {string|false} css変数値
     */
    cssVariableIO: typeof Jasc.cssVariableIO;
    /**
     * スクロールバー存在判定X
     * @param {HTMLElement} [elem=document.body] - 対象
     * @returns {boolean}
     */
    scrollbarXVisible: typeof Jasc.scrollbarXVisible;
    /**
     * スクロールバー存在判定Y
     * @param {HTMLElement} [elem=document.body] - 対象
     * @returns {boolean}
     */
    scrollbarYVisible: typeof Jasc.scrollbarYVisible;
    /**
     * スクロール位置判定
     * @param {Event} e - Scrollイベント
     * @param {number} [margin=0] - 上限下限の許容値
     * @returns {"top"|"bottom"|"scrolling"} 現在のスクロール位置
     */
    getScrollVerticalPosition: typeof Jasc.getScrollVerticalPosition;
    /**
     * ファイル動的読み込み
     * @param {string} src - ファイルurl
     * @param {Object} [opt] - オプション
     * @param {boolean} [opt.exp=""] - 設定タグ名(script,link)
     * @param {string} [opt.srcType=""] - 設定タグ名(src,href)
     * @param {string} [opt.module=false] - moduleかどうか
     * @param {boolean} [opt.async=false] - 非同期読み込み(ダウンロード後実行(割込み))
     * @param {boolean} [opt.defer=false] - 非同期読み込み(HTML読み込み後実行)
     * @returns {Promise<number>} -1:重複 0:正常終了 1:異常終了
     */
    loadFile(src: string, opt?: {
        exp?: boolean;
        srcType?: string;
        module?: string;
        async?: boolean;
        defer?: boolean;
    }): Promise<number>;
    /**
     * 外部リンク判定
     * @param {jQuery|HTMLElement} elem - 対象(href属性が存在すること)
     * @returns {boolean}
     */
    isExternalLink(elem: jQuery | HTMLElement): boolean;
    /**
     * テキストノード判定
     * @param {jQuery|HTMLElement} elem - 対象
     * @returns {boolean}
     */
    isTextNode(elem: jQuery | HTMLElement): boolean;
    /**
     * dom出現待機
     * @param {string} selector - セレクタ
     * @param {string} [text] - テキスト
     * @param {number} [timeoutMs=0] - タイムアウト
     * @param {document|HTMLElement} [par=document] - 対象
     * @returns {Promise<HTMLElement|null>} 検出時実行
     */
    waitForElement(selector: string, text?: string, timeoutMs?: number, par?: Document | HTMLElement): Promise<HTMLElement | null>;
    /**
     * イベントリスナー拡張
     * @param {string} [eventType=""] - イベントタイプ
     * @param {function} [callback] - イベントのコールバック関数
     * @param {jQuery|HTMLElement|string} elem - 対象
     * @param {string} [name] - 削除時の参照用名称
     * @param {boolean} [returnName=false] - 登録した名称を返すか
     * @returns {0|1|string|string[]} 登録した名称またはエラーコード
     */
    addExEventListener: any;
    /**
     * イベントリスナー拡張
     * @param {string} [eventType=""] - イベントタイプ
     * @param {function} [callback] - イベントのコールバック関数
     * @param {jQuery|HTMLElement} elem - 対象
     * @param {string} [name] - 削除時の参照用名称
     * @param {boolean} [returnName=false] - 登録した名称を返すか
     * @returns {0|1|string|string[]} 登録した名称またはエラーコード
     */
    onEx: any;
    /**
     * イベントリスナー拡張 削除
     * @param {string} eventType - イベントタイプ
     * @param {string} [name=""] - 削除時の参照用名称
     * @returns {0|1|2|object} 0:イベント削除成功 1:イベント削除失敗 2:イベント削除失敗(無効なイベント名)
     */
    removeExEventListener: (eventType: string, name?: string) => 0 | 1 | 2 | object;
    /**
     * イベントリスナー拡張 削除
     * @param {string} eventType - イベントタイプ
     * @param {string} [name=""] - 削除時の参照用名称
     * @returns {0|1|2|object} 0:イベント削除成功 1:イベント削除失敗 2:イベント削除失敗(無効なイベント名)
     */
    offEx: (eventType: string, name?: string) => 0 | 1 | 2 | object;
    /**
     * イベントリスナー拡張 作成・削除
     * @param {HTMLElement} elem - 対象
     * @param {string} eventType - イベントタイプ
     * @param {string} name - 削除時の参照用名称
     * @param {function} [callback] - イベントのコールバック関数
     */
    _exEventIO(elem: HTMLElement, eventType: string, name: string, callback?: Function): string;
    /**
     * イベントリスナー拡張 発火
     * @param {string} eventType - イベントタイプ
     * @param {function} callback - イベントのコールバック関数
     * @param {object} obj - イベントオブジェクト
     * @returns {function} - イベントのコールバック関数
     */
    _dispatchExEvent: any;
    /**
     * jQueryのajaxを再現
     * @param {object} opt - オプション
     * @param {boolean} [opt.async=true] - 非同期
     * @param {string} [opt.charset="UTF-8"] - 文字コード
     * @param {string} [opt.contentType] - Content-Type
     * @param {string} [opt.dataType="text"] - データタイプ
     * @param {string} [opt.password] - パスワード
     * @param {"GET"|"POST"} [opt.type="GET"] - GET/POST
     * @param {string} [opt.url] - URL
     * @param {string} [opt.username] - ユーザー名
     * @param {object|string} [opt.data] - データ
     * @param {number} [opt.timeout=0] - タイムアウト
     * @param {function} [opt.complete] - 完了時コールバック
     * @param {function} [opt.error] - エラー時コールバック
     * @param {function} [opt.success] - 成功時コールバック
     * @returns {undefined}
     */
    ajax: any;
    /**
     * 動的url
     * @param {string} url - 変更後url
     * @param {object} [data] - 保持するデータ
     * @param {boolean} [log] - ブラウザの履歴に書き込むか
     * @returns {undefined}
     */
    historyPush: typeof Jasc.historyPush;
    /**
     * urlパラメータ分解
     * @param {string} data - url
     * @returns {object}
     */
    getUrlVars: typeof Jasc.getUrlVars;
    /**
     * 相対url(絶対url)→絶対url
     * @param {string} path - 相対url
     * @param {boolean} [notElem=false] - aタグを使用しない方式(new URL)
     * @returns {string} 絶対url
     */
    absolutePath(path?: string, notElem?: boolean): string;
    /**
     * Url共有
     * @param {object} json - 共有するデータ
     * @param {string} [json.title=document.title] - タイトル
     * @param {string} [json.text=""] - テキスト
     * @param {string} [json.url=""] - url
     * @returns {Promise<undefined>} 完了後実行
     */
    autoUrlShare(json: {
        title?: string;
        text?: string;
        url?: string;
    }): Promise<undefined>;
    /**
     * クリップボードにコピー
     * @param {string} data - コピーするデータ
     * @returns {Promise<undefined>} 完了後実行
     */
    copy2Clipboard: typeof Jasc.copy2Clipboard;
    /**
     * 変数の型統一変換[破壊的関数]
     * @param {object} data - 変数
     * @param {number} [nestingDepth=0] - 再帰する深さ
     * @returns {object} 変数
     */
    dataTypeFormatting: typeof Jasc.dataTypeFormatting;
    /**
     * 値がNative Codeか判定
     * @param {any} value - 値
     * @param {boolean} [severe=true] - 厳格な判定
     * @returns {boolean} 結果
     */
    isNativeCode: typeof Jasc.isNativeCode;
    /**
     * 指定時間待機
     * @param {number} [ms=1000] - 待機時間
     * @returns {Promise<undefined>}
     */
    sleep: typeof Jasc.sleep;
    /**
     * canvas描画関係
     */
    draw: {
        /**
         * ctxを設定・リセットする
         * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
         * @param {object} [options] - オプション
         * @param {string} [options.direction="inherit"] - 文字方向
         * @param {string} [options.fillStyle="#000"] - 塗りつぶしのスタイル
         * @param {string} [options.filter="none"] - フィルター
         * @param {string} [options.font="10px sans-serif"] - フォント
         * @param {string} [options.fontKerning="auto"] - 文字間隔
         * @param {string} [options.fontStretch="normal"] - 文字伸縮
         * @param {string} [options.fontVariantCaps="normal"] - 文字大文字
         * @param {number} [options.globalAlpha=1] - アルファ
         * @param {string} [options.globalCompositeOperation="source-over"] - アルファ合成
         * @param {string} [options.letterSpacing="0px"] - 文字間隔
         * @param {string} [options.lineCap="butt"] - 線の端
         * @param {number} [options.lineDashOffset=0] - 線の間隔
         * @param {string} [options.lineJoin="miter"] - 線の結合
         * @param {number} [options.lineWidth=1] - 線の幅
         * @param {string} [options.strokeStyle="#000"] - 線のスタイル
         * @param {number} [options.miterLimit=10] - 線の結合
         * @param {number} [options.shadowBlur=0] - 影のぼかし
         * @param {string} [options.shadowColor="#000"] - 影の色
         * @param {number} [options.shadowOffsetX=0] - 影の位置
         * @param {number} [options.shadowOffsetY=0] - 影の位置
         * @param {number} [options.strokeMiterLimit=10] - 線の結合
         * @param {number} [options.strokeWidth=1] - 線の幅
         * @param {string} [options.textAlign="start"] - 文字の位置
         * @param {string} [options.textBaseline="alphabetic"] - 文字の位置
         * @param {string} [options.wordSpacing="0px"] - 単語間隔
         * @returns {undefined}
         */
        ctxSetting: any;
        /**
         * キャンバスをクリア
         * @param {CanvasRenderingContext2D} [ctx] - キャンバス
         * @returns {undefined}
         */
        canvasClear: any;
        /**
         * キャンバスの変換行列を取得
         * @param {CanvasRenderingContext2D} [ctx] - キャンバス
         * @returns {Object<string, number | boolean>} 変換行列
         */
        getTransform: any;
    };
    /**
     * jascゲームエンジン関係
     */
    game: {
        /**
         * 現在のカレントキャンバスの管理
         * @param {string} [key=""] キー
         * @returns {string} 現在のキー
         */
        changeCurrentCanvas: any;
        /**
         * カレントキャンバスを取得
         * @returns {HTMLCanvasElement} キャンバスオブジェクト
         */
        getCurrentCanvas: any;
        /**
         * カレントctxを取得
         * @returns {CanvasRenderingContext2D} ctxオブジェクト
         */
        getCurrentCtx: any;
        /**
         * キャンバス名を取得
         * @param {HTMLCanvasElement | CanvasRenderingContext2D} canvas - キャンバス
         * @returns {string} キャンバス名
         */
        getCanvasName: any;
        /**
         * canvasリサイズ
         * @param {number} [width=0] 横幅
         * @param {number} [height=0] 高さ
         * @param {number} [scale=1] キャンバスサイズ
         * @returns {undefined}
         */
        canvasResize: any;
        /**
         * キャンバス描画可能サイズを取得
         * @param {HTMLCanvasElement | string} [canvas] - キャンバス
         * @returns {object} { width, height }
         */
        getCanvasSize: any;
    };
    /**
     * 連想配列かどうか判定
     * @param {object} obj - 連想配列
     * @returns {boolean}
     */
    isAssociative: typeof Jasc.isAssociative;
    /**
     * setを比較する
     * @param {Set} a - set1
     * @param {Set} b - set2
     * @returns {boolean}
     */
    equalSet: typeof Jasc.equalSet;
    /**
     * オブジェクトをディープコピーする
     *
     * ※ 以下の全て参照渡し(他非対応オブジェクトなどは全て参照渡し)
     * Function, Promise, Class(一部除く), WeakMap, WeakSet
     * @param {object} obj - オブジェクト
     * @param {object} [opt] - オプション(内容はtrueで値渡し(or コピー)、falseで参照渡し)
     * @param {boolean} [opt.copyArray=true] - 配列をコピー
     * @param {boolean} [opt.copyAssociative=true] - 連想配列をコピー
     * @param {boolean} [opt.copyDOM=false] - DOM要素をコピー
     * @param {boolean} [opt.copyDate=true] - Dateをコピー
     * @param {boolean} [opt.copyArrayBuffer=true] - ArrayBufferをコピー
     * @param {boolean} [opt.copyDataView=true] - DataViewをコピー
     * @param {boolean} [opt.copyMap=false] - Mapをコピー
     * @param {boolean} [opt.copySet=false] - Setをコピー
     * @param {boolean} [opt.copyRegExp=false] - RegExpをコピー
     * @param {boolean} [opt.copySymbol=false] - Symbolをコピー
     * @param {boolean} [opt.copyError=false] - Errorをコピー
     * @param {boolean} [opt.cloneClass=false] - clone関数が存在するClassをコピー
     * @returns {object} コピーされたオブジェクト
     */
    deepCopy: typeof Jasc.deepCopy;
    /**
     * 連想配列を結合(上書き)[破壊的関数]
     * @param {object} parents - 結合先
     * @param {object} [child] - 結合元
     * @returns {undefined}
     */
    overwriteAssociative: typeof Jasc.overwriteAssociative;
    /**
     * 連想配列に自動でkeyを作成、割り当て
     * @param {object} obj - 連想配列
     * @param {any} [data] - 代入内容
     * @param {string} [baseName=""] - 基準名
     * @param {string} [prefix="-"] - 通し番号結合文字
     * @returns {string} 作成されたkey名
     */
    setAssociativeAutoName: typeof Jasc.setAssociativeAutoName;
    /**
     * オブジェクトの断層を特定
     *
     * 例:
     * "obj.a.b.c" => c
     * @param {object} obj - オブジェクト
     * @param {string|string[]} keys - キー
     * @param {any} [notFound="__NOT_FOUND__"] - 存在しない場合やエラーの返り値
     * @param {boolean} [createObj=false] - 存在しなかった場合にオブジェクトを作成
     * @returns {any} 値
     */
    getDotKey: typeof Jasc.getDotKey;
    /**
     * 不明なスペースを半角スペースに
     * @param {string} str - 対象文字列
     * @returns {string} 変換後
     */
    unifiedSpace: typeof Jasc.unifiedSpace;
    /**
     * 全ての文字を共通化
     * @param {string} str - 対象文字列
     * @returns {string} 変換後
     */
    normalize: typeof Jasc.normalize;
    /**
     * 正規表現文字列エスケープ
     * @param {string} str - 対象文字列
     * @returns {string} 変換後
     */
    escapeRegExp: typeof Jasc.escapeRegExp;
    /**
     * 類似文字列検索
     * @param {string} str - 対象文字列
     * @param {string[]} list - 比較文字列リスト
     * @returns {[string, number]|false} 類似文字列と類似度
     */
    similarString: typeof Jasc.similarString;
    /**
     * レーベンシュタイン距離
     * @param {string} str1 - 対象文字列
     * @param {string} str2 - 比較文字列
     * @returns {number} 類似度
     */
    levenshteinDistance: typeof Jasc.levenshteinDistance;
    /**
     * N-gram
     * @param {string} a - 対象文字列
     * @param {string} b - 比較文字列
     * @param {number} n - N-gramの長さ
     * @returns {number} 類似度
     */
    calcNgram: typeof Jasc.calcNgram;
    /**
     * UTF-8でのバイト数を取得
     * @param {string} str - 対象文字列
     * @returns {number} バイト数
     */
    utf8ByteLength: typeof Jasc.utf8ByteLength;
    /**
     * 自作ワンタイムパスワード
     * @param {number} key - キーのseed
     * @returns {number} 結果
     */
    totp: typeof Jasc.totp;
    /**
     * GASのUtilities.formatDateの移植(弱体)
     * @param {Date} date - 日付
     * @param {string} format - フォーマット
     * @returns {string} フォーマット結果
     */
    formatDate: typeof Jasc.formatDate;
    /**
     * 乱数生成
     * @param {number} [min=1] - 最小値
     * @param {number} [max=0] - 最大値
     * @param {number} [step=1] - ステップ
     * @returns {number} 乱数
     */
    random: typeof Jasc.random;
    /**
     * 小数点以下を程よく丸める
     * @param {number} num - 数値
     * @returns {number} 数値
     */
    roundToPrecision: typeof Jasc.roundToPrecision;
    /**
     * 組み合わせ列挙
     * @param {array} arr - 配列
     * @param {number} [number=0] - 組み合わせ数
     * @returns {array|false} 組み合わせ
     */
    permutation: any;
    /**
     * jsの小数丸め誤差を無視して比較する
     * @param {number} a - 比較数値
     * @param {number} b - 比較数値
     * @returns {boolean} 比較結果
     */
    compareFloats: typeof Jasc.compareFloats;
    /**
     * 厳格な数値チェック
     * @param {number} n - 数値
     * @returns {boolean} 数値かどうか
     */
    isNumber: typeof Jasc.isNumber;
    /**
     * 数値変換
     * @param {any} n - 数値に変換する
     * @param {boolean} [noNaN=false] - NaNを0にするか
     * @returns {number} 数値
     */
    toNumber: typeof Jasc.toNumber;
    /**
     * Arduinoのmapの移植
     * @param {number} val - 値
     * @param {number} fromMin - 現在の最小値
     * @param {number} fromMax - 現在の最大値
     * @param {number} toMin - 結果の最小値
     * @param {number} toMax - 結果の最大値
     * @returns {number} 結果
     */
    map: typeof Jasc.map;
    /**
     * 数値、配列の合計
     * @param {...number|number[]} data - 数値
     * @returns {number} 合計
     */
    sum: typeof Jasc.sum;
    /**
     * 範囲制限
     * @param {number} val - 数値
     * @param {number} baseMin - 最小値
     * @param {number} baseMax - 最大値
     */
    constrain: typeof Jasc.constrain;
    /**
     * Pythonのrangeの移植
     * @param {number} start - 開始
     * @param {number} [end] - 終了
     * @param {number} [step=1] - ステップ
     * @returns {array} 結果
     */
    range: typeof Jasc.range;
    /**
     * 均等に数値を分割
     * @param {number} val - 全体数
     * @param {number} cou - 分割数
     * @returns {array} 分割結果
     */
    divideEqually: typeof Jasc.divideEqually;
    /**
     * 配列を分割(n個ずつ)
     * @param {array} arr - 配列
     * @param {number} size - 分割数
     * @returns {array} 分割結果
     */
    chunk: typeof Jasc.chunk;
    /**
     * 配列を分割(n個に)
     * @param {array} arr - 配列
     * @param {number} size - 分割数
     * @returns {array} 分割結果
     */
    chunkDivide: typeof Jasc.chunkDivide;
    /**
     * 線形補間
     * @param {number} start - 開始
     * @param {number} end - 終了
     * @param {number} t - 時間(0~1)
     * @returns {number} 結果
     * @static
     */
    animationLeap: typeof Jasc.animationLeap;
    /**
     * 滑らかな線形補間
     * @param {number} start - 開始
     * @param {number} end - 終了
     * @param {number} t - 時間(0~1)
     * @returns {number} 結果
     * @static
     */
    animationSmoothDamp: typeof Jasc.animationSmoothDamp;
    /**
     * ラジアンから度に変換
     * @param {number} radian - ラジアン
     * @returns {number} 度
     */
    rad2deg: typeof Jasc.rad2deg;
    /**
     * 度からラジアンに変換
     * @param {number} degree - 度
     * @returns {number} ラジアン
     */
    deg2rad: typeof Jasc.deg2rad;
    /**
     * ラジアンを正規化(0~2πに変換)
     * @param {number} radian - 角度
     * @param {boolean} [symmetric = false] - 範囲を0~2πから-π~πに変更する
     * @returns {number} 角度
     */
    normalizeRadian: typeof Jasc.normalizeRadian;
    /**
     * 度を正規化(0~360に変換)
     * @param {number} degree - 角度
     * @returns {number} 角度
     */
    normalizeDegree: typeof Jasc.normalizeDegree;
    /**
     * 2つのラジアンの差が許容範囲内か判定
     * @param {number} radian1 - 角度
     * @param {number} radian2 - 角度
     * @param {number} [tolerance=1e-4] - 許容範囲
     * @returns {boolean} 結果
     * @static
     */
    isRadiansEqual: typeof Jasc.isRadiansEqual;
    /**
     * ファイル選択画面表示
     * @param {string} [accept="*"] - 受け付ける拡張子
     * @param {boolean} [multiple=false] - 複数選択
     * @param {number} [timeout=180000] - タイムアウト(ms)
     * @param {boolean} [directory=false] - ディレクトリ選択
     * @returns {Promise<File[]>} 選択結果
     */
    showOpenFileDialog: typeof Jasc.showOpenFileDialog;
    /**
     * ドロップされたファイルを取得
     * @param {string|jQuery|HTMLElement} dom - DOMオブジェクト
     * @param {function(File[]):undefined} callback - コールバック
     * @returns {undefined}
     */
    getDropFilesEvent(dom: string | jQuery | HTMLElement, callback: (arg0: File[]) => undefined): undefined;
    /**
     * File(配列)をFileListに変換
     * @param {File[] | File} files - ファイル配列
     * @returns {FileList} ファイルリスト
     */
    arrayToFileList: typeof Jasc.arrayToFileList;
    /**
     * ファイルの種類を判定
     * @param {File} fileObj - ファイルオブジェクト
     * @returns {Promise<array>} ファイルタイプ
     */
    getFileType: typeof Jasc.getFileType;
    /**
     * ファイルのMINEタイプ取得
     * @param {string} ext - 拡張子
     * @returns {string|array} ファイルタイプ
     */
    getMimeType: typeof Jasc.getMimeType;
    /**
     * 描画オブジェクトからBlobに変換
     * @param {HTMLImageElement | HTMLCanvasElement | string} img - 描画オブジェクト
     * @returns {Promise<Blob>} Blob
     */
    imgToBlob(img: HTMLImageElement | HTMLCanvasElement | string): Promise<Blob>;
    /**
     * FileからImageに変換
     * @param {File} file - ファイル
     * @param {HTMLImageElement | string} [img] - 描画オブジェクト
     * @returns {Promise<HTMLImageElement>} Image
     */
    fileToImg(file: File, img?: HTMLImageElement | string): Promise<HTMLImageElement>;
    /**
     * CanvasからImageに変換
     * @param {HTMLCanvasElement | string} canvas - Canvas
     * @returns {Promise<HTMLImageElement>} Image
     */
    canvasToImg(canvas: HTMLCanvasElement | string): Promise<HTMLImageElement>;
    /**
     * 通知許可
     * @returns {Promise<boolean>} 許可状態
     */
    allowNotification: typeof Jasc.allowNotification;
    /**
     * 通知送信
     * @param {string} title - タイトル
     * @param {string} text - 本文
     * @param {object} opt - オプション
     * @returns {Notification} 通知オブジェクト
     */
    sendNotification: typeof Jasc.sendNotification;
    /**
     * 全画面表示
     * @param {string|HTMLElement|jQuery} [elem] - 全画面表示するDOM
     * @returns {Promise<undefined>|null} 全画面表示
     */
    requestFullscreen(elem?: string | HTMLElement | jQuery): Promise<undefined> | null;
    /**
     * 全画面表示解除
     * @param {document} [elem] - 全画面表示の解除
     * @returns {undefined}
     */
    exitFullscreen: typeof Jasc.exitFullscreen;
    /**
     * 全画面表示状態のDOMを取得
     * @param {document} [elem] - 全画面表示状態のDOM
     * @returns {HTMLElement} 全画面表示状態のDOM
     */
    getFullscreen: typeof Jasc.getFullscreen;
    /**
     * カメラを起動し、映像(他stream)を取得する
     * @param {HTMLVideoElement | string | "stream"} [video] - 映像を取得するDOM("stream"を指定するとストリームを取得する)
     * @param {number} [width=640] - 映像の幅
     * @param {object} [opt] - オプション
     * @returns {Promise<HTMLVideoElement>} 映像
     */
    startCamera(video?: HTMLVideoElement | string | "stream", width?: number, opt?: object): Promise<HTMLVideoElement>;
    /**
     * カメラを止める
     * @param {HTMLVideoElement | MediaStream} stream - 映像
     * @returns {undefined}
     */
    stopCamera: typeof Jasc.stopCamera;
    /**
     * Streamを全停止する
     * @param {HTMLVideoElement | MediaStream} stream - Stream
     * @returns {undefined}
     */
    stopStream: typeof Jasc.stopCamera;
    /**
     * 映像の現在のフレームを取得する
     * @param {HTMLVideoElement} video - 映像
     * @param {"file" | "image" | "blob" | "canvas"} [outType="blob"] - 出力タイプ
     * @returns {Promise<File>} ファイル
     */
    takePicture(video: HTMLVideoElement, outType?: "file" | "image" | "blob" | "canvas"): Promise<File>;
    /**
     * 位置情報を取得する
     * @param {Object} [opt={}] - オプション
     * @param {number} [opt.maximumAge=0] - キャッシュ時間
     * @param {number} [opt.timeout=Infinity] - タイムアウト
     * @param {boolean} [opt.enableHighAccuracy=false] - 高精度で返却
     * @returns {Promise<Position>} 位置情報
     * @throws {Error} geolocation is not supported
     */
    getCurrentPosition: typeof Jasc.getCurrentPosition;
    /**
     * バイブレーションを実行させる
     * @param {number|number[]} duration - ミリ秒
     * @returns {boolean} 実行結果
     */
    playVibrate: typeof Jasc.playVibrate;
    /**
     * バイブレーション動作をループさせる
     * @param {number|number[]} duration - ミリ秒
     * @param {number} [wait=100] - 待機時間
     * @returns {undefined}
     */
    setVibrateInterval: typeof Jasc.setVibrateInterval;
    /**
     * ループしているバイブレーション動作を停止させる
     * @returns {boolean} 停止結果
     */
    clearVibrateInterval: typeof Jasc.clearVibrateInterval;
    /**
     * 合成音声の種類を取得する
     * @param {string} [lang=null] - 言語(特定言語抽出機能)
     * @returns {Promise<{lang: string, name: string}[]>} 合成音声の種類
     */
    getVoiceNameList: typeof Jasc.getVoiceNameList;
    /**
     * 合成音声を再生する
     * @param {string} text - テキスト
     * @param {object} [opt] - オプション
     * @param {string} [opt.lang="ja-JP"] - 言語
     * @param {string} [opt.voiceName=null] - 音声名(部分一致許容)
     * @param {number} [opt.volume=1] - 音量(0~1)
     * @param {number} [opt.pitch=1] - 音程(0~2)
     * @param {number} [opt.rate=1] - 音速(0.1~10)
     * @param {boolean} [opt.addQueue=true] - 再生キューに追加
     * @param {boolean} [opt.obligation=false] - 上書き再生
     * @param {number} [opt.tryCount=5] - 再生試行回数
     * @param {function(number):undefined} [opt.tryCallback=null] - 試行コールバック
     * @returns {SpeechSynthesisVoice | false | null} 合成音声
     */
    playSpeech: typeof Jasc.playSpeech;
    /**
     * 合成音声の再生を一時停止する
     * @returns {boolean}
     */
    pauseSpeech: typeof Jasc.pauseSpeech;
    /**
     * 合成音声の一時停止を再開する
     * @returns {boolean}
     */
    resumeSpeech: typeof Jasc.resumeSpeech;
    /**
     * 合成音声の再生をキャンセルする
     * @returns {undefined}
     */
    cancelSpeech: typeof Jasc.cancelSpeech;
    /**
     * Service Workerを削除
     * @returns {number} 削除件数
     * @async
     */
    unregisterServiceWorker: typeof Jasc.unregisterServiceWorker;
    /**
     * 新規windowを開く
     * @param {string} [url] - URL
     * @param {object} [opt] - オプション
     * @param {"_blank"|"_top"|"_self"|"_parent"} [opt.target="_blank"] - ターゲット
     * @param {boolean} [opt.popup=true] - ポップアップ
     * @param {number} [opt.width] - 横幅
     * @param {number} [opt.height] - 高さ
     * @param {number} [opt.left] - 左(画面上のwindowの位置)
     * @param {number} [opt.top] - 上(画面上のwindowの位置)
     * @param {boolean} [opt.noopener=false] - noopener(元ウィンドウアクセスブロック)
     * @param {boolean} [opt.noreferrer=false] - noreferrer
     * @param {boolean} [opt.menubar=false] - メニューバー(非推奨)
     * @param {boolean} [opt.toolbar=true] - ツールバー(非推奨)
     */
    openWindow(url?: string, { target, popup, width, height, left, top, noopener, noreferrer, menubar, toolbar }?: {
        target?: "_blank" | "_top" | "_self" | "_parent";
        popup?: boolean;
        width?: number;
        height?: number;
        left?: number;
        top?: number;
        noopener?: boolean;
        noreferrer?: boolean;
        menubar?: boolean;
        toolbar?: boolean;
    }): Window;
    /**
     * windowを滑らかに移動させる
     * @param {Window} windowObj - ウィンドウオブジェクト
     * @param {object} [opt] - オプション
     * @param {number} [opt.widthStart] - 開始時の横幅
     * @param {number} [opt.widthEnd] - 終了時の横幅
     * @param {number} [opt.heightStart] - 開始時の高さ
     * @param {number} [opt.heightEnd] - 終了時の高さ
     * @param {number} [opt.leftStart] - 開始時の左(画面上のwindowの位置)
     * @param {number} [opt.leftEnd] - 終了時の左(画面上のwindowの位置)
     * @param {number} [opt.topStart] - 開始時の上(画面上のwindowの位置)
     * @param {number} [opt.topEnd] - 終了時の上(画面上のwindowの位置)
     * @param {number} [opt.duration=600] - フレーム数
     * @param {"smooth"|"leap"} [opt.type="smooth"] - アニメーションタイプ
     * @param {"requestAnimationFrame"|number} [opt.wait="requestAnimationFrame"] - 待ち時間
     * @returns {Promise<{width:number,height:number,left:number,top:number}>} - 終了時の位置情報
     */
    animationMoveWindow(windowObj: Window, { widthStart, widthEnd, heightStart, heightEnd, leftStart, leftEnd, topStart, topEnd, duration, type, wait }?: {
        widthStart?: number;
        widthEnd?: number;
        heightStart?: number;
        heightEnd?: number;
        leftStart?: number;
        leftEnd?: number;
        topStart?: number;
        topEnd?: number;
        duration?: number;
        type?: "smooth" | "leap";
        wait?: "requestAnimationFrame" | number;
    }): Promise<{
        width: number;
        height: number;
        left: number;
        top: number;
    }>;
    /**
     * PiPを開く
     * @param {string|jQuery|HTMLElement} elem - 要素
     * @param {object} [opt] - オプション
     * @param {number} [opt.width] - 横幅
     * @param {number} [opt.height] - 縦幅
     * @param {boolean} [opt.preferInitialWindowPlacement=false] - 初期ウィンドウ配置を優先
     * @param {boolean} [opt.disallowReturnToOpener=false] - UIコントロールを表示しない
     * @param {boolean} [opt.copyStyleSheets=true] - CSSをPiPにコピー
     * @param {boolean} [opt.autoUnload=true] - 自動解除
     * @param {string} [opt.markerText] - マーカーのテキスト
     * @param {boolean} [opt.setJasc=true] - JascをPiPに自動設定
     * @returns {Promise<Window | null>} PiPウィンドウ
     * @async
     */
    openPipWindow(elem: string | jQuery | HTMLElement, { width, height, preferInitialWindowPlacement, disallowReturnToOpener, copyStyleSheets, autoUnload, markerText, setJasc }?: {
        width?: number;
        height?: number;
        preferInitialWindowPlacement?: boolean;
        disallowReturnToOpener?: boolean;
        copyStyleSheets?: boolean;
        autoUnload?: boolean;
        markerText?: string;
        setJasc?: boolean;
    }): Promise<Window | null>;
    /**
     * class同士の演算補助
     * オーバーロード方法1
     *
     * `customOperator(Object,"+")(a => b => a + b)`
     * を定義で
     * `1["+"](3) // => 4`
     * となる
     *
     * @param {object} obj - 対象オブジェクト
     * @param {string} [op="+"] - 演算子
     * @returns {void}
     */
    customOperator: typeof Jasc.customOperator;
    /**
     * cookieの値を取得
     * @param {string} name - 名前
     * @returns {string|null} 値
     */
    getCookie: typeof Jasc.getCookie;
    /**
     * cookieの値を削除
     * @param {string} name - 名前
     * @returns {boolean} 成功したか
     */
    removeCookie: typeof Jasc.removeCookie;
    /**
     * cookieを追加・更新
     * @param {string} name - 名前
     * @param {string} value - 値
     * @param {object} [opt] - オプション
     * @param {number} [opt.days=3] - 日数
     * @returns {boolean} 成功したか
     */
    setCookie: typeof Jasc.setCookie;
    /**
     * replaceのPromises対応版
     * @param {string} str - 文字列
     * @param {RegExp} regex - 正規表現
     * @param {function(string,...any):Promise<string>} asyncFn - replace時実行非同期関数
     * @returns {Promise<string>} 変換後
     * @async
     */
    replaceAsync: typeof Jasc.replaceAsync;
    /**
     * definePropertyを使いやすく
     * @param {object} obj - オブジェクト
     * @param {string} name - 名前
     * @param {object} [opt] - オプション
     * @param {boolean} [opt.configurable=false] - 設定可能
     * @param {boolean} [opt.enumerable=true] - 参照可能
     * @param {function():any} [opt.get] - getter
     * @param {function(any):undefined} [opt.set] - setter
     * @param {any} [opt.value] - 値
     * @param {boolean} [opt.writable=false] - 書き込み可能か
     * @returns {0|1} 実行結果
     */
    objDefineProperty(obj: object, name: string, opt?: {
        configurable?: boolean;
        enumerable?: boolean;
        get?: () => any;
        set?: (arg0: any) => undefined;
        value?: any;
        writable?: boolean;
    }): 0 | 1;
    /**
     * definePropertyをprototypeに使用した際の問題対策
     * - prototypeを探るにはdepthを3にすると良い
     * @param {object} obj - オブジェクト
     * @param {number} [depth=0] - 深さ
     * @param {boolean} [isEnumerable=false] - enumerableを取得するか
     * @returns {string[]} 名前
     */
    getObjectPropertyNames: typeof Jasc.getObjectPropertyNames;
    /**
     * hasOwnPropertyを使いやすく
     * @param {object} obj - オブジェクト
     * @param {string} key - 名前
     * @returns {[boolean, any]} 結果
     */
    objHasOwnProperty: typeof Jasc.objHasOwnProperty;
    /**
     * メゾットがセッターかを判定
     * @param {object} obj - オブジェクト
     * @param {string} key - 名前
     * @returns {boolean} 結果
     */
    isSetter: typeof Jasc.isSetter;
    /**
     * メゾットがゲッターかを判定
     * @param {object} obj - オブジェクト
     * @param {string} key - 名前
     * @returns {boolean} 結果
     */
    isGetter: typeof Jasc.isGetter;
    /**
     * コード側でキー入力
     * @param {string|string[]} code - キーコード
     * @param {object} [opt] - オプション
     * @param {0|1|"keydown"|"keyup"} [opt.type="keydown"] - イベントタイプ
     * @param {boolean} [opt.altKey=false] - altKey
     * @param {boolean} [opt.shiftKey=false] - shiftKey
     * @param {boolean} [opt.ctrlKey=false] - ctrlKey
     * @param {boolean} [opt.metaKey=false] - metaKey(Windowsキーとか)
     * @param {number} [opt.delay] - キーを離すまでの待ち時間
     * @param {Window|HTMLElement} [elem=window] - 対象DOM
     */
    pressKey: (code: string | string[], opt?: {
        type?: 0 | 1 | "keydown" | "keyup";
        altKey?: boolean;
        shiftKey?: boolean;
        ctrlKey?: boolean;
        metaKey?: boolean;
        delay?: number;
    }, elem?: Window | HTMLElement) => number;
    /**
     * カスタムログ
     * @param {object} [arg] - オプション
     * @param {boolean} [arg.debug=false] - 通常表示を表示するか
     * @param {boolean} [arg.oblInd=true] - 必須表示を表示するか
     * @param {string} [arg.prefix=""] - 前に表示する名称
     * @param {object} [arg.style] - カスタムスタイル
     * @returns {Jasc.ConsoleCustomLog}
     */
    consoleCustomLog(arg?: {
        debug?: boolean;
        oblInd?: boolean;
        prefix?: string;
        style?: object;
    }): {
        new (arg?: {}): {
            "__#3@#isDebug": any;
            "__#3@#isOblInd": any;
            "__#3@#prefix": any;
            "__#3@#timeArr": {};
            style: any;
            /**
             * デバックモードON/OFF
             * @param {boolean} flag - デバックモード
             * @returns {undefined}
             */
            debug: boolean;
            /**
             * 必須表示ON/OFF
             * @param {boolean} flag - 必須表示
             * @returns {undefined}
             */
            obligationIndication: boolean;
            /**
             * 接頭語取得
             * @returns {string}
             */
            head: string;
            /**
             * カスタムスタイルを追加
             * @param {string} name - 名前
             * @param {string} style - スタイル
             * @returns {undefined}
             */
            custom(name: string, style: string): undefined;
            /**
             * フォーマットして出力
             * @param {any[]} data - データ
             * @param {function} output - 出力関数
             * //@private
             */
            _formatOutput(data: any[], output: Function): void;
            /**
             * ログ表示
             * @param {...any} data - ログ
             * @param {string} type - [最後-1]表示スタイル名(又はcssスタイル)
             * @param {boolean} [obligation=false] - [最後]必須表示
             * @returns {undefined}
             */
            log(...data: any[]): undefined;
            /**
             * 警告表示
             * @param {any} errObj - ログ
             * @param {boolean} [obligation=false] - 必須表示
             * @returns {undefined}
             */
            warn(...data: any[]): undefined;
            /**
             * エラー表示
             * @param {any} errObj - ログ
             * @param {boolean} [obligation=false] - 必須表示
             * @returns {undefined}
             */
            error(...data: any[]): undefined;
            /**
             * 時間計測
             * @param {string} name - 名前
             * @param {boolean} [obligation=false] - 必須表示
             * @returns {number|false} 経過時間
             */
            time(name: string, obligation?: boolean): number | false;
        };
    };
    /**
     * 画像管理
     * @param {object} urls - URL
     * @returns {Jasc.AssetsManager}
     */
    assetsManager(urls?: object): {
        new (urls?: {}): {
            "__#4@#url2Map": any;
            "__#4@#imageMap": any;
            /**
             * 画像追加
             * @param {object} [opt] - オプション
             * @param {string} [name] - 画像呼び出し名
             * @param {string} [url] - 画像URL
             * @returns {Promise<Image>}
             */
            getImage({ name, url }?: object): Promise<new (width?: number, height?: number) => HTMLImageElement>;
            /**
             * キャッシュ追加
             * @param {HTMLImageElement} data - 画像
             * @param {string} name - 画像呼び出し名
             * @returns {undefined}
             */
            addCache(data: HTMLImageElement, name: string): undefined;
            /**
             * アセット削除
             * @param {string} name - アセット呼び出し名
             * @returns {undefined}
             */
            del(name: string): undefined;
            /**
             * アセット全削除
             * @returns {undefined}
             */
            clear(): undefined;
        };
    };
    /**
     * Base62変換
     * @memberof Jasc
     * @returns {Jasc.Base62}
     */
    base62: {
        new (): {};
        /**
         * 変換文字列
         * @type {string}
         * @static
         * @readonly
         */
        readonly _CHARSET: string;
        /**
         * CHARSET文字数
         * @type {number}
         * @static
         * @readonly
         */
        readonly _BASE: number;
        /**
         * 変換表
         * @type {object}
         * @static
         * @readonly
         */
        readonly _CHAR_INDEX: object;
        /**
         * 変換表(BigInt版)
         * @type {object}
         * @static
         * @readonly
         */
        readonly _BIGINT_CHAR_INDEX: object;
        /**
         * 10進数を62進数に変換
         * @param {number | bigint} [num=0] - 10進数
         * @returns {string}
         * @static
         */
        encode(num?: number | bigint): string;
        /**
         * 62進数を10進数に変換
         * @param {string} str - 62進数
         * @returns {number}
         * @static
         */
        decode(str: string): number;
        /**
         * 10進数を62進数に変換(BigInt版)
         * @param {number | bigint} [num=0] - 10進数
         * @returns {string}
         * @static
         */
        encodeBigInt(num?: number | bigint): string;
        /**
         * 62進数を10進数に変換(BigInt版)
         * @param {string} str - 62進数
         * @returns {bigint}
         * @static
         */
        decodeBigInt(str: string): bigint;
    };
    #private;
}
declare var jasc: Jasc;
