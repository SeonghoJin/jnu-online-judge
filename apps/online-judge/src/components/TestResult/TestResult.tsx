// @flow
import * as React from 'react';
import {useMemo} from "react";
import {FailOrSuccess} from "@online-judge/domain";

type Props = {
  data?: FailOrSuccess | FailOrSuccess[]
};

const formatTestResult = (data: FailOrSuccess, key: any = 0) => {
  if(data?.status === 'success') {
    return <div key={key}>{`[Test] success`}<br/>정보: {`${data?.info}`} </div>
  }
  return <div key={key}>{`[Test] fail`} <br/>원인: {`${data?.reason ?? ''}`}</div>;
}

export const TestResult = ({data}: Props) => {

  if(data === undefined){
    return <></>;
  }

  if(!Array.isArray(data)) {
    return formatTestResult(data);
  }

  return <>{data.map((failOrSuccess, index) => formatTestResult(failOrSuccess, index))}</>;
};
