import { Field, Form, Formik } from "formik";
import React, { useState, useContext } from "react";

import { signIn, signOut, useSession } from "next-auth/react";

import { trpc } from '../utils/trpc';

import Link from 'next/link'

export type filterArgs = {
    categories: Array<number> | null
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

export const BestModsPage: React.FC<{ content: JSX.Element, classes?: string | null }> = ({ content, classes }) => {
    const { data: session } = useSession();

    const [categories, setCategories] = useState<Array<number> | null>(null);
    const [timeframe, setTimeframe] = useState<number | null>(0);
    const [sort, setSort] = useState<number | null>(0);
    const [search, setSearch] = useState<string | null>(null);
  
    const categoriesCb = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let val = categories;

        if (!val)
            val = [];

        const idInQ = Number(e.target.value);

        if (val.includes(idInQ)) {
            const idxToRem = val.findIndex(id => id === idInQ);

            if (idxToRem > -1)
                val.splice(idxToRem, 1);
        } else
            val.push(idInQ);
            
        setCategories(val);
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
        <main key="main" className={`flex min-h-screen flex-col bg-gradient-to-b from-[#002736] to-[#00151b] pb-20 ${classes != null ? classes : ""}`}>
            <SessionCtx.Provider value={session}>
                <FilterCtx.Provider value={filters}>
                    <div className="flex flex-wrap justify-between">
                        <MobileMenu />
                        <Login />
                    </div>
                
                    <Background />

                    <div className="container mx-auto flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                        <Header />
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

export const MobileMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className={`absolute sm:hidden ${isOpen ? "min-h-full h-auto w-2/3 md:h-auto md:w-1/4 transition-all ease-in-out duration-300" : ""} z-50 top-0 left-0 rounded-br bg-cyan-800 hover:bg-cyan-900`}>
                <button className="p-4 text-center" onClick={(e) => {
                    if (isOpen)
                        setIsOpen(false);
                    else
                        setIsOpen(true);
                }}>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11066)"><path d="M3 6.00092H21M3 12.0009H21M3 18.0009H21" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11066"><rect width="24" height="24" fill="white" transform="translate(0 0.000915527)"/></clipPath></defs></svg>
                </button>
                <div className={`${isOpen ? "block" : "hidden"} p-4`}>
                    <div className=" text-white">
                        <MainNavItems 
                            classes="block p-5 text-gray-300 hover:text-white" 
                        />
                    </div>

                    <Filters />
                </div>
            </div>
        </>
    )
}

