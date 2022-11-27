// @flow
import * as React from 'react';
import AutoSaveTextArea from "../AutoSaveTextArea";
import {FileInput} from "../FileInput/FileInput";

export const CustomMultiTest = () => {
  return (
    <>
      input
      <AutoSaveTextArea
        saveId={'multi-input'}
        onError={() => {}}
        style={{
          width: 100,
          height: 100,
        }}
      />
      output
      <AutoSaveTextArea
        saveId={'multi-output'}
        onError={() => {}}
        style={{
          width: 100,
          height: 100,
        }}
      />
      <FileInput/>
    </>
  );
};
