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
import { useContext, useState } from "react";
import { ViewPortCtx } from "./main";
import HamburgerIcon from "./icons/hamburger";
import LeftArrowIcon from "./icons/left_arrow";
import HomeIcon from "./icons/home";
import SteamIcon from "./icons/steam";

export default function Header () {
    const router = useRouter();

    const cur = router.asPath;

    const viewPort = useContext(ViewPortCtx);

    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="w-full bg-bestmods-3/80">
            {viewPort.isMobile ? (
                <nav>
                    <button
                        className=""
                        onClick={() => {
                            setMobileOpen(!mobileOpen);
                        }}
                    >
                        <HamburgerIcon className="w-6 h-6 stroke-white" />
                    </button>
                    <div className={`${mobileOpen ? "block" : "hidden"} fixed z-30 top-0 left-0 w-1/2 bg-bestmods-2 flex justify-between overflow-y-scroll p-4`}>
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
            ) : (
                <nav className="container mx-auto flex items-center gap-4">
                    <Link href="/">
                        <h1 className="flex gap-2">
                            <span>
                                <span className="text-blue-400">B</span>est
                            </span>
                            <span>
                                <span className="text-blue-400">M</span>ods
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
            )}
            
        </header>
    )
}