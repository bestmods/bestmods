import Error500 from "@components/errors/500";
import Main from "@components/main";
import MetaInfo from "@components/meta";

export default function Page() {
    return (
        <>
            <MetaInfo
                title="Server-Side Error - Best Mods"
            />

            <Main>
                <Error500 />
            </Main>
        </>
    )
}