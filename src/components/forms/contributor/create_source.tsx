
import { useFormik, Field } from "formik";
import React, { useState } from "react";

import { trpc } from "../../../utils/trpc";

import FormTemplate from '../main';
import { AlertForm } from '../../utils/alert';
import { type Source } from "@prisma/client";

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
            <button type="submit" className="btn btn-normal">{!src ? "Add Source!" : "Edit Source!"}</button>
        </div>;

    const [iconData, setIconData] = useState<string | ArrayBuffer | null>(null);
    const [bannerData, setBannerData] = useState<string | ArrayBuffer | null>(null);

    // Queries.
    const src_mut = trpc.source.addSource.useMutation();

    // Handle errors and success.
    if (src_mut.isSuccess) {
        success = "Successfully added or edited source!";
        error = null;
    } else if (src_mut.isError) {
        const err_msg = src_mut.error.message;

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
        console.error(src_mut.error);
    }

    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: src?.name ?? "",
            description: src?.description ?? "",
            url: src?.url ?? "",
            classes: src?.classes ?? "",
            iremove: false,
            bremove: false
        },
        enableReinitialize: true,

        onSubmit: (values) => {
            // Insert into database.
            src_mut.mutate({
                ...values,
                icon: iconData?.toString(),
                banner: bannerData?.toString(),
                update: (src) ? true : false
            });

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
                <div className="form-container">
                    <label
                        htmlFor="icon" 
                        className="form-label"
                    >Icon</label>
                    <input
                        type="file"
                        className="form-input"
                        name="icon"
                        placeholder="Source Icon"
                        onChange={(e) => {
                            const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                            if (file) {

                                const reader = new FileReader();

                                reader.onloadend = () => {
                                    setIconData(reader.result);
                                };
                                
                                reader.readAsDataURL(file);
                            }
                        }}
                    />

                    <Field
                        type="checkbox"
                        className="form-checkbox"
                        name="iremove"
                    />
                    <label
                        htmlFor="iremove" 
                        className="form-checkbox-label"
                    >Remove Current</label>
                </div>

                <div className="form-container">
                    <label
                        htmlFor="banner" 
                        className="form-label"
                    >Image Banner</label>
                    <input
                        type="file" 
                        className="form-input"
                        name="banner"
                        placeholder="Source Image Banner"
                        onChange={(e) => {
                            const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                            if (file) {

                                const reader = new FileReader();

                                reader.onloadend = () => {
                                    setBannerData(reader.result);
                                };
                                
                                reader.readAsDataURL(file);
                            }
                        }}
                    />

                    <input
                        type="checkbox"
                        className="form-checkbox"
                        name="bremove"
                    />
                    <label
                        htmlFor="bremove" 
                        className="form-checkbox-label"
                    >Remove Current</label>
                </div>

                <div className="form-container">
                    <label
                        htmlFor="name" 
                        className="form-label"
                    >Name</label>
                    <Field
                        type="text"
                        className="form-input"
                        name="name"
                        placeholder="Source Name" 
                    />
                </div>

                <div className="form-container">
                    <label
                        htmlFor="description" 
                        className="form-label"
                    >Description</label>
                    <Field
                        as="textarea"
                        rows={16}
                        cols={32}
                        className="form-input"
                        name="description"
                        placeholder="Source Description"
                    />
                </div>

                <div className="form-container">
                    <label
                        htmlFor="url" 
                        className="form-label"
                    >URL</label>
                    <Field
                        type="text"
                        className="form-input"
                        name="url"
                        placeholder="moddingcommunity.com"
                    />
                </div>

                <div className="form-container">
                    <label
                        htmlFor="classes" 
                        className="form-label"
                    >Classes</label>
                    <Field
                        type="text"
                        className="form-input"
                        name="classes"
                        placeholder="CSS Classes"
                    />
                </div>
            </FormTemplate>
        </>
    );
};

export default SourceForm;