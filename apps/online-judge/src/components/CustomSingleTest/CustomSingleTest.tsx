// @flow
import * as React from 'react';
import AutoSaveTextArea from "../AutoSaveTextArea";
import {FileInput} from "../FileInput/FileInput";
import {api, BuildResponse, FailOrSuccess, isBuildSuccessResponse} from "@online-judge/domain";
import {apiService} from "../../service/ApiService";
import ScoreResult from "../ScoreResult";
import {useState} from "react";

type Props = {

};

export const CustomSingleTest = (props: Props) => {
  const [buildResult, setBuildResult] = useState<undefined | FailOrSuccess | FailOrSuccess[]>(undefined);
  const [testResult, setTestResult] = useState<undefined | FailOrSuccess | FailOrSuccess[]>(undefined);

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
        allowedFileTypes={[
          '.cpp',
          '.h',
          '.hpp',
          '.c',
        ]}
        uploadUrl={api.테스트하나업로드}
        uppyId={'single-cpp-files'}
        onUploadSuccess={async ({response}) => {
          setBuildResult(undefined);
          setTestResult(undefined);

          const body = response?.body as BuildResponse;
          if(isBuildSuccessResponse(body)) {

            setBuildResult({
              status: 'success'
            });

            apiService.runTestCaseWithIO.abort();
            const { resourceId } = body;
            const {result} = await apiService.runTestCaseWithIO({
              resourceId,
              input: localStorage.getItem('single-input') ?? '',
              output: localStorage.getItem('single-output') ?? ''
            });

            if(result?.data.status === 'fail'){
              setTestResult({
                status: 'fail',
                reason: result.data.reason
              });
              return;
            }

            if(result?.data.status === 'success') {
              setTestResult({
                status: 'success',
              });
              return;
            }

            return;
          }

          setBuildResult({
            status: 'fail',
            reason: body.reason
          });

      }}/>
      <ScoreResult build={buildResult} test={testResult}/>
    </>
  );
};
