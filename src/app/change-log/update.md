# そうたチャット アップデート

アップデート内容

## 📂 Chat with file

- ファイル付きチャット機能で、回答内に引用を表示できるようになりました。引用をクリックするだけで、関連するコンテキストにアクセスできます。
  
- 既存のチャットにファイルをアップロードできるようになり、複数のファイルを同時にチャットできるようになりました。
  
## 🎙️ Speech
```
会話でAzure Speechを使用する機能。この機能はデフォルトでは有効になっていません。この機能を有効にするには、環境変数 `PUBLIC_SPEECH_ENABLED=true` を Azure Speech のサブスクリプションキーとリージョンと共に設定する必要があります。


AZURE_SPEECH_REGION="REGION"
AZURE_SPEECH_KEY="1234...."
```

## 🔑 Environment variable change

このソリューションはOpenAI JavaScript SDKの最新バージョンを利用するようにアップグレードされており、`OPENAI_API_KEY`環境変数を使用する必要があることに注意してください。
