import { useState } from "react";
import NavItems from "./header/nav_items";
import Filters from "./header/filters";

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
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M11.7071 5.29289C12.0976 5.68342 12.0976 6.31658 11.7071 6.70711L7.41421 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H7.41421L11.7071 17.2929C12.0976 17.6834 12.0976 18.3166 11.7071 18.7071C11.3166 19.0976 10.6834 19.0976 10.2929 18.7071L4.29289 12.7071C3.90237 12.3166 3.90237 11.6834 4.29289 11.2929L10.2929 5.29289C10.6834 4.90237 11.3166 4.90237 11.7071 5.29289Z" fill="#FFFFFF" /></svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11066)"><path d="M3 6.00092H21M3 12.0009H21M3 18.0009H21" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></g><defs><clipPath id="clip0_429_11066"><rect width="24" height="24" fill="white" transform="translate(0 0.000915527)" /></clipPath></defs></svg>
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