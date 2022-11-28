// eslint-disable-next-line @typescript-eslint/no-unused-vars

import MainLayout from "../components/MainLayout";
import SelectTab from "../components/SelectTab";
import {useState} from "react";
import {ScoreView} from "@online-judge/domain";
import styles from './app.module.scss';
import Navigation from "../components/Navigation";
import {CustomSingleTest} from "../components/CustomSingleTest/CustomSingleTest";
import CustomMultiTest from "../components/CustomMultiTest";
import ScoringTest from "../components/ScoringTest";

export function App() {
  const [selectedTab, setSelectedTab] =  useState<ScoreView>('single');

  return (
    <div className={styles['main']}>
      <MainLayout>
        <Navigation/>
      </MainLayout>
      <MainLayout>
        <SelectTab onSelected={setSelectedTab}/>
        {selectedTab === 'single' && <CustomSingleTest/>}
        {selectedTab === 'multi' && <CustomMultiTest/>}
        {selectedTab === 'ta-score' && <ScoringTest/>}
      </MainLayout>
    </div>
  );
}

export default App;
