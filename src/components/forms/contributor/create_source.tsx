
import { useFormik, Field } from "formik";
import React, { useState } from "react";

import { trpc } from "../../../utils/trpc";

import FormTemplate from '../main';
import { AlertForm } from '../../alert';
import { type Source } from "@prisma/client";

type values_type = {
    update?: boolean
    name: string
    url: string
    classes: string | null
    banner?: string | null
    icon?: string | null
    iremove?: boolean
    bremove?: boolean
};

const SourceForm: React.FC<{ 
    src: Source | null 
}> = ({ 
    src 
}) => {
    // Errors and success handles.
    let error: string | null = null;
    let success: string | null = null;

    // Submit button.
    const submitBtn = 
        <div className="text-center">
            <button type="submit" className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">{!src ? "Add Source!" : "Edit Source!"}</button>
        </div>;

    const [iconData, setIconData] = useState<string | ArrayBuffer | null>(null);
    const [bannerData, setBannerData] = useState<string | ArrayBuffer | null>(null);

    // Queries.
    const sourceMut = trpc.source.addSource.useMutation();

    // Handle errors and success.
    if (sourceMut.isSuccess) {
        success = "Successfully added or edited source!";
        error = null;
    } else if (sourceMut.isError) {
        const err_msg = sourceMut.error.message;

        // Check if we can simplify the error message for client.
        if (err_msg.includes("Error parsing URL"))
            error = "Source URL is too short or empty (<2 bytes).";
        else if (err_msg.includes("file extension is unknown"))
            error = err_msg;
        else if (err_msg.includes("base64 data is null"))
            error = "Icon or banner file(s) corrupt/invalid.";
        else if (err_msg.includes("is empty"))
            error = err_msg;
        else
            error = "Unable to create or edit source!";

        success = null;

        // Send alert and log full error to client's console.
        console.error(sourceMut.error);
    }

    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: src?.name ?? "",
            url: src?.url ?? "",
            classes: src?.classes ?? "",
            iremove: false,
            bremove: false
        },
        enableReinitialize: true,

        onSubmit: (values) => {
            // Create new values.
            const newVals: values_type = values;

            newVals.icon = iconData?.toString() ?? null;
            newVals.banner = bannerData?.toString() ?? null;
            newVals.update = (src) ? true : false;

            // Insert into database.
            sourceMut.mutate(newVals);

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
                    <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image" name="image" type="file" placeholder="Source Image" onChange={(e) => {
                        const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                        if (file) {

                            const reader = new FileReader();

                            reader.onloadend = () => {
                                setIconData(reader.result);
                            };
                            
                            reader.readAsDataURL(file);
                        }
                    }} />

                    <Field className="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image-remove" name="iremove" type="checkbox" /> <label className="inline align-middle text-gray-200 text-sm font-bold mb-2">Remove Current</label>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">Image Banner</label>
                    <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image_banner" name="image_banner" type="file" placeholder="Source Image Banner" onChange={(e) => {
                        const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                        if (file) {

                            const reader = new FileReader();

                            reader.onloadend = () => {
                                setBannerData(reader.result);
                            };
                            
                            reader.readAsDataURL(file);
                        }
                    }} />

                    <input className="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="bremove" name="image_banner-remove" type="checkbox" /> <label className="inline align-middle text-gray-200 text-sm font-bold mb-2">Remove Current</label>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">Name</label>
                    <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="name" name="name" type="text" placeholder="Source Name" />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">URL</label>
                    <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="url" name="url" type="text" placeholder="moddingcommunity.com" />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">Classes</label>
                    <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="classes" name="classes" type="text" placeholder="CSS Classes" />
                </div>
            </FormTemplate>
        </>
    );
};

export default SourceForm;