import Head from "next/head";

const ArticleInfo = ({ptime="", mtime="", etime="", author="Best Mods", section="Technology", tags="mod"}) => {
    return (
        <>
            <meta property="article:published_time" content={ptime} />
            <meta property="article:modified_time" content={mtime} />
            <meta property="article:expiration_time" content={etime} />
            <meta property="article:author" content={author} />
            <meta property="article:section" content={section} />
            <meta property="article:tag" content={tags} />
        </>
    );
};

const HeadInfo = ({
                    title = "Best Mods - Discover The Top Mods On The Internet!", 
                    description="Browse the best mods in gaming from many sources on the Internet! Project ran by The Modding Community!", 
                    robots="index, follow", 
                    image="/images/bestmods-filled.png", 
                    webtype="website",
                    ptime="",
                    mtime="",
                    etime="",
                    author="Best Mods",
                    section="Technology",
                    tags="mod"}) => {
    // To do: Calculate base and query URL (e.g. https://bestmods.io and /view/modname).
    const base_url = "/";
    const url = "/";

    const full_url = base_url + "/" + url;

    const full_image_url = base_url + image;

    let article_info;

    if (webtype == "website") {
        article_info = <ArticleInfo
            ptime={ptime}
            mtime={mtime}
            etime={etime}
            author={author}
            section={section}
            tags={tags} 
        />;
    }

    return (
        <Head>
            <title>{title}</title>

            <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1" />
            <meta name="opt-targeting" content="{&quot;type&quot;:&quot;Browse&quot;}" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

            <link rel="icon" type="image/x-icon" href="/favicon.ico" />

            <meta name="description" content={description} />
            <meta name="keywords" content="mods, modding, games, gaming, communities, best, servers, directory, discovery" />
            <meta name="robots" content={robots} />

            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:site" content="@bestmodsio" />
            <meta property="twitter:creator" content="@bestmodsio" />
            <meta property="twitter:image" content={full_image_url} />

            <meta property="og:locale" content="en_US" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content="Best Mods" />
            <meta property="og:type" content={webtype} />

            {article_info}
            
            <meta property="og:url" content={full_url} />
            <meta property="og:image" content={full_image_url} />

            <link rel="canonical" href={full_url} />

            <meta name="msapplication-starturl" content={base_url} />
            <meta name="application-name" content="Best Mods" />
            <meta name="apple-mobile-web-app-title" content="Best Mods" />
            <meta name="theme-color" content="#181a1b" />
            <meta name="mobile-web-app-capable" content="yes" />
            <link rel="apple-touch-icon" href={full_image_url} />
            <meta name="apple-touch-fullscreen" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
        </Head>
    );
};

export default HeadInfo;