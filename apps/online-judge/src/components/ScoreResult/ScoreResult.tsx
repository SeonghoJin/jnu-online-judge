// @flow
import * as React from 'react';
import {useMemo} from "react";

type Props = {
  build?: {
    status: boolean;
    reason?: string;
  };
  testCases?: {
    status: boolean;
    reason?: string;
  };
  test?: {
    status: boolean;
    reason?: string;
  };
};

export const ScoreResult = (props: Props) => {

  const buildResult = useMemo(() => {
    if(props?.build === undefined){
    return <></>
    }

    return <>{`[Build] ${props?.build.status ? 'success' : 'fail'}`} <br/>{`${props?.build.reason ? "원인: " + props?.build.reason: ''}`}</>;
  }, [props?.build]);

  const testCases = useMemo(() => {
    if(props?.testCases === undefined){
      return ''
    }

    return `[TestCase] ${props?.testCases.status? 'success' : 'empty'} \n${props?.testCases.reason ? "원인" + props?.testCases.reason: ''}`;
  }, [props?.testCases]);

  const test = useMemo(() => {
    if(props?.test === undefined){
      return <></>
    }

    return <>{`[Test] ${props?.test.status ? 'success' : 'fail'}`} <br/>{`${props?.test.reason ? "원인: " + props?.test.reason: ''}`}</>;
  }, [props?.test]);

  return (
    <div>
      {buildResult}
      <br/>
      {testCases}
      <br/>
      {test}
    </div>
  );
};
