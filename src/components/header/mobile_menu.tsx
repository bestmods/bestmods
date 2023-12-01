import { useState } from "react";

import HamburgerIcon from "@components/icons/hamburger";
import LeftArrowIcon from "@components/icons/left_arrow";

export default function MobileMenu () {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
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

                </div>
            </div>
        </div>
    )
}