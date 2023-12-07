import React, { useState, type ReactNode, useContext, useEffect, createContext, useRef } from "react";

import GoogleAnalytics from "@components/scripts/google_analytics";

import Header from "@components/header";
import Background from "./background";
import { ErrorCtx, SuccessCtx } from "@pages/_app";
import Error from "./responses/error";
import Success from "./responses/success";
import PhotoIcon from "./icons/photo";
import GearIcon from "./icons/gear";
import { signIn, signOut, useSession } from "next-auth/react";
import UserIcon from "./icons/user";
import { useCookies } from "react-cookie";

export const ViewPortCtx = createContext({
    isMobile: false,
    width: 0,
    height: 0
})

export default function Main ({
    children,
    className,
    image = "/images/backgrounds/default.jpg",
    overlay = true,
    excludeCdn = false
} : {
    children: ReactNode
    className?: string
    image?: string
    overlay?: boolean
    excludeCdn?: boolean
}) {
    const { data: session } = useSession();
    const [cookies, setCookie] = useCookies(["bm_display", "bm_showbg"]);

    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

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
    
    // Check if we should be showing a background image.
    const [bgImage, setBgImage] = useState<string | undefined>(undefined);

    const [showBg, setShowBg] = useState(false);

    useEffect(() => {
        if (cookies["bm_showbg"] !== undefined && Boolean(cookies["bm_showbg"]))
            setShowBg(true);

        if (showBg && image) {
            if (excludeCdn)
                setBgImage(image);
            else
                setBgImage(cdn + image);
        } else if (bgImage)
            setBgImage(undefined);
    }, [cdn, image, showBg, bgImage, excludeCdn, cookies])

    // Google Analytics ID.
    const gId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

    // Settings menu.
    const [showSettings, setShowSettings] = useState(false);

    return (
        <ViewPortCtx.Provider value={{
            isMobile: isMobile,
            width: width,
            height: height
        }}>
            <main key="main" className={className}>
                {gId && (
                    <GoogleAnalytics 
                        id={gId}
                    />
                )}

                <Background
                    image={bgImage}
                    overlay={overlay}
                />

                <Header />

                <div className="fixed z-30 bottom-0 left-0 p-4 duration-300 bg-bestmods-3 flex flex-col justify-center items-center gap-2 group rounded-tr">
                    <button
                        className={showSettings ? "block" : "hidden"}
                        onClick={() => {
                            setShowBg(!showBg);
                            setCookie("bm_showbg", !showBg ? "1" : "0");
                        }}
                    >
                        <PhotoIcon className={`w-6 h-6 rounded-full stroke-white fill-none ${showBg ? "brightness-100" : "brightness-50"}`} />
                    </button>
                    <button
                        className={showSettings ? "block" : "hidden"}
                        onClick={async () => {
                            if (session?.user)
                                await signOut();
                            else
                                await signIn("discord");
                        }}
                    >
                        <UserIcon className="w-6 h-6 stroke-white fill-none" />
                    </button>
                    <div
                        onClick={() => {
                            setShowSettings(!showSettings);
                        }}
                    >
                        <GearIcon className="w-6 h-6 stroke-white fill-none" />
                    </div>
                </div>

                <div className="w-full px-2 sm:px-20 mx-auto py-2">
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
            </main>
        </ViewPortCtx.Provider>
    )
}