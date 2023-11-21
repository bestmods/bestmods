import Link from "next/link";
import { useState } from "react";

import UpArrow from "@components/icons/up_arrow";
import DownArrow from "@components/icons/down_arrow";

export type Drop_Down_Menu_Type = {
    link: string,
    html: JSX.Element,
    new_tab: boolean
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
        <button className={`utils-drop-down${className ? ` ${className}`: ``}`} onClick={() => {
            setMenuOpen(!menuOpen);
        }}>
            <div>
                <span>{html}</span>

                {menuOpen ? (
                    <UpArrow />
                ) : (
                    <DownArrow />
                )}
            </div>
            
            <ul className={menuOpen ? "block" : "hidden"}>
                {drop_down_items.map((item) => {
                    return (
                        <Link key={"dd_item-" + item.link} href={item.link} target={item.new_tab ? "_blank" : ""}>
                            <li>{item.html}</li>
                        </Link>
                    );
                })}
            </ul>
        </button>
    );
}