// @flow
import * as React from 'react';
import AutoSaveTextArea from "../AutoSaveTextArea";
import {FileInput} from "../FileInput/FileInput";
import {api, FailOrSuccess, UploadMultiTestResponse} from "@online-judge/domain";
import {useState} from "react";
import {useLocalStorageState} from "../../hooks/useAutoSaveState";
import ScoreResult from "../ScoreResult";
import {fail} from "assert";
import {apiService} from "../../service/ApiService";
import {updateKarmaConf} from "@nrwl/workspace";
import {RunMultipleTestCaseRequest} from "../../../../../libs/domain/src/lib/RunMultipleTestCaseRequest";

export const CustomMultiTest = () => {
  const [testCases, setTestCases] = useLocalStorageState<{
    name: string,
  }[]>('multi-test', []);

  const [testCaseResult, setTestCaseResult] = useState<undefined | FailOrSuccess | FailOrSuccess[]>(undefined);
  const [buildResult, setBuildResult] = useState<undefined | FailOrSuccess | FailOrSuccess[]>(undefined);
  const [testResult, setTestResult] = useState<undefined | FailOrSuccess | FailOrSuccess[]>(undefined);
  const [uploadResult, setUploadResult] = useState<undefined | {status: boolean, reason?: string}>(undefined);
  const [testCaseValue, setTestCaseValue] = useState<string>('');

  const addTestCase = (value: string) => {
    setTestCases(cases => cases.concat({
      name: value
    }));
    setTestCaseValue('');
  }

  const removeTestCase = (caseName: string) => {
    setTestCases((cases) => cases.filter(value => value.name !== caseName));
  }

  return (
    <>
      <input value={testCaseValue} onChange={(e) => {
        setTestCaseValue(e.target.value);
      }}/>
      <button onClick={() => {
        if(testCaseValue === '' || typeof testCaseValue !== 'string' || (testCases.findIndex((item) => {
          return item.name === testCaseValue
        }) !== -1)){
          return;
        }

        if(!testCases.includes({name: testCaseValue})){
          addTestCase(testCaseValue);
        }
      }}>테스트케이스 추가</button>
      {testCases.map((testCase) => {
        return <div key={testCase.name}>
          테스트 케이스 = {testCase.name}
          <br/>
          <>
            input
            <AutoSaveTextArea
              saveId={`${testCase.name}--input`}
              onError={() => {}}
              style={{
               width: 100,
               height: 100,
              }}
            />
            output
            <AutoSaveTextArea
              saveId={`${testCase.name}--output`}
              onError={() => {}}
              style={{
                width: 100,
                height: 100,
              }}
            />
          </>
          <br/>
          삭제
          <button onClick={() => {
            removeTestCase(testCase.name)}
          }>X</button>
        </div>
      })}
      <FileInput
        uploadUrl={api.테스트여러개업로드}
        uppyId={'multi-cpp-files'}
        onUploadSuccess={async ({response}) => {
          const { resources } = response?.body as UploadMultiTestResponse;

          const resourceIdToTestCaseNameMap = resources.reduce((prev: Record<string, string>, cur) => {
            prev[cur.folderName] = cur.testName;
            return prev;
          }, {})

          setUploadResult(undefined);
          setTestResult(undefined);
          setBuildResult(undefined);
          setTestCaseResult(undefined);

          setUploadResult({
            status: true
          });

          const testCasesData = testCases.map((testCase) => {
            const resource = resources.find(value => value.testName === testCase.name) ?? undefined;

            if(resource) {
              return {
                status: 'success',
                info: `${testCase.name} 확인.`,
                resource
              } as const;
            }

            return {
              status: 'fail',
              reason: `${testCase.name} 없음`,
              resource
            } as const;
          })

          setTestCaseResult(testCasesData)

          const buildTestCases = testCasesData.filter((data) => data.status === 'success')
            .map((data) => data.resource?.folderName ?? '');

          const {data: {successes, fails}} = await apiService.buildMultiTestCase({buildFolderPaths: buildTestCases});

          const formatSuccess = successes.map(success => ({
            status: 'success',
            info: `${success.resourceId} 성공`
          }) as const);

          const formatFails = fails.map(fail => ({
            status: 'fail',
            reason: `${fail.resourceId} 실패`
          }) as const);

          setBuildResult([...formatFails, ...formatSuccess]);
          console.log(resourceIdToTestCaseNameMap);
          const testRequests: RunMultipleTestCaseRequest = successes.map(success => {
            const testCaseName = resourceIdToTestCaseNameMap[success.resourceId];
            const input = localStorage.getItem(`${testCaseName}--input`) ?? '';
            const output = localStorage.getItem(`${testCaseName}--output`) ?? '';

            return {
              resourceId: success.resourceId,
              input,
              output
            }
          });

          const {data} = await apiService.runMultiTestCase(testRequests);
          setTestResult([...data.fails, ...data.successes]);

      }} allowedFileTypes={['.zip']}/>
      <ScoreResult
          upload={uploadResult}
          test={testResult}
          testCases={testCaseResult}
          build={buildResult}
      />
    </>
  );
};
