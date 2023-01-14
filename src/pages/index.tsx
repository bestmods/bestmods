import { type NextPage } from "next";
import React from "react";

import { BestModsPage } from '../components/main';

import ModBrowser from '../components/modbrowser';

const Home: NextPage = () => {
  const content = <>
    <ModBrowser
      search={null}
      categories={null}
    ></ModBrowser>
  </>

  return (
    <>
      <BestModsPage
        content={content}
      ></BestModsPage>
    </>
  );
};

export default Home;
