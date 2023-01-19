import { type NextPage } from "next";
import React, { useState } from "react";

import { BestModsPage, filterArgs } from '../components/main';

import ModBrowser from '../components/modbrowser';

import HeadInfo from "../components/Head";

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
