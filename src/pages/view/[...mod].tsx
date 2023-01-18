import { BestModsPage} from '../../components/main';

import { Mod } from "@prisma/client";
import { type NextPage } from "next";
import React, { useContext, useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/router'

import { trpc } from "../../utils/trpc";
import { ModSource, ModDownload } from '@prisma/client';

import { marked } from 'marked';

import HeadInfo from "../../components/Head";

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
  const modParam = (query.mod != null) ? query.mod[0] : null;
  const modView = (query.mod != null && query.mod[1] != null) ? query.mod[1] : 'overview';

  const modQuery = trpc.mod.getMod.useQuery({url: modParam ?? ""});
  const mod = modQuery.data;

  if (mod != null) {
    let body: JSX.Element = <></>;

    // Generate classes for buttons and such.
    const btnBaseClasses = "!font-sm text-white font-bold rounded-t p-1 md:p-3 mr-1";
    const defaultStyle = "bg-cyan-900/50";
    const activeStyle = "font-bold bg-cyan-500/50";

    // Decide what content to serve.
    if (modView == "install")
      body = <ModInstall mod={mod} />;
    else if (modView == "sources")
      body = <ModSources mod={mod} />;
    else if (modView == "downloads")
      body = <ModDownloads mod={mod} />;
    else
      body = <ModOverview mod={mod} />;

    // Generate image and link URLs.
    let banner = "/images/mod/default.png";

    if (mod.banner != null)
      banner = mod.banner;

    const overviewLink = "/view/" + modParam;
    const installLink = "/view/" + modParam + "/install";
    const sourcesLink = "/view/" + modParam + "/sources";
    const downloadsLink = "/view/" + modParam + "/downloads";
    const editLink = "/admin/add/mod/" + modParam;

    return (
      <>
        <div className="container mx-auto w-full">
          <div id="modHeader">
            <div className="flex justify-center">
              <img className="block rounded-t w-96 h-72" src={banner} />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-white text-center">{mod.name}</h1>
          </div>

          <div id="modButtons" className="flex justify-center">
            <a href={overviewLink} className={`${btnBaseClasses} ${modView == "overview" ? activeStyle : defaultStyle}`}>Overview</a>
            <a href={installLink} className={`${btnBaseClasses} ${modView == "install" ? activeStyle : defaultStyle}`}>Installation</a>
            <a href={sourcesLink} className={`${btnBaseClasses} ${modView == "sources" ? activeStyle : defaultStyle}`}>Sources</a>
            <a href={downloadsLink} className={`${btnBaseClasses} ${modView == "downloads" ? activeStyle : defaultStyle}`}>Downloads</a>
          </div>

          <div className="p-12 w-full rounded-b bg-cyan-900/20">
            <div className="text-white" id="viewContent">
              {body}
            </div>

            <div className="flex flex-row justify-center items-center">
              <a href={editLink} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded px-4 py-2 mt-2 max-w-xs">Edit</a>
            </div>
          </div>
        </div>
      </>
    )
  } else {
    return (
      <>
        {modQuery.isFetched && (
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-white text-center">Not Found</h1>
            <p className="text-white text-center">Mod not found. Please check the URL.</p>
          </div>
        )}
      </>
    );
  }
};

const ModOverview: React.FC<{ mod: Mod }> = ({ mod }) => {
  const data = marked(mod.description);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: data }} />
    </>
  );
};

const ModInstall: React.FC<{ mod: Mod }> = ({ mod }) => {
  const data = (mod.install != null) ? marked(mod.install) : "<p>No installation guide found.</p>";

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: data }} />
    </>
  );
};

const ModSources: React.FC<{ mod: Mod }> = ({ mod }) => {
  return (
    <>
      <h3>Sources</h3>
      {mod.ModSource != null && mod.ModSource.length > 0 && (
        <div className="flex flex-wrap gap-6">
          
          {mod.ModSource.map((src: ModSource) => {
            const srcQuery = trpc.source.getSource.useQuery({
              url: src.sourceUrl 
            });

            const srcData = srcQuery.data;

            let name = "Placeholder";
            let banner = "/images/source/default_banner.png";

            if (srcData != null && srcQuery.isFetched) {
              name = srcData.name;
              
              if (srcData.banner != null)
                banner = srcData.banner;
            }

            const srcLink = "https://" + src.sourceUrl + "/" + src.query;

            return (
              <a key={"src-" + src.modId + "-" + src.sourceUrl + "-" + src.query} href={srcLink} className="relative no-underline" target="_blank">
                <div className="bg-cyan-500/50 hover:bg-cyan-600/50 rounded w-72 h-48">
                  <div className="w-full h-36">
                    <img src={banner} className="w-full h-full rounded-t" />
                  </div>
                  <div className="w-full text-center">
                    <h3 className="!text-lg font-bold no-underline">{name}</h3>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
};

const ModDownloads: React.FC<{ mod: Mod }> = ({ mod }) => {
  const downloadsQuery = trpc.modDownload.getModDownloads.useQuery({
    id: mod.id
  });

  const downloads = downloadsQuery.data ?? [];

  return (
    <>
      {downloads.map((dl: ModDownload) => {
        return (
          <div key={dl.modId + dl.url} className="p-6 max-w-lg bg-teal-800 hover:bg-teal-900 rounded flex m-6">
            <a className="text-white ml-2" href={dl.url} target="_blank">{dl.name}</a>
          </div>
        );
      })}
    </>
  );
};

export default Home;
