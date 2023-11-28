import Link from "next/link"

export type DropdownItem = {
    content: JSX.Element
    url: string
    separator?: boolean
}

export default function NavItem ({
    content,
    url,
    className = "header-nav-item",
    external = false,
    dropdown_items = []
} : {
    content: JSX.Element
    url: string
    className?: string
    external?: boolean
    dropdown_items?: DropdownItem[]
}) {
    return (
        <Link
            href={url}
            target={external ? "_blank" : undefined}
            className={className}
        >
            {content}
        </Link>
    )
}