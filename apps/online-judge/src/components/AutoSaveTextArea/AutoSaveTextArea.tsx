// @flow
import * as React from 'react';
import {CSSProperties, useEffect, useState} from "react";

type Props = {
  saveId: string;
  onError: (e: any) => void;
  style?: CSSProperties;
};

export const AutoSaveTextArea = ({saveId, onError, style}: Props) => {
  const [text, setText] = useState(() => {
    try {
      const text = localStorage.getItem(saveId);
      console.log(text);
      return text ?? '';
    } catch (e) {
      onError('[Error] text is not string, initializing ');
      localStorage.setItem(saveId, '');
      return '';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(saveId, text);
    } catch (e) {
      onError(e);
    }
  }, [onError, saveId, text]);


  return (
    <input
      style={style}
      onError={onError}
      value={text}
      onChange={(e) => {
      setText(e.target.value);
    }}/>
  );
};
