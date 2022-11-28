// @flow
import * as React from 'react';
import {useMemo} from "react";
import {FailOrSuccess} from "@online-judge/domain";

type Props = {
  data?: FailOrSuccess | FailOrSuccess[]
};

const formatTestCaseResult = (data: FailOrSuccess, key: any = 0) => {
  if(data?.status === 'success') {
    return <div key={key}>{`[TestCase] success`}<br/>정보: {`${data?.info}`} </div>
  }
  return <div key={key}>{`[TestCase] fail`} <br/>원인: {`${data?.reason ?? ''}`}</div>;
}

export const TestCaseResult = ({data}: Props) => {

  if(data === undefined){
    return <></>;
  }

  if(!Array.isArray(data)) {
    return formatTestCaseResult(data);
  }

  return <>{data.map((failOrSuccess, index) => formatTestCaseResult(failOrSuccess, index))}</>;
};
