import { ViewPortCtx } from "@components/main"
import Link from "next/link"
import { useState, type ReactNode, useContext } from "react"
import { type ModViewItem } from "~/types/mod"

export default function ModTabs ({
    children,
    mod,
    view = "overview"
} : {
    children: ReactNode
    mod: ModViewItem
    view?: string
}) {
    // Links.
    const baseUrl = `/view/${mod.url}`;
    
    const installLink = `${baseUrl}/install`;
    const sourcesLink = `${baseUrl}/sources`;
    const downloadsLink = `${baseUrl}/downloads`;
    const creditsLink = `${baseUrl}/credits`;

    // View ports and mobile menu.
    const viewPort = useContext(ViewPortCtx);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-center">
            <div className="flex flex-col gap-2">
                <button
                    className={`sm:hidden px-10 py-4 text-center text-gray-200 ${mobileOpen ? "bg-bestmods-4/80 hover:bg-bestmods-5/80" : "bg-bestmods-3/80 hover:bg-bestmods-4/80"}`}
                    onClick={() => {
                        setMobileOpen(!mobileOpen);
                    }}
                >{mobileOpen ? "Hide Tabs" : "Show Tabs"}</button>
                {(!viewPort.isMobile || mobileOpen) && (
                    <>
                        <Tab
                            url={baseUrl}
                            text={<>Overview</>}
                            active={view == "overview"}
                        />
                        {mod.install && (
                            <Tab
                                url={installLink}
                                text={<>Installation</>}
                                active={view == "install"}
                            />
                        )}
                        {mod.ModSource.length > 0 && (
                            <Tab
                                url={sourcesLink}
                                text={<>Sources</>}
                                active={view == "sources"}
                            />
                        )}
                        {mod.ModDownload.length > 0 && (
                            <Tab
                                url={downloadsLink}
                                text={<>Downloads</>}
                                active={view == "downloads"}
                            />
                        )}
                        {mod.ModCredit.length > 0 && (
                            <Tab
                                url={creditsLink}
                                text={<>Credits</>}
                                active={view == "credits"}
                            />
                        )}
                    </>
                )}
                
            </div>
            <div className="grow">
                {children}
            </div>
        </div>
    )
}

function Tab({
    url,
    text,
    active = false,
} : {
    url: string
    text: JSX.Element
    active?: boolean
}) {
    return (
        <Link
            href={url}
            className={`px-10 py-4 bg-bestmods-3/80 hover:bg-bestmods-4/80 text-center text-gray-200 visited:text-gray-200 active:text-gray-200 hover:text-gray-200 rounded${active ? ` bg-bestmods-4/80 font-bold` : ``}`}
        >
            {text}
        </Link>
    )
}