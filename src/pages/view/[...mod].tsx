import { Mod } from "@prisma/client";
import { Field, Form, Formik } from "formik";
import { type NextPage } from "next";
import React, { useContext, useState, useEffect, useMemo } from "react";

import HeadInfo from "../../components/Head";
import { trpc } from "../../utils/trpc";

import { useRouter } from 'next/router'

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

                    <ModMain />
                </div>
            </main>
        </>
    );
};

const ModMain: React.FC = () => {
    const { asPath, route, query } = useRouter()
    const modParam = (query.mod != null) ? query.mod[0] : null;
    const modView = (query.mod != null && query.mod[1] != null) ? query.mod[1] : 'overview';

    let url = null;
    let id = null;

    if (modParam != null) {
      if (isNaN(Number(modParam))) {
        url = modParam;
      } else {
        id = Number(modParam);
      }
    }

    const modQuery = trpc.mod.getMod.useQuery({url: url, id: id});
    const mod = modQuery.data;

    if (mod != null) {
      return (
        <>
          <section>
            <h1>{mod.name}</h1>
          </section>
        </>
      )
    } else {
      return (
        <>
            <p className="text-white">Mod not found</p>
        </>
      );
    }
};

const ModOverview: React.FC<{ mod: Mod}> = ({ mod }) => {
  
};



export default Home;
