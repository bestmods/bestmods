import { trpc } from "@utils/trpc";
import { useSession } from "next-auth/react";
import { type ModViewItem } from "~/types/mod"
import ModTabs from "./view/tabs";
import DropDown, { type Drop_Down_Menu_Type } from "@components/drop_down";
import ModRating from "./rating";
import ModViewOverview from "./view/overview";
import ModViewSources from "./view/sources";
import ModViewDownloads from "./view/downloads";
import ModViewInstall from "./view/install";
import ModViewCredits from "./view/credits";
import { HasPerm } from "@utils/permissions";
import Link from "next/link";
import { useContext, useState } from "react";
import ModViewCategory from "./view/category";
import { ErrorCtx, SuccessCtx } from "@pages/_app";
import ScrollToTop from "@utils/scroll";
import IconAndText from "@components/icon_and_text";
import ModGallery from "./view/gallery";

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

    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const [modVisibility, setModVisibility] = useState<boolean>(mod.visible);

    // Mutations.
    const mod_hide_mut = trpc.mod.setVisibility.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Unable To Hide Mod!");
                errorCtx.setMsg("An error occurred when trying to hide this mod. Check the console!");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Hid Mod!");
                successCtx.setMsg("Successfully hid this mod!");

                ScrollToTop();
            }
        }
    });

    const mod_del_mut = trpc.mod.del.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Unable To Delete Mod!");
                errorCtx.setMsg("An error occurred when trying to delete this mod. Check the console!");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Deleted Mod!");
                successCtx.setMsg("Successfully deleted this mod!");

                ScrollToTop();
            }
        }
    });

    // Generate installer drop-down items.
    const installer_items: Drop_Down_Menu_Type[] = [];
    
    mod.ModInstaller.map((ins) => {
        const name = ins.source.name;
        const url = ins.url;

        let icon = "/images/default_icon.png";

        if (ins.source.icon)
            icon = cdn + ins.source.icon;

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
    
    // Check rating.
    const onlyRating = ((mod.ModInstaller && mod.ModInstaller.length > 0) || (mod.ownerName && mod.ownerName.length > 0)) ? false : true;

    return (
        <div className="flex flex-col gap-2">
            <div>
                <ModGallery mod={mod} />
            </div>
            <div className="flex justify-center">
                <h1>{mod.name}</h1>
            </div>
            <ModTabs
                mod={mod}
                view={view}
            >
                <div className="flex flex-col p-4 gap-2 bg-bestmods-2/80 [overflow-wrap:anywhere]">
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
                            <div>
                                <DropDown
                                    html={<>Install</>}
                                    drop_down_items={installer_items}
                                    btnClassName="btn btn-secondary h-full"
                                />
                            </div>
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
                        {view == "credits" && (
                            <ModViewCredits mod={mod} />
                        )}
                    </div>
                    {session && HasPerm(session, "contributor") && (
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                className="btn btn-primary" 
                                href={editLink}
                            >Edit</Link>
                            <button 
                                className="btn btn-secondary"
                                onClick={(e) => {
                                    e.preventDefault();

                                    // Do opposite of our current value.
                                    mod_hide_mut.mutate({
                                        id: mod.id,
                                        visible: !modVisibility
                                    });

                                    setModVisibility(!modVisibility);
                                }}
                            >{modVisibility ? "Hide" : "Show"}</button>
                            <button
                                className="btn btn-danger"
                                onClick={(e) => {
                                    e.preventDefault();

                                    // Delete mod after confirmation.
                                    if (confirm("Are you sure you want to delete this mod?")) {
                                        mod_del_mut.mutate({
                                            id: mod.id
                                        });
                                    }
                                }}
                            >Delete</button>
                    </div>
                    )}
                </div>
            </ModTabs>
        </div>
    )
}