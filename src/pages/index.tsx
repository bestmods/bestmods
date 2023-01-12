import { Mod } from "@prisma/client";
import { type NextPage } from "next";
import React, { useContext, useEffect, useMemo } from "react";
import { trpc } from "../utils/trpc";

import { BestModsPage } from '../components/main';

const Home: NextPage = () => {
  const content = <>
    <ModBrowser></ModBrowser>
  </>

  return (
    <>
      <BestModsPage
        content={content}
      ></BestModsPage>
    </>
  );
};

const ModBrowser: React.FC = () => {
  const mods = trpc.mod.getAllMods.useQuery();
  const maxPerRow = 3;
  const data = mods.data;
  const rows = useMemo(() => {
    const rows: Mod[][] = [];
    let row: Mod[] = [];

    data?.forEach((mod, i) => {
      if (i % maxPerRow === 0) {
        rows.push(row);
        row = [];
      }
      row.push(mod);
    });

    rows.push(row);

    return rows;
  }, [data]);

  return (
    <section className="mx-auto flex h-full w-5/6 flex-col text-3xl text-slate-300">
      {mods.data ? (
        rows.map((row, i) => <ModRow key={i} row={row} />)
      ) : (
        <div>Loading...</div>
      )}
    </section>
  );
};

const ModRow: React.FC<{ row: Mod[] }> = ({ row }) => {
  return (
    <div className="flex flex-row gap-4 px-4 py-4">
      {row.map((mod) => (
        <div
          key={mod.name}
          className="flex flex-col items-center justify-center gap-4 px-4 py-4"
        >
          {mod.name}
          <div>{mod.url}</div>
          <div>{mod.description}</div>
        </div>
      ))}
    </div>
  );
};

export default Home;
