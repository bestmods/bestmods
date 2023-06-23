
import { useFormik, Field } from "formik";
import React, { useState, useEffect, useMemo } from "react";

import { trpc } from "../../../utils/trpc";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

import FormTemplate from '../main';
import { AlertForm } from '../../alert';
import { Category, Prisma } from "@prisma/client";
import { CategoriesWithChildren } from "../../types";

type values_type = {
    id?: number;
    parent_id?: number | null;

    name: string;
    name_short: string;
    url: string;
    classes: string;

    icon?: string | null;
    iremove?: boolean | null;

    has_bg?: boolean
};

const CategoryForm: React.FC<{ 
    cat: Category,
    cats: CategoriesWithChildren[]
 }> = ({ 
    cat,
    cats
  }) => {
    // Errors and success handles.
    let error: string | null = null;
    let success: string | null = null;

    // We must handle the parent ourselves.
    const [parent, setParent] = useState<number | null>(cat?.parentId ?? null);

    // Submit button.
    const submitBtn = 
        <div className="text-center">
            <button type="submit" className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">{!cat ? "Add Category!" : "Edit Category!"}</button>
        </div>;

    // File uploads.
    const [iconData, setIconData] = useState<string | ArrayBuffer | null>(null);

    // Queries.
    const categoryMut = trpc.category.addCategory.useMutation();

    // Hande success and errors.
    if (categoryMut.isSuccess) {
        success = "Successfully added or edited category!";
        error = null;
    } else if (categoryMut.isError) {
        const err_msg = categoryMut.error.message;

        // Check if we can simplify the error message for client.
        if (err_msg.includes("file extension is unknown"))
            error = err_msg;
        else if (err_msg.includes("base64 data is null"))
            error = "Banner file corrupt/invalid.";
        else if (err_msg.includes("is empty"))
            error = err_msg;
        else
            error = "Unable to create or edit category!";

        success = null;

        // Send alert and log full error to client's console.
        console.error(categoryMut.error);
    }

    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: cat?.name ?? "",
            name_short: cat?.nameShort ?? "",
            url: cat?.url ?? "",
            classes: cat?.classes ?? "",
            iremove: false,
            has_bg: cat?.hasBg ?? ""
        },
        enableReinitialize: true,

        onSubmit: (values) => {
        // Create new values.
        const newVals: values_type = values;

        // Assign some additional values.
        newVals.parent_id = parent;
        newVals.id = cat?.id;
        newVals.icon = iconData?.toString() ?? null;

        // Insert into database.
        categoryMut.mutate(newVals);

        // Scroll to top.
        if (typeof window !== undefined) {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }
        }
    });

    return (
        <>
            <AlertForm
                error={error}
                success={success}
            />
            <FormTemplate
                form={form}
                submitBtn={submitBtn}
            >
                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">Image</label>
                    <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="image" type="file" placeholder="Source Image" onChange={(e) => {
                        const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                        if (file) {

                            const reader = new FileReader();

                            reader.onloadend = () => {
                                setIconData(reader.result);
                            };
                            
                            reader.readAsDataURL(file);
                        }
                    }} />

                    <Field className="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="iremove" type="checkbox" /> <label className="inline align-middle text-gray-200 text-sm font-bold mb-2">Remove Current</label>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">Has Background</label>

                    <Field className="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="has_bg" type="checkbox" /> <label className="inline align-middle text-gray-200 text-sm font-bold mb-2">Yes</label>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">Parent</label> 
                    <select className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="parent_id" placeholder="Category Parent" defaultValue={parent ?? 0} onChange={(e) => {
                        const val = e.target.value;

                        if (val)
                            setParent(Number(val));
                    }}>
                        <option value="0">None</option>
                        {cats.map((cat) => {
                            return (
                                <React.Fragment key={cat.id}>
                                    <option value={cat.id}>{cat.name}</option>

                                    {cat.children.map((child) => {
                                        return <option key={child.id} value={child.id}>-- {child.name}</option>
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">Name</label>
                    <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="name" type="text" placeholder="Category Name" />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">Short Name</label>
                    <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="name_short" type="text" placeholder="Category Short Name" />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">URL</label>
                    <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="url" type="text" placeholder="models" />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">Classes</label>
                    <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="classes" type="text" placeholder="CSS Classes" />
                </div>
            </FormTemplate>
        </>
    );
};

export default CategoryForm;