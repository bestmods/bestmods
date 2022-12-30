import { Mod } from "@prisma/client";
import { Field, Form, Formik } from "formik";
import { type NextPage } from "next";
import React, { useContext, useState, useEffect, useMemo } from "react";

import { marked } from 'marked';

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
    // Attempt to retrieve source.
    const sourceQuery = trpc.source.getSource.useQuery({id: mod.sourceId, url: null});
    const source = sourceQuery.data;

    // Attempt to retrieve category.
    const categoryQuery = trpc.category.getCategory.useQuery({id: mod.categoryId});
    const category = categoryQuery.data;

    let body: JSX.Element = <></>;

    // Generate classes for buttons and such.
    let overviewClasses: string = "text-white font-bold rounded-t p-3 mr-1 bg-opacity-50 bg-gray-900";
    let installClasses: string = "text-white font-bold rounded-t p-3 mr-1 bg-opacity-50 bg-gray-900";
    let downloadsClasses: string = "text-white font-bold rounded-t p-3 mr-1 bg-opacity-50 bg-gray-900";

    // Check if we need to replace background in classes.
    if (modView == 'install') {
      body = <ModInstall mod={mod} />;
      installClasses.replace("bg-gray-900", "bg-gray-500");
    } else if (modView == 'downloads') {
      body = <ModDownloads mod={mod} />;
      downloadsClasses.replace("bg-gray-900", "bg-gray-500");
    } else {
      body = <ModOverview mod={mod} />;
      overviewClasses.replace("bg-gray-900", "bg-gray-500");
    }

    // Generate image and link URLs.
    let headerPath: string = "/images/";
    let origLink: string = "#";

    const overviewLink = "/view/" + modParam;
    const installLink = "/view/" + modParam + "/install";
    const downloadsLink = "/view/" + modParam + "/downloads";
    const editLink = "/view/" + modParam + "/edit";

    if (mod.image == null || mod.image.length < 1) {
      if (source != null && source.banner != null) {
        headerPath += "sources/" + source.banner;
      } else {
        headerPath += "mods/default.png";
      }
    } else {
      headerPath += "mods/" + mod.image;
    }

    // If we have a valid source, change the original link.
    if (source != null) {
      origLink = "https://" + source.url + "/" + mod.url;
    }

    return (
      <>
        <section id="mod">
          <div id="modHeader">
            <div id="modImage" className="flex justify-center">
              <img className="rounded-t max-w-full" src={headerPath} />

              <div id="modName" className="flex justify-center">
                  <h1 className="text-4xl font-bold mb-4">{mod.name}</h1>
              </div>
            </div>
          </div>

          <div id="modButtons">
            <div className="flex justify-center">
              <a href={overviewLink} className={overviewClasses}>Overview</a>
              <a href={installLink} className={installClasses}>Installation</a>
              <a href={downloadsLink} className={downloadsClasses}>Downloads</a>
            </div>
          </div>

          <div id="modContent" className="boxView p-5">
            <div id="viewContent">
              {body}
            </div>

            <div className="flex flex-row justify-center items-center">
              <a href={origLink} className="text-white bg-blue-700 mr-5 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded px-4 py-2 mt-2 max-w-xs" target="_blank">Original</a>
              <a href={editLink} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded px-4 py-2 mt-2 max-w-xs">Edit</a>
            </div>
          </div>
        </section>
      </>
    )
  } else {
    return (
      <>
        <h1 className="text-3xl font-bold mb-4">Not Found</h1>
        <p>Mod not found. Please check the URL.</p>
      </>
    );
  }
};

const ModOverview: React.FC<{ mod: Mod}> = ({ mod }) => {
  const data = marked(mod.description);

  return (
    <>
      {data}
    </>
  );
};

const ModInstall: React.FC<{ mod: Mod}> = ({ mod }) => {
  const data = (mod.install != null) ? marked(mod.install) : <p>No installation guide found.</p>;

  return (
    <>
      {data}
    </>
  );
};

const ModDownloads: React.FC<{ mod: Mod}> = ({ mod }) => {

  const downloads = (mod.downloads != null) ? JSON.parse(mod.downloads) : [];

  return (
    <>
      {downloads.map((dl: {url: string, name: string}) => (
        <a className="modDownload" href={dl.url} target="_blank">{dl.name}</a>
      ))}
    </>
  );
};

export default Home;
