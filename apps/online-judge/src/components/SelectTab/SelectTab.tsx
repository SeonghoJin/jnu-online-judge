// @flow
import * as React from 'react';
import {isScoreViewType, ScoreView, ScoreViewNaming} from "@online-judge/domain";
import styles from './SelectTab.module.scss';

type Props = {
  onSelected: (value: ScoreView) => void;
}

export const SelectTab = (props: Props) => {
  return (
    <div>
      {Object.entries(ScoreViewNaming).map(([key, value]) => {
        return <div
          key={key}
          className={styles['item']}
          onClick={() => {
          if(isScoreViewType(key)){
            props.onSelected(key);
            return;
          }

          throw new Error("[Error] score view type");
        }}>{value}</div>
      })}
    </div>
  );
};
