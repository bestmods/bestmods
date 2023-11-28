import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

import { ModViewItemInc, type ModViewItem } from "~/types/mod";

import { prisma } from "@server/db/client";

import MetaInfo from "@components/meta";
import Main from "@components/main";
import ModView from "@components/mod/view";
import NotFound from "@components/errors/notfound";

import { Get_Mod_Rating } from "@utils/content/mod";

export default function Page ({
    mod,
    rating
} : {
    mod?: ModViewItem,
    rating: number
}) {
    return (
        <>
            <MetaInfo
                title={`${mod?.name ?? `Not Found`}  Sources - Best Mods`}
                description={mod?.descriptionShort ?? undefined}
            />
            <Main>
                {mod ? (
                    <ModView
                        view="sources"
                        mod={mod}
                        rating={rating}
                    />
                ) : (
                    <NotFound item="mod" />
                )}
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const session = await getSession(ctx);

    const { params } = ctx;

    const url = params?.url?.toString();

    const mod = await prisma.mod.findFirst({
        include: {
            ...ModViewItemInc,
            ModRating: {
                where: {
                    userId: session?.user?.id ?? ""
                }
            }
        },
        where: {
            url: url
        }
    });

    let rating = 1;

    // Increment view if mod is found and retrieve mod rating.
    if (mod) {
        // Increment view count.
        await prisma.mod.update({
            where: {
                id: mod.id
            },
            data: {
                totalViews: {
                    increment: 1
                }
            }
        });

        // Retrieve mod rating.
        rating = await Get_Mod_Rating(prisma, mod.id);
    }

    return { 
        props: { 
            mod: JSON.parse(JSON.stringify(mod, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            rating: rating
        } 
    }
}