export const Categories: React.FC = () => {
    const filters = useContext(FilterCtx);

    const [isOpen, setIsOpen] = useState(false);

    const catsQuery = trpc.category.getCategoriesMapping.useQuery({includeMods: false});
    const cats = catsQuery.data;

    return (
        <>
            <div className={`fixed ${isOpen ? "h-full w-1/2 md:h-auto md:w-1/4 transition-all ease-in-out duration-300" : ""} z-50 top-0 left-0 rounded-br bg-cyan-800 hover:bg-cyan-900`}>
                <button className="p-4 text-center" onClick={(e) => {
                    if (isOpen)
                        setIsOpen(false);
                    else
                        setIsOpen(true);
                }}>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_429_11052)"><circle cx="17" cy="7" r="3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7" cy="17" r="3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 14H20V19C20 19.5523 19.5523 20 19 20H15C14.4477 20 14 19.5523 14 19V14Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 4H10V9C10 9.55228 9.55228 10 9 10H5C4.44772 10 4 9.55228 4 9V4Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11052"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                </button>
                <div className={`${isOpen ? "block" : "hidden"} p-4`}>
                    <h1 className="text-white text-center text-2xl">Categories</h1>
                    {cats != null && cats.length > 0 && (
                        <div className="relative">
                            {cats.map((cat) => {
                                return (
                                    <>
                                        <span className="flex items-center">{cat.icon != null && (
                                            <img src={cat.icon} className="w-4 h-4" />
                                        )}
                                        <h3 className="text-white text-lg ml-2">{cat.nameShort}</h3></span>
                                        {cat.children != null && cat.children.length > 0 && (
                                            <ul className="list-none ml-10">
                                                {cat.children.map((child) => {
                                                    return (
                                                        <li key={"catChild-" + child.id} className="text-white">{child.nameShort}</li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </>
                                );
                            })}
                            
                        </div>
                    )}
                    
                </div>

            </div>
        </>
    )
}

export const Login: React.FC = () => {
    const session = useContext(SessionCtx);

    return (
        <div className="absolute top-0 right-0 rounded-bl bg-cyan-800 hover:bg-cyan-900">
            {session == null ? (
                <button className="p-4 text-center " onClick={() => {
                    signIn("discord");
                }}><span><svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1C8.96243 1 6.5 3.46243 6.5 6.5C6.5 9.53757 8.96243 12 12 12C15.0376 12 17.5 9.53757 17.5 6.5C17.5 3.46243 15.0376 1 12 1Z" fill="#FFFFFF"/>
                <path d="M7 14C4.23858 14 2 16.2386 2 19V22C2 22.5523 2.44772 23 3 23H21C21.5523 23 22 22.5523 22 22V19C22 16.2386 19.7614 14 17 14H7Z" fill="#FFFFFF"/>
                </svg></span></button>
            ) : (
                <button className="p-4 text-center text-white bg-cyan-800 hover:bg-cyan-900" onClick={() => {
                    signOut();
                }}>Sign Out</button>
            )}
        </div>
    );
};
  
export const Background: React.FC = () => {
    return (<>
        <div id="bgol"></div>
        <div id="bg"></div>
    </>);
};
  
export const Header: React.FC = () => {
    return (<>
        <div className="relative">
            <h1 className="text-center text-[3rem] font-extrabold tracking-tight text-white sm:text-[5rem]">
                <Link href="/"><span className="text-blue-400">B</span>est{" "}
                <span className="text-blue-400">M</span>ods</Link>
            </h1>
            <div className="hidden sm:flex flex-wrap text-gray-300 font-mono text-sm gap-5">
                <MainNavItems />
            </div>
        </div>

        <Filters
            classes="hidden sm:flex w-full justify-center items-center gap-2 flex-wrap"
        />
    </>);
};

const Filters: React.FC<{classes?: string}> = ({ classes="w-full flex justify-center items-center gap-2 flex-wrap" }) => {
    const filters = useContext(FilterCtx);

    return (
        <Formik
            initialValues={{ 
                search: ""
            }}
            onSubmit={(e) => {
                history.pushState(null, "", `?search=${e.search}`);
            }}
        >
            <Form className={classes}>
                <div className="relative w-full md:w-32">
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
                        <option value="3">Most Recently Updated</option>
                        <option value="4">Most Recently Created</option>
                    </select>
                </div>
                <div className="relative w-full md:w-1/3 ">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    <Field type="search" name="search" id="search" value={filters?.search ?? ""} onChange={filters?.searchCb ?? ((e) => {
                        if (typeof window !== "undefined")
                            window.location.href = "/?search=" + e.target.value;
                    })} className="block p-4 pl-10 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500" placeholder="Search for your favorite mods!" />
                </div>
                <div className="relative w-full md:w-16 flex items-center justify-center">
                    <Link href="/category">
                        <div className="block p-4 w-full text-lg text-gray-100 bg-gray-700 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_429_11052)"><circle cx="17" cy="7" r="3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7" cy="17" r="3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 14H20V19C20 19.5523 19.5523 20 19 20H15C14.4477 20 14 19.5523 14 19V14Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 4H10V9C10 9.55228 9.55228 10 9 10H5C4.44772 10 4 9.55228 4 9V4Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11052"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                        </div>
                    </Link>
                </div>
            </Form>
        </Formik>
    );
};

export const MainNavItems: React.FC<{classes?: string | null}> = ({ classes }) => {
    return (
        <>
            <a rel="noreferrer" className={classes != null ? classes : "text-gray-300 hover:text-white"} href="https://github.com/orgs/bestmods/discussions/categories/feedback-ideas" target="_blank">Feedback</a>
            <a rel="noreferrer" className={classes != null ? classes : "text-gray-300 hover:text-white"} href="https://github.com/bestmods/roadmap/issues" target="_blank">Roadmap</a>
            <a rel="noreferrer" className={classes != null ? classes : "text-gray-300 hover:text-white"} href="https://github.com/BestMods/bestmods" target="_blank">Source Code</a>
            <a rel="noreferrer" className={classes != null ? classes : "text-gray-300 hover:text-white"} href="https://github.com/orgs/bestmods/discussions/2" target="_blank">Removals</a>
            <a rel="noreferrer" className={classes != null ? classes : "text-gray-300 hover:text-white"} href="https://moddingcommunity.com/" target="_blank">Community</a>
        </>
    );
}