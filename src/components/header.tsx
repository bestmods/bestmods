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
import DropDown, { Drop_Down_Menu_Type } from "./drop_down";
import TwitterIcon from "./icons/twitter";
import FacebookIcon from "./icons/facebook";
import InstagramIcon from "./icons/instagram";

export default function Header () {
    return (
        <header className="w-full bg-bestmods-3/80">
            <nav className="container mx-auto flex items-center gap-8">
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
                />
                <NavItem
                    url={"/category"}
                    content={
                        <IconAndText
                            icon={<Squares2x2Icon className="w-6 h-6 stroke-white" />}
                            text={<>Categories</>}
                        />
                    }
                />
                <DropDown
                    html={<>Social</>}
                    drop_down_items={[
                        {
                            link: "https://twitter.com/bestmodsio",
                            html:
                                <IconAndText
                                    icon={<TwitterIcon className="w-6 h-6 fill-white" />}
                                    text={<>Twitter</>}
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
                        },
                        {
                            link: "https://instagram.com/bestmodsio",
                            html:
                                <IconAndText
                                    icon={<InstagramIcon className="w-6 h-6 fill-white" />}
                                    text={<>Instagram</>}
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