import { Mod } from "@prisma/client";
import { Field, Form, Formik } from "formik";
import { type NextPage } from "next";
import React, { useContext, useEffect, useMemo } from "react";
import CreateMod from "../components/forms/CreateMod";
import HeadInfo from "../components/Head";
import { trpc } from "../utils/trpc";

export const FieldStyle =
  "rounded bg-slate-300 text-3xl text-slate-800 shadow-md shadow-slate-400";

const SearchBar = () => {
  return (
    <Formik
      initialValues={{ search: "" }}
      onSubmit={(e) => {
        history.pushState(null, "", `?search=${e.search}`);
      }}
    >
      <Form className="w-4/5">
        <Field
          className={`w-full px-4 py-3 text-3xl ${FieldStyle}`}
          placeholder="Search mod or add by mod name"
          type="text"
          name="search"
        />
      </Form>
    </Formik>
  );
};

export const DirtyContext = React.createContext<{
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
} | null>(null);

const Home: NextPage = () => {
  const [dirty, setDirty] = React.useState(false);

  return (
    <>
      <HeadInfo 
        title="Best Mods - Discover The Top Mods On The Internet!"
        
      />
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container mx-auto flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-center text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-blue-400">B</span>est{" "}
            <span className="text-blue-400">M</span>ods
          </h1>
          <DirtyContext.Provider value={{ dirty, setDirty }}>
            <SearchBar />
            <CreateMod></CreateMod>
            <ModBrowser />
          </DirtyContext.Provider>
        </div>
      </main>
    </>
  );
};

const ModBrowser: React.FC = () => {
  const dirtyContext = useContext(DirtyContext);
  const mods = trpc.public.getAllMods.useQuery();
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

  useEffect(() => {
    if (dirtyContext?.dirty) {
      mods.refetch();
      dirtyContext.setDirty(false);
    }
  }, [dirtyContext, mods]);

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
