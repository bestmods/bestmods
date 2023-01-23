
import { useFormik, Field } from "formik";
import React, { useState, useEffect, useMemo } from "react";

import { trpc } from "../../../utils/trpc";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

import FormTemplate from '../main';
import { AlertForm } from '../../alert';

const CategoryForm: React.FC<{id: number | null}> = ({ id }) => {
    /*
    const session = useContext(SessionCtx);

    if (session == null) {
        return <>
            <h1 className="text-center text-white font-bold text-lg">You must be logged in and have permission to access this page!</h1>
        </>;
    }

    const permCheck = trpc.permission.checkPerm.useQuery({
        userId: session.user?.id ?? "",
        perm: "add_sources"
    });

    if (permCheck.data == null) {
        return <>
            <h1 className="text-center text-white font-bold text-lg">You are not authorized for this page!</h1>
        </>;
    }
    */
   
    const [dataRetrieved, setDataReceived] = useState(false);

    // Errors and success handles.
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // For submissions.
    const [submit, setSubmit] = useState(false);
    const [values, setValues] = useState<{
        id: number;
        parent_id: number;

        name: string;
        nameShort: string;
        url: string;
        classes: string;

        icon: string | null;
        iremove: boolean | null;
    }>();
    const submitBtn = useMemo(() => {
        return (<>
            <div className="text-center">
                <button type="submit" className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">{id == null || id < 1 ? "Add Category!" : "Edit Category!"}</button>
            </div>
        </>);
    }, [id]);

    // State values we cannot extract from Formik.
    const [parent_id, setParent] = useState<number | null>(null);

    // For editing (prefilled fields).
    const [name, setName] = useState("");
    const [nameShort, setNameShort] = useState("");
    const [url, setUrl] = useState("");
    const [classes, setClasses] = useState("");

    // File uploads.
    const [icon, setIcon] = useState<File | null>(null)
    const [iconData, setIconData] = useState<string | ArrayBuffer | null>(null);

    // Queries.
    const categoryMut = trpc.category.addCategory.useMutation();
    const catsWithChildren = trpc.category.getCategoriesMapping.useQuery({includeMods: false});
    const categoryQuery = trpc.category.getCategory.useQuery({id: id ?? 0, url: null, parent: null});

    // Form fields.
    const [categoryFormFields, setCategoryFormFields] = useState<JSX.Element>(<></>);

    useEffect(() => {
        setCategoryFormFields(<>
            <div className="mb-4">
                <label className="block text-gray-200 text-sm font-bold mb-2">Image</label>
                <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image" name="image" type="file" placeholder="Source Image" onChange={(e) => {
                    const val = (e?.currentTarget?.files != null) ? e.currentTarget.files[0] : null;
                    setIcon(val ?? null);
                }} />

                <Field className="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image-remove" name="iremove" type="checkbox" /> <label className="inline align-middle text-gray-200 text-sm font-bold mb-2">Remove Current</label>
            </div>

            <div className="mb-4">
                <label className="block text-gray-200 text-sm font-bold mb-2">Parent</label>
                <select className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="parent" name="parent" placeholder="Category Parent" onChange={(e) => {
                    
                    const val = (Number(e.target.value) > 0) ? Number(e.target.value) : null;

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
                <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="nameShort" name="nameShort" type="text" placeholder="Category Short Name" />
            </div>

            <div className="mb-4">
                <label className="block text-gray-200 text-sm font-bold mb-2">URL</label>
                <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="url" name="url" type="text" placeholder="models" />
            </div>

            <div className="mb-4">
                <label className="block text-gray-200 text-sm font-bold mb-2">Classes</label>
                <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="classes" name="classes" type="text" placeholder="CSS Classes" />
            </div>
        </>);
    }, [catsWithChildren.data]);

    // Handle error messages to client.
    useMemo(() => {
        if (!categoryMut.isError && categoryMut.isSuccess) {
            setSuccess("Successfully added or edited category!");
            setError(null);
        }

        // Make sure we have an actual error.
        if (!categoryMut.isError)
            return;

        const err = categoryMut.error.message;

        // Check if we can simplify the error message for client.
        if (err.includes("file extension is unknown"))
            setError(err);
        else if (err.includes("base64 data is null"))
            setError("Banner file corrupt/invalid.");
        else if (err.includes("is empty"))
            setError(err);
        else
            setError("Unable to create or edit category!");
            
        setSuccess(null);

        // Send alert and log full error to client's console.
        console.error(categoryMut.error);

    }, [categoryMut.isError, categoryMut.isSuccess, categoryMut.error]);

    useEffect(() => {
        if (!dataRetrieved) {
            // Retrieve category.
            const category = categoryQuery.data;
    
            // Check if our category is null.
            if (category != null) {
                setName(category.name);
                setNameShort(category.nameShort);
                setParent(category.parentId);
                setUrl(category.url ?? "");
    
                // Classes is optional; Check if null.
                if (category.classes != null)
                    setClasses(category.classes);
    
                setDataReceived(true);
            }
        }
    }, [categoryQuery.data, dataRetrieved]);

    useEffect(() => {
        // Make sure we are submitting, values are valid, and we aren't still fetching relation data.
        if (!submit || !values)
            return;

        // Create new values.
        const newVals = values;

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

        // We are no longer submitting.
        setSubmit(false);
    }, [submit, values, categoryMut, iconData]);

    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: name,
            nameShort: nameShort,
            url: url,
            classes: classes,
            iremove: false
        },
        enableReinitialize: true,

        onSubmit: (values) => {
            // First, handle file uploads via a promise. Not sure of any other way to do it at the moment (though I am new to TypeScript, Next.JS, and React).
            new Promise<void>(async (resolve) => {
                // We have uploads / total uploads.
                let uploads = 0;
                let totalUploads = 0;
                
                // Check icon and handle upload.
                if (icon != null) {
                    // Increase our total uploads count.
                    totalUploads++;
        
                    // Create new reader.
                    const reader = new FileReader();
        
                    // On file uploaded.
                    reader.onload = () => {
                        // Set Base64 data to iconData.
                        setIconData(reader.result);
        
                        // We're done; Increment uploads.
                        uploads++;
                    };
        
                    // Read icon file.
                    reader.readAsDataURL(icon);
                }
                
                // Create a for loop for 30 seconds to allow files to upload. We could make a while loop, but I'd prefer having a 30 second timeout (these are image files).
                for (let i = 0; i < 30; i++) {
                    // If we're done, break to get to resolve().
                    if (uploads >= totalUploads)
                        break;
                    
                    console.log("Upload progress => " + uploads + "/" + totalUploads);

                    // Wait 1 second to save CPU cycles.
                    await delay(1000);
                }
        
                // We're done uploading files.
                resolve();
            }).then(() => {
                console.debug("File uploads handled!");

                // Insert into the database via mutation.
                setSubmit(true);
                setValues({
                    id: id ?? 0,
                    parent_id: parent_id ?? 0,

                    name: values.name,
                    nameShort: values.nameShort,
                    url: values.url,
                    classes: values.classes,

                    icon: null,
        
                    iremove: values.iremove
                });
            });
        }
    });

    return (
        <>
            <AlertForm
                error={error}
                success={success}
            ></AlertForm>
            <FormTemplate
                form={form}
                content={categoryFormFields}
                submitBtn={submitBtn}
            ></FormTemplate>
        </>
    );
};

export default CategoryForm;