import Link from "next/link";
import React, { type MouseEventHandler, useState } from "react";

import UpArrow from "@components/icons/up_arrow";
import DownArrow from "@components/icons/down_arrow";

export type Drop_Down_Menu_Type = {
    link: string
    html: JSX.Element
    new_tab: boolean
    className?: string
    onClick?: MouseEventHandler<HTMLAnchorElement>
    seperator?: boolean
    noLink?: boolean
}

export default function DropDown ({
    html,
    drop_down_items,
    className
} : {
    html: JSX.Element,
    drop_down_items: Drop_Down_Menu_Type[],
    className?: string
}) {
    // State for menu open or not.
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <button
            className={`${className ? `${className} `: ``}relative flex items-center rounded`}
            onClick={() => {
                setMenuOpen(!menuOpen);
            }}
        >
            <div className="flex gap-1 items-center">
                <span>{html}</span>

                {menuOpen ? (
                    <UpArrow className="w-4 h-4 stroke-white" />
                ) : (
                    <DownArrow className="w-4 h-4 stroke-white" />
                )}
            </div>
            <ul className={`${menuOpen ? `visible` : `hidden`} break-all absolute w-full sm:w-[300%] top-[100%] left-0 sm:left-[-200%] z-30 rounded-b p-2 bg-bestmods-2`}>
                {drop_down_items.map((item, index) => {
                    return (
                        <React.Fragment key={`navitem-${index.toString()}`}>
                            {item.seperator ? (
                                <li className={item.className}><hr /></li>
                            ) : (
                                <>
                                    {item.noLink ? (
                                        <li className={item.className}>{item.html}</li>
                                    ) : (
                                        <Link
                                            href={item.link}
                                            target={item.new_tab ? "_blank" : undefined}
                                            className={item.className}
                                            onClick={item.onClick}
                                        >
                                            <li className="py-5 px-2 hover:bg-bestmods-2 divide-y-2 divide-slate-800 hover:divide-cyan-700 flex items-center gap-2 text-sm">{item.html}</li>
                                        </Link>
                                    )}
                                </>
                            )}
                        </React.Fragment>
                    );
                })}
            </ul>
        </button>
    );
}