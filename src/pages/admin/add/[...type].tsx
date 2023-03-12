import { BestModsPage } from '../../../components/main';

import { type NextPage } from "next";
import React, { useContext } from "react";

import SourceForm from "../../../components/forms/contributor/CreateSource";
import CategoryForm from "../../../components/forms/contributor/CreateCategory";
import ModForm from "../../../components/forms/contributor/CreateMod";

import { useRouter } from 'next/router'

import HeadInfo from "../../../components/Head";
import { SessionCtx } from '../../../components/main';

import { trpc } from '../../../utils/trpc';

const Home: NextPage = () => {
    return (
        <>
            <HeadInfo />
            <BestModsPage
                content={<MainContent />}
            />
        </>
    );
};

const MainContent: React.FC = () => {
    const { query } = useRouter()

    // First make sure we have access to this page.
    const session = useContext(SessionCtx);

    const permCheck = trpc.permission.checkPerm.useQuery({
        userId: session?.user?.id ?? "",
        perm: "contributor"
    });

    if (session == null) {
        return <div className="container mx-auto">
            <h1 className="text-center text-white font-bold text-lg">You must be logged in and have permission to access this page!</h1>
        </div>;
    }

    if (permCheck.data == null) {
        return <div className="container mx-auto">
            <h1 className="text-center text-white font-bold text-lg">You are not authorized to view this page!</h1>
        </div>;
    }

    const typeParam: string | null = (query.type != null && query.type[0] != null) ? query.type[0] : null;
    const typeId: string | null = (query.type != null && query.type[1] != null) ? query.type[1] : null;

    const typeIdNum = Number(typeId);

    let formComponent = <ModForm preUrl={typeId} />;

    if (typeParam != null && typeParam == 'source')
        formComponent = <SourceForm preUrl={typeId} />;
    else if (typeParam != null && typeParam == 'category')
        formComponent = <CategoryForm id={typeIdNum} />;

    return (
        <>
            <div className="container mx-auto">
                {formComponent}
            </div>
        </>
    );
};

export default Home;
