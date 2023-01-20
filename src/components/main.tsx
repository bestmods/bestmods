import { Field, Form, Formik } from "formik";
import React, { useState, useContext } from "react";

import { signIn, signOut, useSession } from "next-auth/react";

export type filterArgs = {
    categories: string | null
    timeframe: number | null
    sort: number | null
    search: string | null
    
    categoriesCb: ((e: React.ChangeEvent<HTMLSelectElement>) => void) | null 
    timeframeCb: ((e: React.ChangeEvent<HTMLSelectElement>) => void) | null 
    sortCb: ((e: React.ChangeEvent<HTMLSelectElement>) => void) | null
    searchCb: ((e: React.ChangeEvent<HTMLSelectElement>) => void) | null
}

export const SessionCtx = React.createContext<any | null>(null);
export const FilterCtx = React.createContext<filterArgs | null>(null);

export const BestModsLogin: React.FC<{session: any | null}> = ({session}) => {
    return (
        <>
            <div className="flex justify-end items-end">
                <div>
                    {session == null ? (
                        <button className="p-4 text-center text-white bg-cyan-800 hover:bg-cyan-900" onClick={() => {
                            signIn("discord");
                        }}>Sign In!</button>
                    ) : (
                        <button className="p-4 text-center text-white bg-cyan-800 hover:bg-cyan-900" onClick={() => {
                            signOut();
                        }}>Sign Out</button>
                    )}
                </div>
            </div>
        </>
    );
};

export const BestModsPage: React.FC<{ content: JSX.Element, classes?: string | null }> = ({ content, classes }) => {
    const { data: session } = useSession();

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
        <main className={`flex min-h-screen flex-col bg-gradient-to-b from-[#002736] to-[#00151b] pb-20 ${classes != null ? classes : ""}`}>
            <SessionCtx.Provider value={session}>
                <BestModsLogin 
                    session={session}
                ></BestModsLogin>

                <FilterCtx.Provider value={filters}>
                    <BestModsBackground></BestModsBackground>
                
                    <div className="container mx-auto flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                        <BestModsHeader 
                            filters={filters}
                        ></BestModsHeader>
                    </div>
                    <div className="relative">
                        {content}
                    </div>
                </FilterCtx.Provider>
            </SessionCtx.Provider>
        </main>
      </>
    )
  };
  
export const BestModsBackground = () => {
    return (<>
        <div id="bgol"></div>
        <div id="bg"></div>
    </>);
};
  
export const BestModsHeader: React.FC = () => {
    return (<>
        <h1 className="text-center text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <a href="/"><span className="text-blue-400">B</span>est{" "}
            <span className="text-blue-400">M</span>ods</a>
        </h1>
        <div className="flex flex-wrap text-gray-300 font-mono text-sm gap-5">
            <a className="hover:text-white" href="https://github.com/orgs/bestmods/discussions/categories/feedback-ideas" target="_blank">Feedback</a>
            <a className="hover:text-white" href="https://github.com/bestmods/roadmap/issues" target="_blank">Roadmap</a>
            <a className="hover:text-white" href="https://github.com/BestMods/bestmods" target="_blank">Source Code</a>
            <a className="hover:text-white" href="https://github.com/orgs/bestmods/discussions/2">Removals</a>
            <a className="hover:text-white" href="https://moddingcommunity.com/" target="_blank">Community</a>
        </div>

        <Formik
            initialValues={{ 
                search: ""
            }}
            onSubmit={(e) => {
                history.pushState(null, "", `?search=${e.search}`);
            }}
        >
            <Form className="w-full flex justify-center items-center gap-2 flex-wrap">
                <Filters />
                <SearchBar />
            </Form>
        </Formik>
    </>);
};

const Filters: React.FC = () => {
    const filters = useContext(FilterCtx);

    return (
        <>
            <div className="relative w-full md:w-3/12">
                <select name="filterTimeframe" value={filters?.timeframe?.toString() ?? ""} onChange={filters?.timeframeCb ?? ((e) => {
                if (typeof window !== "undefined")
                    window.location.href = "/?timeframe=" + e.target.value;
            })} className="block p-4 w-full text-lg text-gray-100 bg-gray-700 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                    <option value="0">Hourly</option>
                    <option value="1">Today</option>
                    <option value="2">Week</option>
                    <option value="3">Month</option>
                    <option value="4">Year</option>
                    <option value="5">All Time</option>
                </select>
            </div>
            <div className="relative w-full md:w-3/12">
                <select name="filterSort" value={filters?.sort?.toString() ?? ""} onChange={filters?.sortCb ?? ((e) => {
                if (typeof window !== "undefined")
                    window.location.href = "/?sort=" + e.target.value;
            })} className="block p-4 w-full text-lg text-gray-100 bg-gray-700 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                    <option value="0">Top Rated</option>
                    <option value="1">Most Viewed</option>
                    <option value="2">Most Downloaded</option>
                    <option value="3">Most Recently Added</option>
                    <option value="4">Most Recently Created</option>
                </select>
            </div>
        </>
    );
};
  
const SearchBar: React.FC = () => {
    const filters = useContext(FilterCtx);

    return ( 
        <div className="relative w-full md:w-1/3 ">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            <Field type="search" name="search" id="search" value={filters?.search ?? ""} onChange={filters?.searchCb ?? ((e) => {
                if (typeof window !== "undefined")
                    window.location.href = "/?search=" + e.target.value;
            })} className="block p-4 pl-10 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500" placeholder="Search for your favorite mods!" />
        </div>
    );
};  