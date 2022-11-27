// @flow
import * as React from 'react';
import styles from './MainLayout.module.scss';

type Props = {
  children: React.ReactNode;
};

export const MainLayout = (props: Props) => {
  return (
    <div className={styles['main']}>
      {props.children}
    </div>
  );
};
