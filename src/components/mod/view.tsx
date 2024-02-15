import { type ModViewItem } from "~/types/mod"
import DropDown, { type Drop_Down_Menu_Type } from "@components/drop_down";
import ModRating from "./rating";
import ModViewOverview from "./view/overview";
import ModViewSources from "./view/sources";
import ModViewDownloads from "./view/downloads";
import ModViewInstall from "./view/install";
import ModViewCredits from "./view/credits";
import ModViewCategory from "./view/category";
import IconAndText from "@components/icon_and_text";
import ModGallery from "./view/gallery";
import ModActions from "./modactions";
import ModDebug from "./mod_debug";
import TabMenu, { type TabItem } from "@components/tabs/tab_menu";
import { GetModUrl } from "@utils/mod";
import ModReportButton from "./report_button";
import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { GetSourceIcon } from "@utils/source";
import EyeIcon from "@components/icons/eye";
import DownloadIcon from "@components/icons/download";
import UserIcon from "@components/icons/user";
import CalenderIcon from "@components/icons/calender";

export default function ModView ({
    mod,
    view = "overview",
    rating = 1
} : {
    mod: ModViewItem,
    view?: string
    rating?: number
}) {
    // Get session.
    const { data: session } = useSession();

    // Links.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    // Generate installer drop-down items.
    const installer_items: Drop_Down_Menu_Type[] = [];
    
    mod.ModInstaller.map((ins) => {
        const name = ins.source.name;
        const url = ins.url;

        const icon = GetSourceIcon(ins.source, cdn);

        installer_items.push({
            link: url,
            html:
                <IconAndText
                    icon={icon}
                    width={20}
                    height={20}
                    text={<span>{name}</span>}
                />,
            className: "font-normal hover:text-white",
            new_tab: false
        });
    });

    // Get mod base URL.
    const baseUrl = GetModUrl(mod);

    // Generate tabs.
    const tabItems: TabItem[] = [
        {
            name: "Overview",
            href: baseUrl,
            active: view == "overview"
        },
        ...(mod.install ? [
            {
                name: "Installation",
                href: `${baseUrl}/install`,
                active: view == "install"
            }
        ] : []),
        ...(mod.ModSource.length > 0 ? [
            {
                name: "Sources",
                href: `${baseUrl}/sources`,
                active: view == "sources"
            }
        ] : []),
        ...(mod.ModDownload.length > 0 ? [
            {
                name: "Downloads",
                href: `${baseUrl}/downloads`,
                active: view == "downloads"
            }
        ] : []),
        ...(mod.ModCredit.length > 0 ? [
            {
                name: "Credits",
                href: `${baseUrl}/credits`,
                active: view == "credits"
            }
        ] : [])
    ];

    // Increment total views.
    const incTotalViewsMut = trpc.mod.incTotalViews.useMutation();
    const incView = useRef(true);

    useEffect(() => {
        if (view !== "overview" || !incView.current)
            return;

        incTotalViewsMut.mutate({
            id: mod.id
        })

        incView.current = false;
    }, [view, incView, incTotalViewsMut, mod.id])

    // Add unique view if necessary.
    const addUniqueViewMut = trpc.mod.addUniqueView.useMutation();
    const uniqueView = useRef(true);

    useEffect(() => {
        if (!session?.user || !uniqueView.current)
            return;

        addUniqueViewMut.mutate({
            id: mod.id
        })

        uniqueView.current = false;
    }, [session, uniqueView, addUniqueViewMut, mod.id])

    // Parse dates.
    const [createdAtStr, setCreatedAtStr] = useState("N/A");
    const [updatedAtStr, setUpdatedAtStr] = useState("N/A");

    useEffect(() => {
        const dateOptions: Intl.DateTimeFormatOptions = {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
          };

          const formatter = new Intl.DateTimeFormat('en-US', dateOptions);

        if (mod.createAt) {
            const fDate = formatter.format(new Date(mod.createAt))

            setCreatedAtStr(fDate);
        }

        if (mod.editAt) {
            const fDate = formatter.format(new Date(mod.editAt))

            setUpdatedAtStr(fDate);
        }
    }, [mod.createAt, mod.editAt])

    return (
        <div className="flex flex-col gap-2">
            <div>
                <ModGallery mod={mod} />
            </div>
            <div className="py-2">
                {mod.category && (
                    <ModViewCategory
                        cat={mod.category}
                        catPar={mod.category?.parent}
                    />
                )}
            </div>
            <div className="bg-bestmods-2/60 p-6 rounded text-white">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center flex-col sm:flex-row flex-wrap gap-4 justify-center md:justify-between">
                        <div className="flex flex-col justify-center">
                            <h2 className="text-xl">{mod.name}</h2>
                        </div>
                        <div className="flex items-center flex-col sm:flex-row flex-wrap gap-2 justify-center">
                            <div className="relative flex justify-center">
                                <ModRating
                                    mod={mod}
                                    rating={rating}
                                />
                            </div>
                            {installer_items.length > 0 && (
                                <div className="flex flex-col justify-center">
                                    <DropDown
                                        html={<>Install</>}
                                        drop_down_items={installer_items}
                                        btnClassName="btn btn-secondary h-full"
                                    />
                                </div>
                            )}
                            <div className="flex flex-col justify-center">
                                <ModReportButton modId={mod.id} />
                            </div>
                            {mod.nsfw && (
                                <div className="btn btn-warning">NSFW</div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap flex-col sm:flex-row gap-4 justify-between">
                        <DataItem
                            title={
                                <IconAndText
                                    icon={
                                        <CalenderIcon className="w-4 h-4 fill-white" />
                                    }
                                    text={<>Created On</>}
                                />
                            }
                        >
                            <span>{createdAtStr}</span>
                        </DataItem>
                        <DataItem
                            title={
                                <IconAndText
                                    icon={
                                        <CalenderIcon className="w-4 h-4 fill-white" />
                                    }
                                    text={<>Updated On</>}
                                />
                            }
                        >
                            <span>{updatedAtStr}</span>
                        </DataItem>
                        <DataItem
                            title={
                                <IconAndText
                                    icon={
                                        <EyeIcon className="w-4 h-4 stroke-white" />
                                    }
                                    text={<>Total Views</>}
                                />
                            }
                        >
                            <span>{mod.totalViews.toString()}</span>
                        </DataItem>
                        <DataItem
                            title={
                                <IconAndText
                                    icon={
                                        <DownloadIcon className="w-4 h-4 stroke-white" />
                                    }
                                    text={<>Total Downloads</>}
                                />
                            }
                        >
                            <span>{mod.totalDownloads.toString()}</span>
                        </DataItem>
                        {mod.ownerName && (
                            <DataItem
                                title={
                                    <IconAndText
                                        icon={
                                            <UserIcon className="w-4 h-4 fill-white" />
                                        }
                                        text={<>Maintainer</>}
                                    />
                                }
                            >
                                <span>{mod.ownerName}</span>
                            </DataItem>
                        )}
                    </div>
                </div>
            </div>
            <TabMenu items={tabItems}>
                <div className="[overflow-wrap:anywhere]">
                    <div>
                        {view == "overview" && (
                            <ModViewOverview mod={mod} />
                        )}
                        {view == "sources" && (
                            <ModViewSources mod={mod} />
                        )}
                        {view == "downloads" && (
                            <ModViewDownloads mod={mod} />
                        )}
                        {view == "install" && (
                            <ModViewInstall mod={mod} />
                        )}
                        {view == "credits" && (
                            <ModViewCredits mod={mod} />
                        )}
                    </div>
                    <ModActions mod={mod} />
                    <ModDebug mod={mod} />
                </div>
            </TabMenu>
        </div>
    )
}

function DataItem({
    title,
    children
} : {
    title: JSX.Element
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col">
            <div className="text-sm">
                {title}
            </div>
            <div className="text-base">
                {children}
            </div>
        </div>
    )
}