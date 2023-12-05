import DropDown, { type Drop_Down_Menu_Type } from "@components/drop_down"
import Link from "next/link"

export default function NavItem ({
    content,
    url,
    external = false,
    dropdown_items = [],
    active = false
} : {
    content: JSX.Element
    url: string
    external?: boolean
    dropdown_items?: Drop_Down_Menu_Type[]
    active?: boolean
}) {
    return (
        <>
            {dropdown_items.length > 0 ? (
                <DropDown
                    html={content}
                    drop_down_items={dropdown_items}
                />
            ) : (
                <Link
                    href={url}
                    target={external ? "_blank" : undefined}
                    className={`header-nav-item hover:text-white ${active ? `text-white` : `text-gray-200`}`}
                >{content}</Link>
            )}
        </>
    )
}