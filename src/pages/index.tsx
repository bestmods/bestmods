import { type NextPage } from "next";
import React from "react";

import { BestModsPage } from '../components/main';

import ModBrowser from '../components/modbrowser';

import HeadInfo from "../components/Head";

const Home: NextPage = () => {
  const content = <>
    <ModBrowser
      search={null}
      categories={null}
    ></ModBrowser>
  </>

  return (
    <>
      <HeadInfo />
      <BestModsPage
        content={content}
      ></BestModsPage>
    </>
  );
};

export default Home;
