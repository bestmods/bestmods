import AdminPanel from "@components/admin/panel";
import NoAccess from "@components/errors/noaccess";
import NotFound from "@components/errors/notfound";
import Main from "@components/main";
import MetaInfo from "@components/meta";
import ModReportView from "@components/mod/report/view";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import { HasRole } from "@utils/roles";
import { type GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { type ModReportWithRelations } from "~/types/mod";

import { prisma } from "@server/db/client";

export default function Page ({
    report
} : {
    report?: ModReportWithRelations
}) {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title="Viewing Report - Admin - Best Mods"
            />
            <Main>
                {(HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR")) ? (
                    <AdminPanel view="report">
                        {report ? (
                            <ModReportView report={report} />
                        ) : (
                            <NotFound item="report" />
                        )}
                    </AdminPanel>
                ) : (
                    <NoAccess />
                )}
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params } = ctx;

    const session = await getServerAuthSession(ctx);

    const id = params?.id?.toString();

    const authed = HasRole(session, "ADMIN") || HasRole(session, "CONTRIBUTOR");

    let report: ModReportWithRelations | null = null;

    if (authed && id) {
        report = await prisma.modReport.findFirst({
            include: {
                user: true,
                mod: true
            },
            where: {
                id: Number(id)
            }
        })
    }

    if (!report) {
        return {
            notFound: true
        }
    }

    return {
        props: {
            report: JSON.parse(JSON.stringify(report, (_, v) => typeof v === "bigint" ? v.toString() : v))
        }
    }
}