import { type NextPage } from "next";
import React from "react";

import { BestModsPage } from '../components/main';
import HeadInfo from "../components/Head";

import ModBrowser from '../components/modbrowser';

const Home: NextPage = () => {
  return (
    <>
      <HeadInfo />
      <BestModsPage
        content={<ModBrowser></ModBrowser>}
        image={"/images/backgrounds/default.jpg"}
      ></BestModsPage>
    </>
  );
};

export default Home;
