import { Mod } from "@prisma/client";
import { Field, Form, Formik } from "formik";
import { type NextPage } from "next";
import React, { useContext, useEffect, useMemo } from "react";

import HeadInfo from "../../components/Head";
import { trpc } from "../../utils/trpc";

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

const Home: NextPage = () => {
  const [dirty, setDirty] = React.useState(false);

  return (
    <>
    <HeadInfo />
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container mx-auto flex flex-col items-center justify-center gap-12 px-4 py-16 ">
            <h1 className="text-center text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                <span className="text-blue-400">B</span>est{" "}
                <span className="text-blue-400">M</span>ods
            </h1>
            <SearchBar />

            <ModView />
        </div>
    </main>
    </>
  );
};

const ModView: React.FC = () => {
 
  return (
    <>
        <p>Hi!</p>
    </>
  );
};

export default Home;
