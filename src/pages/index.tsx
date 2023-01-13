import { Mod } from "@prisma/client";
import { type NextPage } from "next";
import React, { useContext, useEffect, useMemo } from "react";
import { trpc } from "../utils/trpc";

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
