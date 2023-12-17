import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "@utils/trpc";

import "@styles/globals.css";
import { type Dispatch, type SetStateAction, createContext, useState } from "react";

type NotificationCtx = {
    title?: string,
    msg?: string,
    setTitle: Dispatch<SetStateAction<string | undefined>>,
    setMsg: Dispatch<SetStateAction<string | undefined>>
}

export const ErrorCtx = createContext<NotificationCtx | undefined>(undefined);
export const SuccessCtx = createContext<NotificationCtx | undefined>(undefined);

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const [successTitle, setSuccessTitle] = useState<string | undefined>(undefined);
    const [successMsg, setSuccessMsg] = useState<string | undefined>(undefined);
    
    return (
        <SessionProvider session={session}>
            <ErrorCtx.Provider value={{
                title: errorTitle,
                msg: errorMsg,
                setTitle: setErrorTitle,
                setMsg: setErrorMsg
            }}>
                <SuccessCtx.Provider value={{
                    title: successTitle,
                    msg: successMsg,
                    setTitle: setSuccessTitle,
                    setMsg: setSuccessMsg
                }}>
                    <Component {...pageProps} />
                </SuccessCtx.Provider>
            </ErrorCtx.Provider>
        </SessionProvider>
    );
};

export default trpc.withTRPC(MyApp);
