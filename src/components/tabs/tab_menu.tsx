import Link from "next/link"
import { type ReactNode } from "react"

export type TabItem = {
    name: string
    href: string
    active?: boolean
    className?: string
}

export default function TabMenu ({
    items,
    children
} : {
    items: TabItem[]
    children: ReactNode
}) {
    return (
        <div className="w-full flex gap-2">
            <ul className="flex flex-col gap-2">
                {items.map((item, index) => {
                    return (
                        <TabItem
                            key={`tab-${index.toString()}`}
                            item={item}
                        />
                    )
                })}
            </ul>
            <div className="grow bg-bestmods-2/80 p-6 rounded">
                {children}
            </div>
        </div>  
    )
}

export function TabItem ({
    item
} : {
    item: TabItem
}) {
    const { name, href, active, className } = item;

    return (
        <Link
            href={href}
            className={`text-center duration-150 p-4 px-8 rounded text-gray-200 hover:text-white ${active ? "bg-bestmods-4/80 font-bold" : "bg-bestmods-3/80"} hover:bg-bestmods-4/80${className ? ` ${className}` : ``}`}
        >
            <li>
                {name}
            </li>
        </Link>
    )
}