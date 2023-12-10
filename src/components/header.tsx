import Link from "next/link";
import IconAndText from "./icon_and_text";
import Squares2x2Icon from "./icons/ squares2x2";
import NavItem from "./header/nav_item";
import ChatBubbleIcon from "./icons/chat_bubble";
import MapIcon from "./icons/map";
import CodeIcon from "./icons/code";
import TrashIcon from "./icons/trash";
import UsersIcon from "./icons/users";
import MagnifyingGlassIcon from "./icons/browse";
import DropDown from "./drop_down";
import TwitterIcon from "./icons/twitter";
import FacebookIcon from "./icons/facebook";
import InstagramIcon from "./icons/instagram";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import HamburgerIcon from "./icons/hamburger";
import LeftArrowIcon from "./icons/left_arrow";
import HomeIcon from "./icons/home";
import SteamIcon from "./icons/steam";
import InfoIcon from "./icons/info";

export default function Header () {
    const router = useRouter();

    const cur = router.asPath;

    // Figure out if this is our first render.
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current)
            firstRender.current = false;
    }, [])

    const isFirstRender = firstRender.current;

    const [mobileOpen, setMobileOpen] = useState(false);
    const mobileMenu = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const ele = mobileMenu.current;

        if (!ele)
            return;

        if (mobileOpen) {
            ele.classList.remove("hidden");
            ele.classList.remove("animate-menu-right-to-left");

            ele.classList.add("flex");
            ele.classList.add("animate-menu-left-to-right");
        } else if (!isFirstRender) {
            ele.classList.remove("animate-menu-left-to-right");
            ele.classList.add("animate-menu-right-to-left");
        }

        const onAnimateEnd = (e: AnimationEvent) => {
            if (e.animationName == "menu-right-to-left") {
                ele.classList.remove("flex");
                ele.classList.add("hidden");
            }
        }

        ele.addEventListener("animationend", onAnimateEnd, {
            once: true
        });

        return () => {
            ele.removeEventListener("animationend", onAnimateEnd);
        }
    }, [mobileOpen])

    // Handle stickied transparency of menu.
    const [isSticked, setIsSticked] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleScroll = () => {
                setIsSticked(window.scrollY > 0 ? true : false);
            }

            window.addEventListener("scroll", handleScroll)

            return () => {
                window.removeEventListener("scroll", handleScroll);
            }
        }
    }, [])

    return (
        <header className={`w-full ${isSticked ? "bg-bestmods-3" : "bg-bestmods-3/80"} sticky top-0 z-30`}>
            <nav className="block sm:hidden">
                <button
                    onClick={() => {
                        setMobileOpen(!mobileOpen);
                    }}
                >
                    <HamburgerIcon className="w-6 h-6 stroke-white" />
                </button>
                <div ref={mobileMenu} className={`hidden fixed z-50 top-0 left-0 w-1/2 h-full bg-bestmods-2 justify-between overflow-scroll p-6`}>
                    <div className="grow flex flex-col gap-4">
                        <Link
                            href="/"
                        >
                            <IconAndText
                                icon={<HomeIcon className="w-6 h-6 stroke-white" />}
                                text={<>Home</>}
                            />
                        </Link>
                        <Link
                            href="/browse"
                        >
                            <IconAndText
                                icon={<MagnifyingGlassIcon className="w-6 h-6 stroke-white" />}
                                text={<>Browse</>}
                            />
                        </Link>
                        <Link
                            href="/category"
                        >
                            <IconAndText
                                icon={<Squares2x2Icon className="w-6 h-6 stroke-white" />}
                                text={<>Categories</>}
                            />
                        </Link>
                        <Link
                            href="/about"
                        >
                            <IconAndText
                                icon={<InfoIcon className="w-6 h-6 stroke-white fill-none" />}
                                text={<>About</>}
                            />
                        </Link>
                        <h3>Socials</h3>
                        <Link
                            href="https://instagram.com/bestmodsio"
                            target="_blank"
                        >
                            <IconAndText
                                icon={<InstagramIcon className="w-6 h-6 fill-white" />}
                                text={<>Instagram</>}
                            />
                        </Link>
                        <Link
                            href="https://twitter.com/bestmodsio"
                            target="_blank"
                        >
                            <IconAndText
                                icon={<TwitterIcon className="w-6 h-6 fill-white" />}
                                text={<>Twitter/X</>}
                            />
                        </Link>
                        <Link
                            href="https://steamcommunity.com/groups/best-mods"
                            target="_blank"
                        >
                            <IconAndText
                                icon={<SteamIcon className="w-6 h-6 fill-white" />}
                                text={<>Steam</>}
                            />
                        </Link>
                        <Link
                            href="https://facebook.com/bestmodsio"
                            target="_blank"
                        >
                            <IconAndText
                                icon={<FacebookIcon className="w-6 h-6 fill-white" />}
                                text={<>Facebook</>}
                            />
                        </Link>
                        <h3>More</h3>
                        <Link
                            href="https://github.com/orgs/bestmods/discussions/categories/feedback-idea"
                            target="_blank"
                        >
                            <IconAndText
                                icon={<ChatBubbleIcon className="w-6 h-6 stroke-white" />}
                                text={<>Feedback</>}
                            />
                        </Link>
                        <Link
                            href="https://github.com/bestmods/bestmods/milestones"
                            target="_blank"
                        >
                            <IconAndText
                                icon={<MapIcon className="w-6 h-6 stroke-white" />}
                                text={<>Roadmap</>}
                            />
                        </Link>
                        <Link
                            href="https://github.com/BestMods/bestmods"
                            target="_blank"
                        >
                            <IconAndText
                                icon={<CodeIcon className="w-6 h-6 stroke-white" />}
                                text={<>Source Code</>}
                            />
                        </Link>
                        <Link
                            href="https://github.com/orgs/bestmods/discussions/35"
                            target="_blank"
                        >
                            <IconAndText
                                icon={<TrashIcon className="w-6 h-6 stroke-white" />}
                                text={<>Removals</>}
                            />
                        </Link>
                        <Link
                            href="https://moddingcommunity.com"
                            target="_blank"
                        >
                            <IconAndText
                                icon={<UsersIcon className="w-6 h-6 stroke-white" />}
                                text={<>Community</>}
                            />
                        </Link>
                    </div>
                    <div>
                        <button
                            onClick={() => {
                                setMobileOpen(!mobileOpen);
                            }}
                        >
                            <LeftArrowIcon className="w-6 h-6 stroke-white" />
                        </button>
                    </div>
                </div>
            </nav>
            <nav className="hidden sm:flex container mx-auto items-center sm:gap-1 md:gap-4">
                <Link href="/">
                    <h1 className="sm:text-2xl md:text-4xl flex gap-2">
                        <span>
                            <span className="text-blue-300">B</span>est
                        </span>
                        <span>
                            <span className="text-blue-300">M</span>ods
                        </span>
                    </h1>
                </Link>
                <NavItem
                    url={"/browse"}
                    content={
                        <IconAndText
                            icon={<MagnifyingGlassIcon className="w-6 h-6 stroke-white" />}
                            text={<>Browse</>}
                        />
                    }
                    active={cur == "/browse"}
                />
                <NavItem
                    url={"/category"}
                    content={
                        <IconAndText
                            icon={<Squares2x2Icon className="w-6 h-6 stroke-white" />}
                            text={<>Categories</>}
                        />
                    }
                    active={cur == "/category"}
                />
                <NavItem
                    url={"/about"}
                    content={
                        <IconAndText
                            icon={<InfoIcon className="w-6 h-6 stroke-white fill-none" />}
                            text={<>About</>}
                        />
                    }
                    active={cur == "/about"}
                />
                <DropDown
                    html={<>Socials</>}
                    drop_down_items={[
                        {
                            link: "https://instagram.com/bestmodsio",
                            html:
                                <IconAndText
                                    icon={<InstagramIcon className="w-6 h-6 fill-white" />}
                                    text={<>Instagram</>}
                                />
                            ,
                            new_tab: true
                        },
                        {
                            link: "https://twitter.com/bestmodsio",
                            html:
                                <IconAndText
                                    icon={<TwitterIcon className="w-6 h-6 fill-white" />}
                                    text={<>Twitter/X</>}
                                />
                            ,
                            new_tab: true
                        },
                        {
                            link: "https://steamcommunity.com/groups/best-mods",
                            html:
                                <IconAndText
                                    icon={<SteamIcon className="w-6 h-6 fill-white" />}
                                    text={<>Steam</>}
                                />
                            ,
                            new_tab: true
                        },
                        {
                            link: "https://facebook.com/bestmodsio",
                            html:
                                <IconAndText
                                    icon={<FacebookIcon className="w-6 h-6 fill-white" />}
                                    text={<>Facebook</>}
                                />
                            ,
                            new_tab: true
                        }
                    ]}
                />
                <DropDown
                    html={<>More</>}
                    drop_down_items={[
                        {
                            link: "https://github.com/orgs/bestmods/discussions/categories/feedback-idea",
                            html:
                                <IconAndText
                                    icon={<ChatBubbleIcon className="w-6 h-6 stroke-white" />}
                                    text={<>Feedback</>}
                                />
                            ,
                            new_tab: true
                        },
                        {
                            link: "https://github.com/bestmods/bestmods/milestones",
                            html:
                                <IconAndText
                                    icon={<MapIcon className="w-6 h-6 stroke-white" />}
                                    text={<>Roadmap</>}
                                />
                            ,
                            new_tab: true
                        },
                        {
                            link: "https://github.com/BestMods/bestmods",
                            html:
                                <IconAndText
                                    icon={<CodeIcon className="w-6 h-6 stroke-white" />}
                                    text={<>Source Code</>}
                                />
                            ,
                            new_tab: true
                        },
                        {
                            link: "https://github.com/orgs/bestmods/discussions/35",
                            html:
                                <IconAndText
                                    icon={<TrashIcon className="w-6 h-6 stroke-white" />}
                                    text={<>Removals</>}
                                />
                            ,
                            new_tab: true
                        },
                        {
                            link: "https://moddingcommunity.com/",
                            html:
                                <IconAndText
                                    icon={<UsersIcon className="w-6 h-6 stroke-white" />}
                                    text={<>Community</>}
                                />
                            ,
                            new_tab: true
                        }
                    ]}
                />
            </nav>            
        </header>
    )
}