import React, { useState, type ReactNode, useContext, useEffect, createContext, type ChangeEvent, useRef } from "react";

import { setCookie } from "cookies-next";

import GoogleAnalytics from "@components/scripts/google_analytics";

import Header from "@components/header";
import Background from "./background";
import { ErrorCtx, SuccessCtx } from "@pages/_app";
import Error from "./responses/error";
import Success from "./responses/success";

export type displayArgs = {
    display: string

    displayCb: (e: React.MouseEvent) => void
}

export const DisplayCtx = createContext<displayArgs | null>(null);
export const CookiesCtx = createContext<{ [key: string]: string }>({});

export const ViewPortCtx = createContext({
    isMobile: false,
    width: 0,
    height: 0
})

export default function Main ({
    children,
    className,
    image = "/images/backgrounds/default.jpg",
    overlay = "bg-none md:bg-black/80",
    excludeCdn = false,
    cookies
} : {
    children: ReactNode
    className?: string
    image?: string
    overlay?: string
    excludeCdn?: boolean
    cookies?: { [key: string]: string }
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // View ports.
    const [isMobile, setIsMobile] = useState(false);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    // Make sure to reset error and success contexts on first render.
    const firstRender = useRef(true);

    useEffect(() => {
        if (!firstRender.current)
            return;

        if (errorCtx) {
            errorCtx.setTitle(undefined);
            errorCtx.setMsg(undefined);
        }

        if (successCtx) {
            successCtx.setTitle(undefined);
            successCtx.setMsg(undefined);
        }

        firstRender.current = false;
    }, [errorCtx, successCtx])

    useEffect(() => {
        if (typeof window !== "undefined") {
            const checkResize = () => {
                if (window.innerWidth < 640)
                    setIsMobile(true);
                else
                    setIsMobile(false);

                setWidth(window.innerWidth);
                setHeight(window.innerHeight);
            }

            // Check for mobile now.
            checkResize();

            // Add event listener for resize events.
            window.addEventListener("resize", checkResize);
        }
    }, [])
    
    const [displayStr, setDisplay] = useState((cookies) ? cookies["bm_display"] ?? "grid" : "grid");

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
            isMobile: isMobile,
            width: width,
            height: height
        }}>
            <CookiesCtx.Provider value={cookies ?? {}}>
                <main key="main" className={className}>
                    {gId && (
                        <GoogleAnalytics 
                            id={gId}
                        />
                    )}
                    <DisplayCtx.Provider value={display}>
                        <Background
                            image={image}
                            overlay={overlay}
                        />

                        <Header />

                        <div className="w-full px-20 mx-auto py-2">
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
                            {children}
                        </div>
                    </DisplayCtx.Provider>
                </main>
            </CookiesCtx.Provider>
        </ViewPortCtx.Provider>
    )
}