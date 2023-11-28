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

export default function Header () {
    return (
        <header className="flex gap-2 w-full bg-gray-900/90 p-2">
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
                <div className="flex gap-6 items-center">
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
                    <NavItem
                        url={"https://github.com/orgs/bestmods/discussions/categories/feedback-ideas"}
                        content={
                            <IconAndText
                                icon={<ChatBubbleIcon className="w-6 h-6 stroke-white" />}
                                text={<>Feedback</>}
                            />
                        }
                        external={true}
                    />
                    <NavItem
                        url={"https://github.com/bestmods/bestmods/milestones"}
                        content={
                            <IconAndText
                                icon={<MapIcon className="w-6 h-6 stroke-white" />}
                                text={<>Roadmap</>}
                            />
                        }
                        external={true}
                    />
                    <NavItem
                        url={"https://github.com/BestMods/bestmods"}
                        content={
                            <IconAndText
                                icon={<CodeIcon className="w-6 h-6 stroke-white" />}
                                text={<>Source Code</>}
                            />
                        }
                        external={true}
                    />
                    <NavItem
                        url={"https://github.com/orgs/bestmods/discussions/35"}
                        content={
                            <IconAndText
                                icon={<TrashIcon className="w-6 h-6 stroke-white" />}
                                text={<>Removals</>}
                            />
                        }
                        external={true}
                    />
                    <NavItem
                        url={"https://moddingcommunity.com/"}
                        content={
                            <IconAndText
                                icon={<UsersIcon className="w-6 h-6 stroke-white" />}
                                text={<>Community</>}
                            />
                        }
                        external={true}
                    />
                </div>
            </nav>
        </header>
    )
}