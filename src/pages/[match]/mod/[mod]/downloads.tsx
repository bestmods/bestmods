import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

import { ModViewItemInc, type ModViewItem } from "~/types/mod";

import { prisma } from "@server/db/client";

import MetaInfo from "@components/meta";
import Main from "@components/main";
import ModView from "@components/mod/view";
import NotFound from "@components/errors/notfound";

import { GetModRating } from "@utils/content/mod";
import { GetModDescription } from "@utils/description";
import { HasRole } from "@utils/roles";
import { GetCategoryBgImage } from "@utils/category";
import { GetModBanner } from "@utils/mod";

export default function Page ({
    mod,
    rating
} : {
    mod?: ModViewItem,
    rating: number
}) {
    // Retrieve background image if any.
    const bgPath = GetCategoryBgImage(mod?.category);

    // Retrieve mod description.
    const desc = GetModDescription({ mod });

    // Retrieve mod banner.
    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "";
    
    const banner = GetModBanner(mod, cdn);

    return (
        <>
            <MetaInfo
                title={`${mod?.name ?? `Not Found`} Downloads - Best Mods`}
                description={desc}
                image={banner}
            />
            <Main image={bgPath}>
                {mod ? (
                    <ModView
                        view="downloads"
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

    const catUrl = params?.category?.toString();
    const modUrl = params?.mod?.toString();

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
            url: modUrl,
            OR: [
                {
                    category: {
                        url: catUrl
                    }
                },
                {
                    category: {
                        parent: {
                            url: catUrl
                        }
                    }
                }
            ]
        }
    });

    let rating = 1;

    // Retrieve mod rating if mod found.
    if (mod) {
        rating = await GetModRating({
            prisma: prisma,
            id: mod.id
        });
    } else {
        return {
            notFound: true
        }
    }

    return { 
        props: { 
            mod: JSON.parse(JSON.stringify(mod, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            rating: rating
        } 
    }
}