import { type ModViewItem } from "~/types/mod"
import ModTabs from "./view/tabs";
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

export default function ModView ({
    mod,
    view = "overview",
    rating = 1
} : {
    mod: ModViewItem,
    view?: string
    rating?: number
}) {
    // Links.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

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
                    <ModActions mod={mod} />
                    <ModDebug mod={mod} />
                </div>
            </ModTabs>
        </div>
    )
}