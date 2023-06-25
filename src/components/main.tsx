import { Field, Form, Formik } from "formik";
import React, { useState, useContext, type ReactNode } from "react";

import { signIn, signOut, useSession } from "next-auth/react";

import Link from 'next/link'
import { setCookie } from 'cookies-next';
import GoogleAnalytics from "./scripts/google_analytics";
import Header from "./main/header";
import MobileMenu from "./main/mobile_menu";
import Login from "./main/login";

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
export const DisplayCtx = React.createContext<displayArgs | null>(null);
export const CookiesCtx = React.createContext<{ [key: string]: string }>({});

export const BestModsPage: React.FC<{
    children: ReactNode,
    classes?: string | null,
    background?: string,
    image?: string | null,
    overlay?: string,
    excludeCdn?: boolean,
    cookies?: { [key: string]: string },
    showFilters?: boolean
}> = ({
    children,
    classes,
    background = "bg-gradient-to-b from-[#002736] to-[#00151b]",
    image = "/images/backgrounds/default.jpg",
    overlay = "bg-none md:bg-black/80",
    excludeCdn = false,
    cookies,
    showFilters = false
}) => {
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

        // We treat this as a switch/toggle.
        if (displayStr == "table") {
            setDisplay("grid");
            setCookie("bm_display", "grid");

            if (cookies)
                cookies['bm_display'] = "grid";
        }
        else {
            setDisplay("table");
            setCookie("bm_display", "table");

            if (cookies)
                cookies['bm_display'] = "table";
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

    // Check if we must prepend CDN URL.
    if (process.env.NEXT_PUBLIC_CDN_URL && !excludeCdn)
        image = process.env.NEXT_PUBLIC_CDN_URL + image;

    return (
        <main key="main" className={classes ?? ""}>
            {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
                <GoogleAnalytics 
                    id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}
                />
            )}
            <SessionCtx.Provider value={session}>
                <FilterCtx.Provider value={filters}>
                    <DisplayCtx.Provider value={display}>
                        <CookiesCtx.Provider value={cookies ?? {}}>
                            <div id="mobile-and-login">
                                <MobileMenu />
                                <Login />
                            </div>

                            <Background
                                background={background}
                                image={image}
                                overlay={overlay}
                            />

                            <Header
                                showFilters={showFilters}
                            />

                            <div className="relative">
                                {children}
                            </div>
                        </CookiesCtx.Provider>
                    </DisplayCtx.Provider>
                </FilterCtx.Provider>
            </SessionCtx.Provider>
        </main>
    );
};

const Background: React.FC<{
    background?: string,
    image?: string | null,
    overlay?: boolean | string
}> = ({
    background = "bg-gradient-to-b from-[#002736] to-[#00151b]",
    image = null,
    overlay = true 
}) => {
    return (<>
        {overlay && (
            <div id="bgol" className={typeof (overlay) === "string" ? overlay : "bg-black/80"}></div>
        )}

        <div id="bg" className={background}>
            {image && (
                <img src={image} className="hidden md:block w-full h-full" alt="background" />
            )}
        </div>
    </>);
};