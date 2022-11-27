// @flow
import * as React from 'react';
import AutoSaveTextArea from "../AutoSaveTextArea";
import {FileInput} from "../FileInput/FileInput";

type Props = {

};

export const CustomSingleTest = (props: Props) => {
  return (
    <>
      input
      <AutoSaveTextArea
        saveId={'single-input'}
        onError={() => {}}
        style={{
          width: 100,
          height: 100,
        }}
      />
      output
      <AutoSaveTextArea
        saveId={'single-output'}
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
