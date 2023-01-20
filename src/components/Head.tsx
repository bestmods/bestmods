import Head from "next/head";

type HeadArgs = {
    title?: string
    description?: string
    robots?: string
    image?: string
    webtype?: string
    ptime?: string
    mtime?: string
    etime?: string
    author?: string
    section?: string
    tags?: string
}

const HeadInfo: React.FC<HeadArgs> = ({
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
    // Retrieve URLs.
    let base_url;
    let full_url;
    let full_image_url;

    if (typeof window !== "undefined") {
        base_url = window.location.protocol + "//" + window.location.host;
        full_url = base_url +  window.location.pathname;
        full_image_url = base_url + image;
    }

    let article_info;

    if (webtype == "article") {
        article_info = <>
            <meta property="article:published_time" content={ptime} />
            <meta property="article:modified_time" content={mtime} />
            <meta property="article:expiration_time" content={etime} />
            <meta property="article:author" content={author} />
            <meta property="article:section" content={section} />
            <meta property="article:tag" content={tags} />
        </>;
    }

    return (
        <Head>
            <title>{title}</title>

            <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1" />
            <meta name="opt-targeting" content="{&quot;type&quot;:&quot;Browse&quot;}" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

            <link rel="icon" type="image/x-icon" href="/favicon.ico" />

            <meta name="description" content={description} key="desc" />
            <meta name="keywords" content="mods, modding, games, gaming, communities, best, servers, directory, discovery" key="keywords" />
            <meta name="robots" content={robots} key="robots" />

            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:title" content={title} key="twitterTitle" />
            <meta property="twitter:description" content={description} key="twitterDesc" />
            <meta property="twitter:site" content="@bestmodsio" />
            <meta property="twitter:creator" content="@bestmodsio" />
            <meta property="twitter:image" content={full_image_url} key="twitterImg" />

            <meta property="og:locale" content="en_US" />
            <meta property="og:title" content={title} key="ogTitle" />
            <meta property="og:description" content={description} key="ogDesc" />
            <meta property="og:site_name" content="Best Mods" />
            <meta property="og:type" content={webtype} key="ogWebType"/>

            {article_info}

            <meta property="og:url" content={full_url} key="ogUrl" />
            <meta property="og:image" content={full_image_url} key="ogImg" />

            <link rel="canonical" href={full_url} key="canonical" />

            <meta name="msapplication-starturl" content={base_url} key="msappUrl"  />
            <meta name="application-name" content="Best Mods" />
            <meta name="apple-mobile-web-app-title" content="Best Mods" />
            <meta name="theme-color" content="#181a1b" />
            <meta name="mobile-web-app-capable" content="yes" />
            <link rel="apple-touch-icon" href={full_image_url} key="appIcon" />
            <meta name="apple-touch-fullscreen" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
        </Head>
    );
};

export default HeadInfo;