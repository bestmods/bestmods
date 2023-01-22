import { type NextPage } from "next";
import React, { useState } from "react";

import { BestModsPage, filterArgs } from '../components/main';
import HeadInfo from "../components/Head";

import ModBrowser from '../components/modbrowser';

const Home: NextPage = () => {
  return (
    <>
      <HeadInfo />
      <BestModsPage
        content={<ModBrowser></ModBrowser>}
      ></BestModsPage>
    </>
  );
};

export default Home;
