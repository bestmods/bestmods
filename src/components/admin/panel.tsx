import TabMenu, { type TabItem } from "@components/tabs/tab_menu"
import { type ReactNode } from "react"

export default function AdminPanel ({
    view = "overview",
    children
} : {
    view?: string
    children: ReactNode
}) {
    const tabItems: TabItem[] = [
        {
            name: "Overview",
            href: "/admin/",
            active: view == "overview"
        },
        {
            name: "Mods",
            href: "/admin/mod",
            active: view == "mod"
        },
        {
            name: "Categories",
            href: "/admin/category",
            active: view == "category"
        },
        {
            name: "Sources",
            href: "/admin/source",
            active: view == "source"
        },
        {
            name: "Redirects",
            href: "/admin/redirect",
            active: view == "redirect"
        },
        {
            name: "Users",
            href: "/admin/user",
            active: view == "user"
        },
        {
            name: "Reports",
            href: "/admin/report",
            active: view == "report"
        }
    ];

    return (
        <div className="w-full flex gap-2">
            <TabMenu items={tabItems}>
                {children}
            </TabMenu>
        </div>
    )
}