import { type NextPage } from "next";
import React, { useState } from "react";

import { BestModsPage, filterArgs } from '../components/main';

import ModBrowser from '../components/modbrowser';

import HeadInfo from "../components/Head";

const Home: NextPage = () => {
  const [categories, setCategories] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<number | null>(0);
  const [sort, setSort] = useState<number | null>(0);
  const [search, setSearch] = useState<string | null>(null);

  const categoriesCb = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategories(e.target.value);
  };

  const timeframeCb = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeframe(Number(e.target.value));
  };

  const sortCb = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(Number(e.target.value));
  };

  const searchCb = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value.length > 0)
      setSearch(e.target.value);
    else
      setSearch(null);
  };

  const filters: filterArgs = {
    categories: categories,
    timeframe: timeframe,
    sort: sort,
    search: search,
    categoriesCb: categoriesCb,
    timeframeCb: timeframeCb,
    sortCb: sortCb,
    searchCb: searchCb
  };

  return (
    <>
      <HeadInfo />
      <BestModsPage
        content={<ModBrowser
          filters={filters}
        ></ModBrowser>}
        filters={filters}
      ></BestModsPage>
    </>
  );
};

export default Home;
