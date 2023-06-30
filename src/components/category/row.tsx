import Link from "next/link";

const Row: React.FC<{
    parent?: any,
    cat: any,
    classes?: string[],
    include_mod_count?: boolean
}> = ({
    parent,
    cat,
    classes,
    include_mod_count
}) => {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    const name = cat.name;
    let view_url = "/category/";

    const icon = (cat.icon) ? cdn + cat.icon : "/images/default_icon.png";

    const mod_count = cat._count?.Mod ?? 0;

    let render_class = "category-row";

    if (parent)
        view_url += parent.url + "/";

    view_url += cat.url;

    if (classes)
        render_class = render_class + " " + classes.join(" ");

    return (
        <div className={render_class}>
            <Link href={view_url}>
                <img src={icon} alt="Category icon" />
                <span>
                    {name}

                    {include_mod_count && (
                        <span>
                            {" "}({mod_count})
                        </span>
                    )}
                </span>
            </Link>
        </div>
    );
}

export default Row;