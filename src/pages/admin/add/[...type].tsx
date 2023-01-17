import { BestModsPage} from '../../../components/main';

import { type NextPage } from "next";
import React from "react";

import SourceForm from "../../../components/forms/contributor/CreateSource";
import CategoryForm from "../../../components/forms/contributor/CreateCategory";
import ModForm from "../../../components/forms/contributor/CreateMod";

import { useRouter } from 'next/router'

import HeadInfo from "../../../components/Head";

const Home: NextPage = () => {
  return (
    <>
      <HeadInfo />
      <BestModsPage
        content={<MainContent></MainContent>}
      ></BestModsPage>
    </>
  );
};

const MainContent: React.FC = () => {
    const { query } = useRouter()
    const typeParam: string | null = (query.type != null && query.type[0] != null) ? query.type[0] : null;
    const typeId: string | null = (query.type != null && query.type[1] != null) ? query.type[1] : null;

    const typeIdNum = Number(typeId);

    let formComponent = <ModForm preUrl={typeId} />;

    if (typeParam != null && typeParam == 'source')
        formComponent = <SourceForm preUrl={typeId} />;
    else if (typeParam != null && typeParam == 'category')
        formComponent = <CategoryForm id={typeIdNum} />;

    return (
      <>
        <div className="container mx-auto">
          {formComponent}
        </div>
      </>
    );
};

export default Home;
