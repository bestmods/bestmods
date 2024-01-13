import { type Category } from "@prisma/client";
import { type CategoryWithChildrenAndCounts, type CategoryWithCount, type CategoryWithParent } from "~/types/category";

export function GetCategoryUrl(category: CategoryWithParent | CategoryWithCount | CategoryWithChildrenAndCounts | Category) {
    let url = "/";

    if ("parent" in category) {
        if (category.parent?.url)
            url += `${category.parent.url}/`;
    }

    url += category.url;

    return url;
}