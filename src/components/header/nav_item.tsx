import DropDown, { type Drop_Down_Menu_Type } from "@components/drop_down"
import Link from "next/link"

export default function NavItem ({
    content,
    url,
    external = false,
    dropdown_items = []
} : {
    content: JSX.Element
    url: string
    external?: boolean
    dropdown_items?: Drop_Down_Menu_Type[]
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
                    className="header-nav-item text-gray-200 hover:text-white"
                >{content}</Link>
            )}
            
        </>
    )
}