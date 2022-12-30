import { Mod } from "@prisma/client";
import { useFormik } from "formik";
import React, { useState } from "react";

import { trpc } from "../../../utils/trpc";

const ModForm: React.FC<{id: Number | null}> = ({ id }) => {
    const [image, setImage] = useState<File | null>(null);
    
    const form = useFormik({
        initialValues: {
            source: 0,
            category: 0,
            name: "Mod Name",
            description: "Mod Full Description",
            description_short: "Mod Short Description",
            url: "Mod URL To Source",
            custom_url: "Mod Custom URL",
            install: "Mod Install"
        },

        onSubmit: (values) => {

        }
    });

    return (
        <>

        </>
    );
};

export default ModForm;