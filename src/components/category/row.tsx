import Link from "next/link";

const Row: React.FC<{
    cat: any,
    classes?: string[],
    include_mod_count?: boolean
}> = ({
    cat,
    classes,
    include_mod_count
}) => {
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";

    const name = cat.name;
    const view_url = "/category/" + cat.url;
    const icon = (cat.icon) ? cdn + cat.icon : "/images/default_icon.png";

    const mod_count = cat._count?.Mod ?? 0;

    let render_class = "category-row";

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