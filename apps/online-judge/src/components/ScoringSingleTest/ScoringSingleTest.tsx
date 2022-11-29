// @flow
import * as React from 'react';
import {useLocalStorageState} from "../../hooks/useAutoSaveState";
import {api, IO, UploadTAMultipleResponse, UserSingleTestCase} from "@online-judge/domain";
import {FileInput} from "../FileInput/FileInput";
import {apiService} from "../../service/ApiService";
import {useState} from "react";
import UserSingleTestCaseView from "../UserSingleTestCaseView";

export const ScoringSingleTest = () => {
  const [userSingleTestCaseResult, setSingleTestCaseResult] = useState<UserSingleTestCase[]>([]);
  const [ios, setIos] = useLocalStorageState<IO[]>('single-test-io', []);

  const addTestCaseIO = (params: {ioId: string, input: string, output:string }) => {
    const {ioId, output, input} = params;
    setIos((ios) => ios.concat({id: ioId, input, output}));
  }

  const removeTestCaseIO = (params: {ioId: string}) => {
    setIos((io) => io.filter(value => value.id !== params.ioId));
  }

  return (
    <div>
      input: <textarea id={`ta-input`}/>
      <br/>
      output: <textarea id={`ta-output`}/>
      <br/>
      <button
        onClick={() => {
          const $input = document.querySelector(`#ta-input`) as unknown as HTMLInputElement;
          const $output = document.querySelector(`#ta-output`) as unknown as HTMLInputElement;

          addTestCaseIO({
            input: $input.value,
            output: $output.value,
            ioId: Date.now().toString()
          });

          $input.value = '';
          $output.value = '';
        }}>
        {`TA에 테스트 추가`}
      </button>
      <br/>
      {ios.map((value, index) => {
        return <>
          케이스 {index + 1}
          <br/>
          input: {value.input}
          <br/>
          output: {value.output}
          <br/>
          <button onClick={() => {
            removeTestCaseIO({
              ioId: value.id,
            })
          }}>케이스 삭제</button>
          <br/>
        </>
      })}
      <FileInput onUploadSuccess={async ({response}) => {
        const { resources } = response?.body as UploadTAMultipleResponse;

        const testCaseResult = await Promise.all(resources.map(resource => apiService.runTaSingleTestCase({
          userName: resource.userName,
          folderName: resource.folderName,
          ios
        })));

        setSingleTestCaseResult(testCaseResult.map((data) => data.data));
      }} uppyId={'ta-multi-single'} uploadUrl={api.TA테스트여러개업로드} allowedFileTypes={['.zip']}/>
      {userSingleTestCaseResult.map((test) => {
        return <>
          <UserSingleTestCaseView userSingleTestCase={test}/>
          --------------------------------------------------------------------
        </>
      })}
    </div>
  );
};
