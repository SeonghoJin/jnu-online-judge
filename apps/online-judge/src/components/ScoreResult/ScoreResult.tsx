// @flow
import * as React from 'react';
import {useMemo} from "react";
import {BuildResult} from "../BuildResult/BuildResult";
import {FailOrSuccess} from "@online-judge/domain";
import TestCaseResult from "../TestCasesResult";
import TestResult from "../TestResult";

type Props = {
  build?: FailOrSuccess | FailOrSuccess[];
  testCases?: FailOrSuccess | FailOrSuccess[];
  test?: FailOrSuccess | FailOrSuccess[];
  upload?: {
    status: boolean;
    reason?: string;
  };
};

export const ScoreResult = (props: Props) => {

  const uploadResult = useMemo(() => {
    if(props?.upload === undefined){
      return <></>
    }

    return <>{`[Upload] ${props?.upload.status ? 'success' : 'fail'}`} <br/>{`${props?.upload.reason ? "원인: " + props?.upload.reason: ''}`}</>;
  }, [props?.upload]);


  const buildResult = useMemo(() => {
    return <BuildResult data={props?.build}/>
  }, [props?.build]);

  const testCases = useMemo(() => {
    return <TestCaseResult data={props?.testCases}/>
  }, [props?.testCases]);

  const test = useMemo(() => {
    return <TestResult data={props?.test}/>
  }, [props?.test]);

  return (
    <div>
      {uploadResult}
      <br/>
      {testCases}
      <br/>
      {buildResult}
      <br/>
      {test}
    </div>
  );
};
