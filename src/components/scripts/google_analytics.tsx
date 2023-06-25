import Script from "next/script";

const GoogleAnalytics: React.FC<{
    id: string
}> = ({
    id
}) => {
    return (
        <>
            <Script id="google-tag-manager" src={"https://www.googletagmanager.com/gtag/js?id=" + id} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){window.dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', '${id}');
                `}
            </Script>
        </>
    );
}

export default GoogleAnalytics;