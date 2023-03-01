import { Field, Form, Formik } from "formik";
import React, { useState, useContext } from "react";

import { signIn, signOut, useSession } from "next-auth/react";

import { trpc } from '../utils/trpc';

import Link from 'next/link'
import Script from "next/script";
import { setCookie, getCookie } from 'cookies-next';

export type cfg = {
    cdn: string | undefined
}

export type filterArgs = {
    timeframe: number | null
    sort: number | null
    search: string | null
 
    timeframeCb: ((e: React.ChangeEvent<HTMLSelectElement>) => void) | null 
    sortCb: ((e: React.ChangeEvent<HTMLSelectElement>) => void) | null
    searchCb: ((e: React.ChangeEvent<HTMLSelectElement>) => void) | null
}

export type displayArgs = {
    display: string

    displayCb: (e: React.MouseEvent) => void
}

export const SessionCtx = React.createContext<any | null>(null);
export const FilterCtx = React.createContext<filterArgs | null>(null);
export const CfgCtx = React.createContext<cfg | null>(null);
export const DisplayCtx = React.createContext<displayArgs | null>(null);
export const CookiesCtx = React.createContext<{ [key: string]: string }>({}); 

export const BestModsPage: React.FC<{ content: JSX.Element, classes?: string | null, background?: string, image?: string | null, overlay?: string, excludeCdn?: boolean, cookies?: { [key: string]: string}, showFilters?: boolean }> = ({ content, classes, background="bg-gradient-to-b from-[#002736] to-[#00151b]", image="/images/backgrounds/default.jpg", overlay="bg-none md:bg-black/80", excludeCdn=false, cookies, showFilters=false }) => {
    // Retrieve session to use in context.
    const { data: session } = useSession();

    // Handle filtering and display options.
    const [timeframe, setTimeframe] = useState<number | null>(0);
    const [sort, setSort] = useState<number | null>(0);
    const [search, setSearch] = useState<string | null>(null);
    const [displayStr, setDisplay] = useState((cookies) ? cookies['bm_display'] ?? "grid" : "grid");
  
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

    const displayCb = (e: React.MouseEvent) => {
        e.preventDefault();
        
        // We treat this like a switch.
        if (displayStr == "table") {
            setDisplay("grid");
            setCookie("bm_display", "grid");
        }
        else {
            setDisplay("table");
            setCookie("bm_display", "table");
        }
    }
  
    const filters: filterArgs = {
      timeframe: timeframe,
      sort: sort,
      search: search,
      timeframeCb: timeframeCb,
      sortCb: sortCb,
      searchCb: searchCb
    };

    const display: displayArgs = {
        display: displayStr,
        displayCb: displayCb
    };

    // Retrieve config (e.g. CDN URL).
    const cfgQuery = trpc.files.getCfg.useQuery();

    const cfg = cfgQuery.data;

    // Check if we must prepend CDN URL.
    if (cfg != null && cfg.cdn && !excludeCdn)
        image = cfg.cdn + image;

    return (
      <>
        <main key="main" className={`flex min-h-screen flex-col pb-20 ${classes != null ? classes : ""}`}>
            <Script id="google-tag-manager" src="https://www.googletagmanager.com/gtag/js?id=G-EZBGB6N5XL" strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){window.dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', 'G-EZBGB6N5XL');
                `}
            </Script>
            <CfgCtx.Provider value={cfg ?? null}>
                <SessionCtx.Provider value={session}>
                    <FilterCtx.Provider value={filters}>
                        <DisplayCtx.Provider value={display}>
                            <CookiesCtx.Provider value={cookies ?? {}}>
                                <div className="flex flex-wrap justify-between">
                                    <MobileMenu />
                                    <Login />
                                </div>
                            
                                <Background 
                                    background={background}
                                    image={image}
                                    overlay={overlay}
                                />

                                <div className="container mx-auto flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                                    <Header 
                                        showFilters={showFilters}
                                    />
                                </div>

                                <div className="relative">
                                    {content}
                                </div>
                            </CookiesCtx.Provider>
                        </DisplayCtx.Provider>
                    </FilterCtx.Provider>
                </SessionCtx.Provider>
            </CfgCtx.Provider>
        </main>
      </>
    )
};

export const MobileMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className={`absolute sm:hidden ${isOpen ? "min-h-full h-auto w-2/3 md:h-auto md:w-1/4 transition-all ease-in-out duration-300" : ""} z-50 top-0 left-0 rounded-br bg-cyan-800 hover:bg-cyan-900`}>
                <div className={isOpen ? "flex justify-end" : ""}>
                    <button className="p-4 text-center" onClick={() => {
                        if (isOpen)
                            setIsOpen(false);
                        else
                            setIsOpen(true);
                    }}>
                        {isOpen ? (
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M11.7071 5.29289C12.0976 5.68342 12.0976 6.31658 11.7071 6.70711L7.41421 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H7.41421L11.7071 17.2929C12.0976 17.6834 12.0976 18.3166 11.7071 18.7071C11.3166 19.0976 10.6834 19.0976 10.2929 18.7071L4.29289 12.7071C3.90237 12.3166 3.90237 11.6834 4.29289 11.2929L10.2929 5.29289C10.6834 4.90237 11.3166 4.90237 11.7071 5.29289Z" fill="#FFFFFF"/></svg>
                        ): (
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11066)"><path d="M3 6.00092H21M3 12.0009H21M3 18.0009H21" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11066"><rect width="24" height="24" fill="white" transform="translate(0 0.000915527)"/></clipPath></defs></svg>
                        )}
                    </button>
                </div>
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
  
export const Background: React.FC<{background?: string, image?: string | null, overlay?: boolean | string }> = ({ background="bg-gradient-to-b from-[#002736] to-[#00151b]", image=null, overlay=true }) => {
    return (<>
        {overlay && (
            <div id="bgol" className={typeof(overlay) === "string" ? overlay : "bg-black/80"}></div>
        )}
        
        <div id="bg" className={background}>
            {image != null && (
                <img src={image} className="hidden md:block w-full h-full" alt="background" />
            )}
        </div>
    </>);
};
  
export const Header: React.FC<{ showFilters?: boolean }> = ({ showFilters=false}) => {
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
        {showFilters && (
            <Filters
                classes="hidden sm:flex w-full justify-center items-center gap-2 flex-wrap"
            />    
        )}
    </>);
};

const Filters: React.FC<{classes?: string}> = ({ classes="w-full flex justify-center items-center gap-2 flex-wrap" }) => {
    const filters = useContext(FilterCtx);
    const display = useContext(DisplayCtx);

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
                <div className="relative w-full sm:w-32">
                    <select name="filterTimeframe" value={filters?.timeframe?.toString() ?? ""} onChange={filters?.timeframeCb ?? ((e) => {
                    if (typeof window !== "undefined")
                        window.location.href = "/?timeframe=" + e.target.value;
                })} className="block p-4 w-full text-lg text-gray-100 bg-gray-700 rounded-lg border border-gray-600 focus:ring-cyan-700 focus:border-cyan-700">
                        <option value="0">Hourly</option>
                        <option value="1">Today</option>
                        <option value="2">Week</option>
                        <option value="3">Month</option>
                        <option value="4">Year</option>
                        <option value="5">All Time</option>
                    </select>
                </div>
                <div className="relative w-full sm:w-3/12">
                    <select name="filterSort" value={filters?.sort?.toString() ?? ""} onChange={filters?.sortCb ?? ((e) => {
                    if (typeof window !== "undefined")
                        window.location.href = "/?sort=" + e.target.value;
                })} className="block p-4 w-full text-lg text-gray-100 bg-gray-700 rounded-lg border border-gray-600 focus:ring-cyan-700 focus:border-cyan-700">
                        <option value="0">Top Rated</option>
                        <option value="1">Most Viewed</option>
                        <option value="2">Most Downloaded</option>
                        <option value="3">Most Recently Updated</option>
                        <option value="4">Most Recently Created</option>
                    </select>
                </div>
                <div className="relative w-full sm:w-1/3 ">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    <Field type="search" name="search" id="search" value={filters?.search ?? ""} onChange={filters?.searchCb ?? ((e) => {
                        if (typeof window !== "undefined")
                            window.location.href = "/?search=" + e.target.value;
                    })} className="block p-4 pl-10 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 focus:ring-cyan-700 focus:border-cyan-700" placeholder="Search for your favorite mods!" />
                </div>
                <div className="relative w-full sm:w-16 flex items-center justify-center">
                    <Link href="/category">
                        <div className="block p-1 w-full text-lg text-gray-100 bg-gray-700 rounded-lg border border-gray-600 hover:bg-cyan-700">
                            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11052)"><circle cx="17" cy="7" r="3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7" cy="17" r="3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 14H20V19C20 19.5523 19.5523 20 19 20H15C14.4477 20 14 19.5523 14 19V14Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 4H10V9C10 9.55228 9.55228 10 9 10H5C4.44772 10 4 9.55228 4 9V4Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11052"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                        </div>
                    </Link>
                </div>
                <div className="relative w-full sm:w-16 flex items-center justify-center">
                    <button onClick={display?.displayCb}>
                        <div className="block p-1 w-full text-lg text-gray-100 bg-gray-700 rounded-lg border border-gray-600 hover:bg-cyan-700">
                            {display?.display == "grid" ? (
                                <svg fill="#FFFFFF" className="w-10 h-10" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg"><path d="M1740 0c99.24 0 180 80.76 180 180v1560c0 99.24-80.76 180-180 180H180c-99.24 0-180-80.76-180-180V180C0 80.76 80.76 0 180 0h1560Zm-420 1200h480V720h-480v480Zm480 540v-420h-480v480h420c33 0 60-27 60-60ZM720 1200h480V720H720v480Zm0 600h480v-480H720v480Zm-600-600h480V720H120v480Zm480 600v-480H120v420c0 33 27 60 60 60h420Z" fill-rule="evenodd"/></svg>
                            ) : (
                                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="none"/><path d="M2 8.976C2 7.72287 2.06584 6.64762 2.26552 5.74916C2.46772 4.83933 2.82021 4.05065 3.43543 3.43543C4.05065 2.82021 4.83933 2.46772 5.74915 2.26552C6.64762 2.06584 7.72287 2 8.976 2L9 2C10.1046 2 11 2.89543 11 4L11 9C11 10.1046 10.1046 11 9 11L4 11C2.89543 11 2 10.1046 2 9L2 8.976Z" fill="#FFFFFF"/><path d="M22 15.024C22 16.2771 21.9342 17.3524 21.7345 18.2508C21.5323 19.1607 21.1798 19.9494 20.5646 20.5646C19.9494 21.1798 19.1607 21.5323 18.2508 21.7345C17.3524 21.9342 16.2771 22 15.024 22L15 22C13.8954 22 13 21.1046 13 20L13 15C13 13.8954 13.8954 13 15 13L20 13C21.1046 13 22 13.8954 22 15L22 15.024Z" fill="#FFFFFF"/><path d="M2 15.024C2 16.2771 2.06584 17.3524 2.26552 18.2508C2.46772 19.1607 2.82021 19.9494 3.43543 20.5646C4.05065 21.1798 4.83933 21.5323 5.74915 21.7345C6.64762 21.9342 7.72287 22 8.976 22L9 22C10.1046 22 11 21.1046 11 20L11 15C11 13.8954 10.1046 13 9 13L4 13C2.89543 13 2 13.8954 2 15L2 15.024Z" fill="#FFFFFF"/><path d="M22 8.976C22 7.72287 21.9342 6.64762 21.7345 5.74916C21.5323 4.83933 21.1798 4.05065 20.5646 3.43543C19.9494 2.82021 19.1607 2.46772 18.2508 2.26552C17.3524 2.06584 16.2771 2 15.024 2L15 2C13.8954 2 13 2.89543 13 4L13 9C13 10.1046 13.8954 11 15 11L20 11C21.1046 11 22 10.1046 22 9L22 8.976Z" fill="#FFFFFF"/></svg>
                            )}
                        </div>
                    </button>
                </div>
            </Form>
        </Formik>
    );
};

export const MainNavItems: React.FC<{classes?: string | null}> = ({ classes }) => {
    return (
        <>
            <a rel="noreferrer" className={classes != null ? classes : "text-gray-300 hover:text-white"} href="https://github.com/orgs/bestmods/discussions/categories/feedback-ideas" target="_blank">Feedback</a>
            <a rel="noreferrer" className={classes != null ? classes : "text-gray-300 hover:text-white"} href="https://github.com/bestmods/roadmap/milestones" target="_blank">Roadmap</a>
            <a rel="noreferrer" className={classes != null ? classes : "text-gray-300 hover:text-white"} href="https://github.com/BestMods/bestmods" target="_blank">Source Code</a>
            <a rel="noreferrer" className={classes != null ? classes : "text-gray-300 hover:text-white"} href="https://github.com/orgs/bestmods/discussions/2" target="_blank">Removals</a>
            <a rel="noreferrer" className={classes != null ? classes : "text-gray-300 hover:text-white"} href="https://moddingcommunity.com/" target="_blank">Community</a>
        </>
    );
}