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
        <div className="relative inline-block">
            <button
                className={`${className ? `${className} `: ``}inline-flex gap-1 items-center`}
                onClick={() => {
                    setMenuOpen(!menuOpen);
                }}
            >
                <span>{html}</span>

                {menuOpen ? (
                    <UpArrow className="w-4 h-4 stroke-white" />
                ) : (
                    <DownArrow className="w-4 h-4 stroke-white" />
                )}
            </button>
            {menuOpen && (
                <div className={`origin-top-right break-all absolute right-0 mt-2 w-44 min-w-full top-[100%] z-30 rounded-b p-2 bg-bestmods-3`}>
                    <ul role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
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
                                                    className={`${item.className} hover:text-inherit`}
                                                    onClick={item.onClick}
                                                >
                                                    <li className="py-5 px-2 divide-y-2 divide-slate-800 hover:divide-cyan-700 flex items-center gap-2 text-sm">{item.html}</li>
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </ul>
                </div>
            )}
            
        </div>
    );
}