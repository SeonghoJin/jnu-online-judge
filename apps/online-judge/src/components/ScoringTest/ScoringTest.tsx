// @flow
import * as React from 'react';
import {FileInput} from "../FileInput/FileInput";
import {
  api, UploadTAMultipleResponse, TestCase, UserTestCase
} from "@online-judge/domain";
import {useEffect, useState} from "react";
import {useLocalStorageState} from "../../hooks/useAutoSaveState";
import {apiService} from "../../service/ApiService";
import UserTestCaseView from "../UserTestCaseView";

export const ScoringTest = () => {
  const [testCases, setTestCases] = useLocalStorageState<TestCase[]>('ta', []);
  const [userTestCaseResults, setUserTestCaseResults] = useState<UserTestCase[]>([]);

  const addTestCase = (name: string) => {
    if(name === '' || typeof name !== 'string' || (testCases.findIndex((item) => {
      return item.name === name
    }) !== -1)){
      return;
    }

    setTestCases((testCases) => testCases.concat({
      name,
      io: []
    }));
  }

  const removeTestCase = (name: string) => {
    setTestCases((testCases) => testCases.filter((testCase) => {
      return testCase.name !== name
    }));
  }

  const addTestCaseIO = (params: {testCaseName: string, ioId: string, input: string, output:string }) => {
    setTestCases((testCases) => {
     return testCases.map((testCase) => {
       if(testCase.name === params.testCaseName){
         const newIO = testCase.io.concat({
           id: params.ioId,
           input: params.input,
           output: params.output
         });

         return {
           ...testCase,
           io: newIO
         };
       }

       return testCase;
     })
    })
  }

  const removeTestCaseIO = (params: {testCaseName: string, ioId: string}) => {
    setTestCases((testCases) => {
      return testCases.map((testCase) => {
        if(testCase.name !== params.testCaseName) {
          return testCase;
        }

        return {
          ...testCase,
          io: testCase.io.filter((v) => v.id !== params.ioId)
        };
      })
    })
  }

  return (
    <>
      <textarea id={"ta-multi"}/>
      <button onClick={() => {
        const $taMulti = document.querySelector('#ta-multi') as unknown as HTMLInputElement;
        addTestCase($taMulti.value);
        $taMulti.value = '';
      }}>테스트케이스 추가</button>
      <br/>
      {testCases.map((testCase) => {
      const {name, io} = testCase;
      return <>
      테스트케이스이름: {name}
        <button onClick={() => {
          removeTestCase(name);
        }}>테스트삭제</button>
        <br/>
      {io.map((value, index) => {
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
          testCaseName: name
          })
           }}>케이스 삭제</button>
          <br/>
          </>
      })}
        input: <textarea id={`ta-multi-${name}-input`}/>
        <br/>
        output: <textarea id={`ta-multi-${name}-output`}/>
        <br/>
        <button
          onClick={() => {
            const $input = document.querySelector(`#ta-multi-${name}-input`) as unknown as HTMLTextAreaElement;
            const $output = document.querySelector(`#ta-multi-${name}-output`) as unknown as HTMLTextAreaElement;
            console.log($input);
            console.log($output);

            addTestCaseIO({
              testCaseName: name,
              input: $input.value,
              output: $output.value,
              ioId: Date.now().toString()
            });

            $input.value = '';
            $output.value = '';
          }}>
          {`${name}에 테스트 추가`}
        </button>
        <br/>
        <br/>
        <br/>
      </>
      })}
      <FileInput onUploadSuccess={async ({response}) => {
        setUserTestCaseResults([]);
        const { resources } = response?.body as UploadTAMultipleResponse;

        const testCaseResult = await Promise.all(resources.map(resource => apiService.runTaMultiTestCases({
          userName: resource.userName,
          folderName: resource.folderName,
          testCases,
        })));

        setUserTestCaseResults(testCaseResult.map((result) => result.data))

      }} uppyId={'ta-multi'} uploadUrl={api.TA테스트여러개업로드} allowedFileTypes={['.zip']}/>
      {userTestCaseResults.map((result) => {
        return <div key={result.userName}>
          <br/>
          <UserTestCaseView userTestCase={result} testCaseCount={testCases.length}/>
          ------------------------------------------------------------
          <br/>
        </div>
      })}
    </>
  );
};
