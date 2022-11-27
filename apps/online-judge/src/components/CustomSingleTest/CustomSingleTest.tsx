// @flow
import * as React from 'react';
import AutoSaveTextArea from "../AutoSaveTextArea";
import {FileInput} from "../FileInput/FileInput";
import {BuildResponse, isBuildSuccessResponse} from "@online-judge/domain";
import {apiService} from "../../service/ApiService";
import ScoreResult from "../ScoreResult";
import {useState} from "react";

type Props = {

};

export const CustomSingleTest = (props: Props) => {
  const [buildResult, setBuildResult] = useState<undefined | {status: boolean, reason?: string}>(undefined);
  const [testResult, setTestResult] = useState<undefined | {status: boolean, reason?: string}>(undefined);

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
      <FileInput
        uppyId={'single-cpp-files'}
        onUploadSuccess={async ({response}) => {
          setBuildResult(undefined);
          setTestResult(undefined);

          const body = response?.body as BuildResponse;
          if(isBuildSuccessResponse(body)) {

            setBuildResult({
              status: true
            });

            apiService.runTestCaseWithIO.abort();
            const { resourceId } = body;
            const {result} = await apiService.runTestCaseWithIO({
              resourceId,
              input: localStorage.getItem('single-input') ?? '',
              output: localStorage.getItem('single-output') ?? ''
            });

            if(result?.data.result === 'fail'){
              setTestResult({
                status: false,
                reason: result.data.reason
              });
              return;
            }

            if(result?.data.result === 'success') {
              setTestResult({
                status: true,
              });
              return;
            }

            return;
          }

          setBuildResult({
            status: false,
            reason: body.reason
          });

      }}/>
      <ScoreResult build={buildResult} test={testResult}/>
    </>
  );
};
