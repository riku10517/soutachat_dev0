import { Button } from "@/components/ui/button";     // Buttonコンポーネントをインポート
import { Textarea } from "@/components/ui/textarea"; // Textareaコンポーネントをインポート
import { useChatContext } from "@/features/chat/chat-ui/chat-context";                          // チャットのコンテキストを使用するためのカスタムフックをインポート
import { useGlobalConfigContext } from "@/features/global-config/global-client-config-context"; // グローバルな設定のコンテキストを使用するためのカスタムフックをインポート
import { Loader, Send } from "lucide-react";                    // アイコンをインポート
import { FC, FormEvent, useRef, useEffect } from "react";       // Reactの便利な機能をインポート
import { ChatFileSlider } from "../chat-file/chat-file-slider"; // チャットファイルスライダーをインポート
import { Microphone } from "../chat-speech/microphone";         // マイクアイコンをインポート
import { useChatInputDynamicHeight } from "./use-chat-input-dynamic-height"; // テキストエリアの動的な高さを制御するカスタムフックをインポート

interface Props {}

const ChatInput: FC<Props> = (props) => {
  const { setInput, handleSubmit, isLoading, input, chatBody } = useChatContext(); // チャットコンテキストフックから必要な値と関数を取得
  const { speechEnabled } = useGlobalConfigContext(); // グローバル設定コンテキストフックから音声機能の有効性を取得

  const buttonRef = useRef<HTMLButtonElement>(null);     // 送信ボタンの参照を作成
  const textareaRef = useRef<HTMLTextAreaElement>(null); // テキストエリアの参照を作成

  const { rows, resetRows, onKeyDown, onKeyUp } = useChatInputDynamicHeight({
    buttonRef,
  }); // テキストエリアの動的な高さを制御するためのカスタムフックから必要な値と関数を取得

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]); // 入力値が変更されるたびに、テキストエリアの高さを自動調整する


  const fileChatVisible = chatBody.chatType === "data" && chatBody.chatOverFileName; // ファイルチャットが表示可能な場合にtrue

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e); // フォームのサブミット処理を実行
    resetRows();     // テキストエリアの行数をリセット
    setInput("");    // テキストエリアの値をクリア
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value); // テキストエリアの値を更新
  };

  return (
    <form onSubmit={submit} className="absolute bottom-0 w-full flex items-center">
      <div className="container mx-auto max-w-4xl relative py-2 flex flex-col gap-2 items-center h-full">
        {fileChatVisible && <ChatFileSlider />} {/* ファイルチャットが表示可能な場合にチャットファイルスライダーを表示 */}
        <Textarea
          rows={rows}
          value={input}
          placeholder="メッセージ入力"
          className="min-h-fit bg-background shadow-sm resize-none py-4 pr-[80px]"
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          onChange={onChange}
          ref={textareaRef}
          style={{
            overflowY: "auto", // 垂直方向のスクロールバーを表示する
            maxHeight: "25em", // テキストエリアの最大の高さを指定
          }}
        ></Textarea>
        <div className="absolute right-0 bottom-0 px-8 flex items-end h-full mr-2 mb-4">
          {speechEnabled && <Microphone disabled={isLoading} />} {/* 音声機能が有効な場合にマイクアイコンを表示 */}
          <Button
            size="icon"
            type="submit"
            variant={"ghost"}
            ref={buttonRef}
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" size={16} /> : <Send size={16} />} {/* ローディングアイコンまたは送信アイコンを表示 */}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;