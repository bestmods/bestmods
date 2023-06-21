import Head from "next/head";

type HeadArgs = {
    title?: string | null
    description?: string | null
    robots?: string | null
    image?: string | null
    webtype?: string | null
    ptime?: string | null
    mtime?: string | null
    etime?: string | null
    author?: string | null
    section?: string | null
    tags?: string | null,
    excludeCdn?: boolean
}

const HeadInfo: React.FC<HeadArgs> = ({
    title = "Best Mods - Discover The Top Mods On The Internet!",
    description = "Browse the best mods in gaming from many sources on the Internet! Project ran by The Modding Community!",
    robots = "index, follow",
    image = "/images/bestmods-filled.png",
    webtype = "website",
    ptime = "",
    mtime = "",
    etime = "",
    author = "Best Mods",
    section = "Technology",
    tags = "mod",
    excludeCdn = false }) => {
    // Check if we must prepend CDN URL.
    if (process.env.NEXT_PUBLIC_CDN_URL && !excludeCdn)
        image = process.env.NEXT_PUBLIC_CDN_URL + image;

    // Retrieve URLs.
    let base_url;
    let full_url;

    if (typeof window !== "undefined") {
        base_url = window.location.protocol + "//" + window.location.host;
        full_url = base_url + window.location.pathname;
    }

    let article_info;

    if (webtype == "article") {
        article_info = <>
            {ptime != null && (
                <meta key="meta_apt" property="article:published_time" content={ptime} />
            )}

            {mtime != null && (
                <meta key="meta_amt" property="article:modified_time" content={mtime} />
            )}

            {etime != null && (
                <meta key="meta_aet" property="article:expiration_time" content={etime} />
            )}

            {author != null && (
                <meta key="meta_aa" property="article:author" content={author} />
            )}

            {section != null && (
                <meta key="meta_as" property="article:section" content={section} />
            )}

            {tags != null && (
                <meta key="meta_t" property="article:tag" content={tags} />
            )}
        </>;
    }

    return (
        <Head>
            <link rel="canonical" href={full_url} key="canonical" />

            {title != null && (
                <>
                    <title>{title}</title>
                    <meta property="twitter:title" content={title} key="meta_twitterTitle" />
                    <meta property="og:title" content={title} key="meta_ogTitle" />
                </>
            )}

            {image != null && (
                <>
                    <link rel="apple-touch-icon" href={image} key="meta_appIcon" />
                    <meta property="og:image" content={image} key="meta_ogImg" />
                    <meta property="twitter:image" content={image} key="meta_twitterImg" />
                </>
            )}

            {robots != null && (
                <meta name="robots" content={robots} key="meta_robots" />
            )}

            {description != null && (
                <>
                    <meta name="description" content={description} key="meta_desc" />
                    <meta property="twitter:description" content={description} key="meta_twitterDesc" />
                    <meta property="og:description" content={description} key="meta_ogDesc" />
                </>
            )}

            {webtype != null && (
                <meta property="og:type" content={webtype} key="meta_ogWebType" />
            )}

            <meta httpEquiv="X-UA-Compatible" content="IE=Edge,chrome=1" />
            <meta name="opt-targeting" content="{&quot;type&quot;:&quot;Browse&quot;}" />
            <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />

            <link rel="icon" type="image/x-icon" href="/favicon.ico" />

            <meta name="keywords" content="mods, modding, games, gaming, communities, best, servers, directory, discovery" key="meta_keywords" />

            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:site" content="@bestmodsio" />
            <meta property="twitter:creator" content="@bestmodsio" />

            <meta property="og:locale" content="en_US" />
            <meta property="og:site_name" content="Best Mods" />
            <meta property="og:url" content={full_url} key="meta_ogUrl" />

            {article_info}

            <meta name="msapplication-starturl" content={base_url} key="meta_msappUrl" />
            <meta name="application-name" content="Best Mods" />
            <meta name="apple-mobile-web-app-title" content="Best Mods" />
            <meta name="theme-color" content="#181a1b" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-touch-fullscreen" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
        </Head>
    );
};

export default HeadInfo;