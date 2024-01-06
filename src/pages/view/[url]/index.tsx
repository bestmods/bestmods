import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

import { ModViewItemInc, type ModViewItem } from "~/types/mod";

import { prisma } from "@server/db/client";

import MetaInfo from "@components/meta";
import Main from "@components/main";
import ModView from "@components/mod/view";
import NotFound from "@components/errors/notfound";

import { GetModRating } from "@utils/content/mod";
import { GetBgImage } from "@utils/images";
import { GetModDescription } from "@utils/description";
import { HasRole } from "@utils/roles";

export default function Page ({
    mod,
    rating
} : {
    mod?: ModViewItem,
    rating: number
}) {
    // Retrieve background image if any.
    const bgPath = GetBgImage(mod?.category);

    // Retrieve mod description.
    const desc = GetModDescription({ mod });

    // Retrieve mod banner.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    
    let banner: string | undefined = undefined;

    if (mod?.banner)
        banner = cdn + mod.banner;

    return (
        <>
            <MetaInfo
                title={`${mod?.name ?? `Not Found`} - Best Mods`}
                description={desc}
                image={banner}
            />
            <Main image={bgPath}>
                {mod ? (
                    <ModView
                        view="overview"
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

    const { params, res } = ctx;

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
            // If we're not an admin or contributor, only find visible mods.
            ...((!HasRole(session, "ADMIN") && !HasRole(session, "CONTRIBUTOR")) && {
                visible: true
            }),
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
        rating = await GetModRating({
            prisma: prisma,
            id: mod.id
        });
    } else
        res.statusCode = 404;

    return { 
        props: { 
            mod: JSON.parse(JSON.stringify(mod, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            rating: rating
        } 
    }
}