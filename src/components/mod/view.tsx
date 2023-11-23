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
    const editLink = "/admin/add/mod/" + mod.url;

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

    // Generate category icons and links.
    const defaultIcon = "/images/default_icon.png";

    const catIcon = (mod.category && mod.category.icon) ? cdn + mod.category.icon : cdn + defaultIcon;
    const catParIcon = (mod.category && mod.category.parent && mod.category.parent.icon) ? cdn + mod.category.parent.icon : cdn + defaultIcon;

    const catParLink = (mod.category && mod.category.parent) ? "/category/" + mod.category.parent.url : null;
    const catLink = ((mod.category) ? "/category" + ((mod.category.parent) ? "/" + mod.category.parent.url : "") + "/" + mod.category.url : null);

    return (
        <div>
            <div>
                <Image
                    src={banner}
                    width={720}
                    height={360}
                    alt="Mod Banner"
                />
            </div>

            <h1>{mod.name}</h1>

            {mod.category && (
                <div>
                    {mod.category.parent ? (
                        <>
                            <a href={catParLink ?? "/category"}>
                                <Image
                                    src={catParIcon}
                                    width={32}
                                    height={32}
                                    alt="Category Icon"
                                />
                                <span>{mod.category.parent.name ?? "Category"}</span>
                            </a>
                            <span> → </span>
                            <a href={catLink ?? "/category"}>
                                <Image
                                    src={catIcon}
                                    width={32}
                                    height={32}
                                    alt="Category Icon"
                                />
                                <span>{mod.category.name ?? "Category"}</span>
                            </a>
                        </>
                    ) : (
                        <>
                            <a href={catLink ?? "/category"}>
                                <Image
                                    src={catIcon}
                                    width={32}
                                    height={32}
                                    alt="Category Icon" 
                                />
                                <span>{mod.category.name ?? "Category"}</span>
                            </a>
                        </>
                    )}
                </div>
            )}

            <ModTabs
                mod={mod}
                view={view}
            >
                <div className="flex flex-col p-2 gap-2">
                    <div className={`flex flex-wrap gap-2 ${onlyRating ? "justify-end" : "justify-between"}`}>
                        {mod.ownerName && mod.ownerName.length > 0 && (
                            <div id="mod-owner">
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
                        <div className="">
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