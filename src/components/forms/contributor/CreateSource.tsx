
import { useFormik, FormikProvider, Field } from "formik";
import React, { useState } from "react";

import { trpc } from "../../../utils/trpc";
import { TRPCError } from "@trpc/server"

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const SourceForm: React.FC<{id: number | null}> = ({ id }) => {
    const [icon, setIcon] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);

    let iconData: string | ArrayBuffer | null = null;
    let bannerData: string | ArrayBuffer | null = null;

    const sourceMut = trpc.source.addSource.useMutation();

    // For editing.
    let name = "";
    let url = "";
    let classes = "";

    // If we have an ID, that must mean we're editing. Therefore, pull existing source data.
    if (id != null) {
        // Retrieve source.
        const sourceQuery = trpc.source.getSource.useQuery({id: id, url: null});
        const source = sourceQuery.data;

        // Check if our source is null.
        if (source != null) {
            name = source.name;
            url = source.url;

            // Classes is optional; Check if null.
            if (source.classes != null)
                classes = source.classes;
        }
    }

    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: "",
            url: "",
            classes: "",
            iremove: 0,
            bremove: 0
        },

        onSubmit: (values) => {
            // First, handle file uploads via a promise.
            new Promise(async (resolve, reject) => {
                let totalUploads: number = 0;
                let uploads: number = 0;
                
                if (icon != null) {
                    totalUploads++;
        
                    const reader = new FileReader();
        
                    reader.onload = () => {
                        console.debug("Icon uploaded!");
        
                        iconData = reader.result;
        
                        console.debug("Icon data => " + iconData);
        
                        uploads++;
                    };
        
                    reader.readAsDataURL(icon);
                }
        
                if (banner != null) {
                    totalUploads++;
        
                    const reader = new FileReader();
        
                    reader.onload = () => {
                        console.debug("Banner uploaded!");
        
                        bannerData = reader.result;
        
                        console.debug("Banner data => " + bannerData);
        
                        uploads++;
                    };
        
                    reader.readAsDataURL(banner);
                }
                
                while (true) {
                    if (uploads >= totalUploads) {
                        break;
                    }
                    
                    console.debug("Upload progress => " + uploads + "/" + totalUploads);

                    await delay(1000);
                }
        
                resolve();
            }).then(() => {
                console.debug("File uploads handled!");

                // Insert into the database via mutation :)
                sourceMut.mutate({
                    name: values.name,
                    url: values.url,
                    classes: values.classes,
                    icon: iconData,
                    banner: bannerData,
                    iremove: values.iremove,
                    bremove: values.bremove,
                    id: id
                });
            });

            // Check if we have an error.
            if (sourceMut.isError) {
                if (sourceMut.error.message.includes("Unique constraint failed on the field")) {
                    alert("Error! Source with URL already exists! Please try another.");
                    console.log(sourceMut.error);
                } else {
                    alert("Error adding source! Check developer console for error.");
                    console.error(sourceMut.error);
                }
            }
        }
    });

    return (
        <>
            <FormikProvider value={form}>
                <form method="POST" onSubmit={form.handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-200 text-sm font-bold mb-2">Image</label>
                        <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image" name="image" type="file" placeholder="Source Image" onChange={(e) => {
                            setIcon(e.currentTarget.files[0]);
                        }} />

                        <input className="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image-remove" name="iremove" type="checkbox" /> <label className="inline align-middle text-gray-200 text-sm font-bold mb-2">Remove Current</label>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-200 text-sm font-bold mb-2">Image Banner</label>
                        <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image_banner" name="image_banner" type="file" placeholder="Source Image Banner" onChange={(e) => {
                            setBanner(e.currentTarget.files[0]);
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

                    <button type="submit" className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">{id == null ? "Add!" : "Edit!"}</button>
                </form>
            </FormikProvider>
        </>
    );
};

export default SourceForm;