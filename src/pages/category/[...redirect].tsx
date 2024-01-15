import { type GetServerSidePropsContext } from "next";

import { prisma } from "@server/db/client";

export default function Page () {
    return (
        <></>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { req, res } = ctx;

    let redirected = false;

    const pathName = req.url;

    if (pathName) {
        const redirect = await prisma.redirect.findFirst({
            where: {
                url: pathName
            }
        })

        if (redirect) {
            res.statusCode = 301;

            res.setHeader("Location", redirect.redirect);

            redirected = true;
        }
    }

    if (!redirected) {
        return {
            notFound: true
        }
    }

    return {
        props: {
            
        }
    }
}