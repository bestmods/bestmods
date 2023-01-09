
import { useFormik, FormikProvider, Field } from "formik";
import React, { useState, useEffect } from "react";

import { trpc } from "../../../utils/trpc";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const CategoryForm: React.FC<{id: number | null}> = ({ id }) => {
    const [icon, setIcon] = useState<File | null>(null);
    const [parent_id, setParent] = useState<number | null>(null);

    // For editing (prefilled fields).
    let name = "";
    let name_short = "";
    let url = "";
    let classes = "";

    let iconData: string | ArrayBuffer | null = null;

    const categoryMut = trpc.category.addCategory.useMutation();
    const catsWithChildren = trpc.category.getCategoriesMapping.useQuery();

    useEffect(() => {
        // Check if we have an error.
        if (categoryMut.isError) {
            let errMsg = "";

            // Check if we can simplify the error message for client.
            if (categoryMut.error.message.includes("file extension is unknown"))
                errMsg = categoryMut.error.message;
            else if (categoryMut.error.message.includes("base64 data is null"))
                errMsg = "Icon file corrupt/invalid.";
             else
                errMsg = "Unable to create or edit category!"; 

            // Send alert and log full error to client's console.
            console.error(categoryMut.error);
            alert("Error! " + errMsg);
        }
    }, [categoryMut.isError]);

    // If we have a pre URL, that must mean we're editing. Therefore, pull existing category data.
    if (id != null) {
        // Retrieve category.
        const categoryQuery = trpc.category.getCategory.useQuery({id: id});
        const category = categoryQuery.data;

        // Check if our category is null.
        if (category != null) {
            name = category.name;
            name_short = category.name_short;
            parent_id = category.parentId;
            url = category.url;

            // Classes is optional; Check if null.
            if (category.classes != null)
                classes = category.classes;
        }
    }

    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: name,
            name_short: name_short,
            url: url,
            classes: classes,
            iremove: false
        },
        enableReinitialize: true,

        onSubmit: (values) => {
            // First, handle file uploads via a promise. Not sure of any other way to do it at the moment (though I am new to TypeScript, Next.JS, and React).
            new Promise<void>(async (resolve, reject) => {
                // We have uploads / total uploads.
                let uploads: number = 0;
                let totalUploads: number = 0;
                
                // Check icon and handle upload.
                if (icon != null) {
                    // Increase our total uploads count.
                    totalUploads++;
        
                    // Create new reader.
                    const reader = new FileReader();
        
                    // On file uploaded.
                    reader.onload = () => {
                        console.debug("Icon uploaded!");
        
                        // Set Base64 data to iconData.
                        iconData = reader.result;
        
                        console.debug("Icon data => " + iconData);
        
                        // We're done; Increment uploads.
                        uploads++;
                    };
        
                    // Read icon file.
                    reader.readAsDataURL(icon);
                }
                
                // Create a for loop for 30 seconds to allow files to upload. We could make a while loop, but I'd prefer having a 30 second timeout (these are image files).
                for (let i = 0; i < 30; i++) {
                    // If we're done, break to get to resolve().
                    if (uploads >= totalUploads) {
                        break;
                    }
                    
                    console.debug("Upload progress => " + uploads + "/" + totalUploads);

                    // Wait 1 second to save CPU cycles.
                    await delay(1000);
                }
        
                // We're done uploading files.
                resolve();
            }).then(() => {
                console.debug("File uploads handled!");

                // Insert into the database via mutation.
                categoryMut.mutate({
                    parent_id: parent_id,
                    name: values.name,
                    name_short: values.name_short,
                    url: values.url,
                    classes: values.classes,
                    icon: iconData?.toString() ?? null,
                    iremove: values.iremove,
                    id: id
                });
            });
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

                        <Field className="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image-remove" name="iremove" type="checkbox" /> <label className="inline align-middle text-gray-200 text-sm font-bold mb-2">Remove Current</label>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-200 text-sm font-bold mb-2">Parent</label>
                        <select className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="parent" name="parent" placeholder="Category Parent" onChange={(e) => {
                            const val = (e.target.value > 0) ? Number(e.target.value) : null;
                            setParent(val);
                        }}>
                            <option value="0">None</option>
                            {catsWithChildren?.data?.map((cat) => {
                                return (
                                    <React.Fragment key={cat.id}>
                                        <option value={cat.id}>{cat.name}</option>

                                        {cat.children?.map((child) => {
                                            return <option key={child.id} value={child.id}>-- {child.name}</option>
                                        })}
                                    </React.Fragment>
                                );
                                })}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-200 text-sm font-bold mb-2">Name</label>
                        <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="name" name="name" type="text" placeholder="Category Name" />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-200 text-sm font-bold mb-2">Short Name</label>
                        <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="name_short" name="name_short" type="text" placeholder="Category Short Name" />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-200 text-sm font-bold mb-2">URL</label>
                        <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="url" name="url" type="text" placeholder="models" />
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

export default CategoryForm;