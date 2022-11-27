// @flow
import * as React from 'react';
import cx from 'classnames';
import {isScoreViewType, ScoreView, ScoreViewNaming} from "@online-judge/domain";
import styles from './SelectTab.module.scss';
import {useState} from "react";

type Props = {
  onSelected: (value: ScoreView) => void;
}

export const SelectTab = (props: Props) => {

  const [selected, setSelected] = useState<ScoreView>('single');

  return (
    <div className={styles['main']}>
      {Object.entries(ScoreViewNaming).map(([key, value]) => {
        return <div
          key={key}
          className={cx({
            [styles['item']]: true,
            [styles['item--selected']]: key === selected
          })}
          onClick={() => {

          if(isScoreViewType(key)){
            props.onSelected(key);
            setSelected(key);
            return;
          }

          throw new Error("[Error] score view type");
        }}>{value}</div>
      })}
    </div>
  );
};
