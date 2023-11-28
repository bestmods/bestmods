import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import { type ModViewItem } from "~/types/mod"
import ModTabs from "./view/tabs";
import DropDown, { type Drop_Down_Menu_Type } from "@components/drop_down";
import ModRating from "./rating/render";
import ModViewOverview from "./view/overview";
import ModViewSources from "./view/sources";
import ModViewDownloads from "./view/downloads";
import ModViewInstall from "./view/install";
import ModViewCredits from "./view/credits";
import { Has_Perm } from "@utils/permissions";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import ModViewCategory from "./view/category";

export default function ModView ({
    mod,
    view = "overview",
    rating = 1
} : {
    mod: ModViewItem,
    view?: string
    rating?: number
}) {
    // Session.
    const { data: session } = useSession();

    // Links.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    const editLink = `/admin/mod/edit/${mod.id.toString()}`;

    // Banner.
    let banner = cdn + "/images/default_mod_banner.png"

    if (mod.banner)
        banner = cdn + mod.banner;

    const [modVisibility, setModVisibility] = useState<boolean>(mod.visible);

    // Mutations.
    const mod_hide_mut = trpc.mod.setVisibility.useMutation();
    const mod_del_mut = trpc.mod.del.useMutation();

    // Generate installer drop-down items.
    const installer_items: Drop_Down_Menu_Type[] = [];
    
    mod.ModInstaller.map((ins) => {
        const name = ins.source.name;
        const url = ins.url;

        let icon = ins.source.icon ?? undefined;

        if (icon)
            icon = cdn + icon;

        const html = <>
            {icon && (
                <Image
                    src={icon}
                    width={32}
                    height={32}
                    alt="Icon"
                />
            )}

            {name}
        </>;

        installer_items.push({
            link: url,
            html: html,
            new_tab: false
        });
    });
    // Check rating.
    const onlyRating = ((mod.ModInstaller && mod.ModInstaller.length > 0) || (mod.ownerName && mod.ownerName.length > 0)) ? false : true;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-center">
                <Image
                    src={banner}
                    width={720}
                    height={360}
                    alt="Mod Banner"
                />
            </div>

            <div className="flex justify-center">
                <h1>{mod.name}</h1>
            </div>

            <ModTabs
                mod={mod}
                view={view}
            >
                <div className="flex flex-col p-4 gap-2 bg-gray-800/80">
                    <div className={`flex flex-wrap gap-2 ${onlyRating ? "justify-end" : "justify-between"}`}>
                        {mod.ownerName && mod.ownerName.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {mod.category && (
                                    <ModViewCategory
                                        cat={mod.category}
                                        catPar={mod.category?.parent}
                                    />
                                )}
                                <p>Maintained By <span className="font-bold">{mod.ownerName}</span></p>
                            </div>
                        )}
                        {installer_items.length > 0 && (
                                <DropDown
                                    html={<>Install</>}
                                    drop_down_items={installer_items}
                                    className={"mod-view-installer"}
                                />
                        )}
                        <div className="relative flex justify-center">
                            <ModRating
                                mod={mod}
                                rating={rating}
                            />
                        </div>
                    </div>
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
                        {view == "crediits" && (
                            <ModViewCredits mod={mod} />
                        )}
                    </div>
                    {session && Has_Perm(session, "contributor") && (
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                className="btn btn-primary" 
                                href={editLink}
                            >Edit</Link>
                            <Link 
                                className="btn btn-secondary"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();

                                    // Do opposite of our current value.
                                    mod_hide_mut.mutate({
                                        id: mod.id,
                                        visible: !modVisibility
                                    });

                                    setModVisibility(!modVisibility);
                                }}
                            >{modVisibility ? "Hide" : "Show"}</Link>
                            <Link
                                className="btn btn-danger"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();

                                    // Delete mod after confirmation.
                                    if (confirm("Are you sure you want to delete this mod?")) {
                                        mod_del_mut.mutate({
                                            id: mod.id
                                        });
                                    }
                                }}
                            >Delete</Link>
                    </div>
                    )}
                </div>
            </ModTabs>
        </div>
    )
}