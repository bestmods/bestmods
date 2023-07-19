import Link from "next/link";
import { useState } from "react";

import UpArrow from "@utils/icons/up_arrow";
import DownArrow from "@utils/icons/down_arrow";

export type Drop_Down_Menu_Type = {
    link: string,
    html: JSX.Element,
    new_tab: boolean
}

const DropDown: React.FC<{
    html: JSX.Element,
    drop_down_items: Drop_Down_Menu_Type[],
    classes?: string[]
}> = ({
    html,
    drop_down_items,
    classes
}) => {
    // State for menu open or not.
    const [menuOpen, setMenuOpen] = useState(false);

    let dd_classes = "utils-drop-down";

    if (classes)
        dd_classes = dd_classes + " " + classes.join(" ");

    return (
        <button className={dd_classes} onClick={() => {
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

export default DropDown;