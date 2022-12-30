import { Mod } from "@prisma/client";
import { useFormik } from "formik";
import React, { useState } from "react";

import { trpc } from "../../../utils/trpc";

const CategoryForm: React.FC<{id: Number | null}> = ({ id }) => {
    const [icon, setIcon] = useState<File | null>(null);

    const form = useFormik({
        initialValues: {
            parent: 0,
            name: "Category Name",
            name_short: "Category Short Name",
            classes: ""
        },

        onSubmit: (values) => {

        }
    });

    return (
        <>

        </>
    );
};

export default CategoryForm;