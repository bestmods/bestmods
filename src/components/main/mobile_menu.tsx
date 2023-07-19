import { useState } from "react";

import NavItems from "@components/main/header/nav_items";
import Filters from "@components/main/header/filters";

import HamburgerIcon from "@utils/icons/hamburger";
import LeftArrowIcon from "@utils/icons/left_arrow";

const MobileMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div id="mobile-menu" className={isOpen ? "mobile-menu-open" : ""}>
            <div className={isOpen ? "flex justify-end" : ""}>
                <button id="mobile-menu-toggle" onClick={() => {
                    if (isOpen)
                        setIsOpen(false);
                    else
                        setIsOpen(true);
                }}>
                    {isOpen ? (
                        <LeftArrowIcon />
                    ) : (
                        <HamburgerIcon />
                    )}
                </button>
            </div>
            <div className={`${isOpen ? "block" : "hidden"} p-4`}>
                <div className="text-white">
                    <NavItems
                        classes="mobile-menu-nav-items"
                    />
                </div>

                <Filters 
                    classes="!block"
                />
            </div>
        </div>
    );
}

export default MobileMenu;