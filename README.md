# Ethers Discord Bot
このBotはEthers.jsを内包し、ERC20とNativeTokenの転送、ERC20をネットワークへのデプロイ、
残高の取得をDiscord.jsのスラッシュコマンド形式で実行できるDiscord Botです。

ERC20の送金やネットワークへのデプロイを実行する上でMetamaskが必要になる為、Express.jsでWebサーバの立ち上げを行いMetamask対応のページを立ち上げトランザクションを実行します。
`/transaction`,`/deploy-erc20`などのコマンドはWebサーバの立ち上げが行われます。

## ユースケース
DiscordはDAOとの親和性が高く、Web3に携わる多くの人に利用されるツールです。ガバナンスを行う上でよく選択されます。
ガバナンスを行う上で財務などの把握は重要事項です。ガバナンスの最前線であるDiscordでこれらの情報を把握する為に、`/balance`などのコマンドが準備されています。
これらのコマンドをコミュニティの監視下にあるチャンネルで実行することでよりガバナンスの透明性を高めることもできます。

## 利用方法
まずはnode_modulesをインストールしてください。
```
npm install
```
そしてbotを使用する前に各種Jsonの設定が必要です。
### config.jsonの設定
```json
{
    "token": "Token for Discord bot",
    "clientId": "Client ID of Discord bot.",
    "ipAddr": "http://localhost",

    "JsonRpc": {
        "0x1": "Ethereum Network",
        "0x5": "Goerli Test Network",
        "0x89": "Polygon Network", 
        "0x250": "Aster Network"
    }
}
```
このBotではMetamaskを使用するシーンが発生する為、Express.jsを使用したWebサーバの立ち上げが行われます。その為、IPアドレスの設定が必要です。
また、`JsonRpc`には各種ネットワークのJSON-RPCプロバイダーのURLを設定してください。

### tokenlist.jsonの設定 (任意)
各種トークンのアドレスを定義しているJsonファイルです。
このJsonに登録されているトークンは`/balance`や`/transaction`などのコマンドでトークンをシンボルで指定することができます。
これにより煩わしいトークンアドレスの入力を省略できるので、頻繁に使用するトークンはこちらに登録することをお勧めします。

>ネットワークのオブジェクト名は**Hex**となっています。
>ネットワークのネイティブトークンは`0x00`で統一されています。
```json
    // Ethereum Network
    "0x1": {
        "ETH": "0x00",
        "USDC": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    }
```

### コマンドのデプロイ
設定が終了したら次はコマンドのデプロイが必要です。
```
npm run deploy
```
このコマンド入力でDiscord Botにコマンドが登録されます。
無事成功すれば`Successfully reloaded 3 application (/) commands.`というメッセージが返ってきます。

### 起動
下記のnpmコマンドで実行可能です。
```
npm start
```

