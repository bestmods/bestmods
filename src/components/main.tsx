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

export type displayArgs = {
    display: string

    displayCb: (e: React.MouseEvent) => void
}

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
    cookies
} : {
    children: ReactNode,
    className?: string,
    background?: string,
    image?: string,
    overlay?: string,
    excludeCdn?: boolean,
    cookies?: { [key: string]: string }
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
            isMobile: isMobile
        }}>
            <CookiesCtx.Provider value={cookies ?? {}}>
                <main key="main" className={className}>
                    {gId && (
                        <GoogleAnalytics 
                            id={gId}
                        />
                    )}
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