import { useState, useEffect, useRef } from "react";

interface Props {
  buttonRef: React.RefObject<HTMLButtonElement>; // ボタンの参照を受け取るプロパティ
}

export const useChatInputDynamicHeight = (props: Props) => {
  const maxRows = 1;                             // 最大の行数を設定
  const [rows, setRows] = useState(1);           // テキストエリアの行数を状態として持つ
  const textareaRef = useRef<HTMLTextAreaElement>(null); // テキストエリアの参照を作成

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      const { scrollHeight, clientHeight } = textareaRef.current;
      const { borderTopWidth, borderBottomWidth } = getComputedStyle(textareaRef.current);
      const boundsHeight = parseInt(borderTopWidth) + parseInt(borderBottomWidth);
      const newRows = Math.floor((scrollHeight - boundsHeight) / clientHeight) + 1; // テキストエリアの高さから行数を計算
      setRows(newRows); // 行数を更新
    }
  };

  useEffect(() => {
    adjustTextareaHeight(); // テキストエリアの高さを調整
  }, [rows, textareaRef]); // 行数またはテキストエリアの参照が変更されるたびに実行

  const [keysPressed, setKeysPressed] = useState(new Set()); // 押されたキーの状態を状態として持つ

  const onKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    keysPressed.delete(event.key); // 押されたキーを削除
    setKeysPressed(keysPressed); // キーの状態を更新
  };

  const setRowsToMax = (rows: number) => {
    if (rows < maxRows) {
      setRows(rows); // 行数を更新
    }
  };

  const resetRows = () => {
    setRows(1); // 行数をリセット
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRowsToMax(event.target.value.split("\n").length + 1); // 入力されたテキストの行数を計算して行数を更新
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = event.target as HTMLTextAreaElement;

    if (event.key === "Backspace" && rows > 1 && target.value === "") {
      setRows(rows - 1); // 行数を減らす
      event.preventDefault();
      adjustTextareaHeight();
    } else if (event.key === "Backspace") {
      adjustTextareaHeight();
    }

    setKeysPressed(keysPressed.add(event.key));

    if (keysPressed.has("Enter") && keysPressed.has("Shift")) {
      setRowsToMax(rows + 1); // 行数を増やす
    }

    if (
      !event.nativeEvent.isComposing &&
      (keysPressed.has("Enter") || event.key === "Enter") &&
      !keysPressed.has("Shift") &&
      props.buttonRef.current
    ) {
      props.buttonRef.current.click(); 
      event.preventDefault();
    }
  };

  return {
    rows,
    resetRows,
    onChange,
    onKeyDown,
    onKeyUp,
    textareaRef,
  };
};