import { type NextPage } from "next";
import React, { useContext, useState, useEffect, useMemo } from "react";
import HeadInfo from "../../../components/Head";

import SourceForm from "../../../components/forms/contributor/CreateSource";
import CategoryForm from "../../../components/forms/contributor/CreateCategory";
import ModForm from "../../../components/forms/contributor/CreateMod";

import { useRouter } from 'next/router'

const Home: NextPage = () => {
  return (
    <>
      <HeadInfo />
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c]">
          <div className="container mx-auto flex flex-col items-center justify-center gap-12 px-4 py-16 ">
              <h1 className="text-center text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                  <span className="text-blue-400">B</span>est{" "}
                  <span className="text-blue-400">M</span>ods
              </h1>

              <MainContent />
          </div>
      </main>
    </>
  );
};

const MainContent: React.FC = () => {
    const { asPath, route, query } = useRouter()
    const typeParam: string | null | undefined = (query.type != null) ? query.type[0] : null;
    const typeId: string | null = (query.type != null && query.type[1] != null) ? query.type[1] : null;

    const typeIdNum = Number(typeId);

    let formComponent = <ModForm id={typeIdNum} />;

    if (typeParam != null && typeParam == 'source') {
        formComponent = <SourceForm preUrl={typeId} />;
    } else if (typeParam != null && typeParam == 'category') {
        formComponent = <CategoryForm id={typeIdNum} />;
    }

    return (
      <>
        {formComponent}
      </>
    );
};

export default Home;
