
import { Source } from "@prisma/client";
import { useFormik } from "formik";
import React, { useState } from "react";

import { trpc } from "../../../utils/trpc";

const SourceForm: React.FC<{id: Number | null}> = ({ id }) => {
    const [icon, setIcon] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);

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
            name: "Source Name",
            url: "Source URL",
            classes: "",
            iremove: 0,
            bremove: 0
        },

        onSubmit: (values) => {
            const sourceMut = trpc.source.addSource.useMutation();

            let iconData = null;
            let bannerData = null;

            // Check if we're uploading an icon.
            if (icon != null) {
                const reader = new FileReader();

                reader.onload = () => {
                    iconData = reader.result;
                };

                reader.readAsDataURL(icon);
            }

            // Check if we're uploading a banner.
            if (banner != null) {
                const reader = new FileReader();

                reader.onload = () => {
                    bannerData = reader.result;
                };

                reader.readAsDataURL(banner);
            }

            // Create files and upload to database.
            sourceMut.mutate({
                name: values.name,
                url: values.url,
                classes: values.classes,
                icon: iconData,
                banner: bannerData,
                iremove: values.iremove,
                bremove: values.bremove
            })
        }
    });

    return (
        <>
            <form method="POST" onSubmit={form.handleSubmit}>
                {id != null &&
                    <input type="hidden" name="id" value={id.toString()} />
                }

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
                    <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="name" name="name" type="text" placeholder="Source Name" value={name} />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">URL</label>
                    <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="url" name="url" type="text" placeholder="moddingcommunity.com" value={url} />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">Classes</label>
                    <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="classes" name="classes" type="text" placeholder="CSS Classes" value={classes} />
                </div>

                <button type="submit" className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">{id != null ? "Add!" : "Edit!"}</button>
            </form>
        </>
    );
};

export default SourceForm;