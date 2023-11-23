import React, { useState, type ReactNode, useContext, useEffect, createContext, type ChangeEvent } from "react";

import { setCookie } from "cookies-next";

import GoogleAnalytics from "@components/scripts/google_analytics";

import Header from "@components/header";
import MobileMenu from "@components/header/mobile_menu";
import Login from "@components/login";
import Background from "./background";
import { ErrorCtx, SuccessCtx } from "@pages/_app";
import Error from "./responses/error";
import Success from "./responses/success";

export type filterArgs = {
    timeframe: number
    sort: number
    search?: string

    timeframeCb: ((e: ChangeEvent<HTMLSelectElement>) => void)
    sortCb: ((e: ChangeEvent<HTMLSelectElement>) => void)
    searchCb: ((e: ChangeEvent<HTMLSelectElement>) => void)
}

export type displayArgs = {
    display: string

    displayCb: (e: React.MouseEvent) => void
}

export const FilterCtx = createContext<filterArgs | null>(null);
export const DisplayCtx = createContext<displayArgs | null>(null);
export const CookiesCtx = createContext<{ [key: string]: string }>({});

export const ViewPortCtx = createContext({
    isMobile: false
})

export default function Main ({
    children,
    className,
    background = "bg-gradient-to-b from-[#002736] to-[#00151b]",
    image = "/images/backgrounds/default.jpg",
    overlay = "bg-none md:bg-black/80",
    excludeCdn = false,
    cookies,
    showFilters = false
} : {
    children: ReactNode,
    className?: string,
    background?: string,
    image?: string,
    overlay?: string,
    excludeCdn?: boolean,
    cookies?: { [key: string]: string },
    showFilters?: boolean
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const checkResize = () => {
                if (window.innerWidth < 640)
                    setIsMobile(true);
                else
                    setIsMobile(false);
            }

            // Check for mobile now.
            checkResize();

            // Add event listener for resize events.
            window.addEventListener("resize", checkResize);
        }
    }, [])
    
    // Handle filtering and display options.
    const [timeframe, setTimeframe] = useState<number>(0);
    const [sort, setSort] = useState<number>(0);
    const [search, setSearch] = useState<string | undefined>(undefined);
    const [displayStr, setDisplay] = useState((cookies) ? cookies["bm_display"] ?? "grid" : "grid");

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
            setSearch(undefined);
    };

    const displayCb = (e: React.MouseEvent) => {
        e.preventDefault();

        // We treat this as a switch/toggle.
        if (displayStr == "table") {
            setDisplay("grid");
            setCookie("bm_display", "grid");

            if (cookies)
                cookies["bm_display"] = "grid";
        }
        else {
            setDisplay("table");
            setCookie("bm_display", "table");

            if (cookies)
                cookies["bm_display"] = "table";
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

    const gId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

    return (
        <ViewPortCtx.Provider value={{
            isMobile: isMobile
        }}>
            <CookiesCtx.Provider value={cookies ?? {}}>
                <main key="main" className={className}>
                    {gId && (
                        <GoogleAnalytics 
                            id={gId}
                        />
                    )}
                    <FilterCtx.Provider value={filters}>
                        <DisplayCtx.Provider value={display}>
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

                            {errorCtx?.title && errorCtx?.msg && (
                                <Error
                                    title={errorCtx.title}
                                    msg={errorCtx.msg}
                                />
                            )}

                            {successCtx?.title && successCtx?.msg && (
                                <Success
                                    title={successCtx.title}
                                    msg={successCtx.msg}
                                />
                            )}

                            <div className="relative">
                                {children}
                            </div>
                        </DisplayCtx.Provider>
                    </FilterCtx.Provider>
                </main>
            </CookiesCtx.Provider>
        </ViewPortCtx.Provider>
    )
}