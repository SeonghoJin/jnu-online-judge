// @flow
import * as React from 'react';
import cx from 'classnames';
import styles from './Navigation.module.scss';

export const Navigation = () => {
  return (
    <div>
      <span className={
        cx(styles['title'], styles['title__main'])
      }>JNU</span>
      <span className={cx(styles['title'])}> Online Judge</span>
    </div>
  );
};
