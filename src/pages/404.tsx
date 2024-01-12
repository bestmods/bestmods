import NotFound from "@components/errors/notfound";
import Main from "@components/main";
import MetaInfo from "@components/meta";

export default function Page() {
    return (
        <>
            <MetaInfo
                title="Not Found - Best Mods"
            />

            <Main>
                <NotFound />
            </Main>
        </>
    )
}