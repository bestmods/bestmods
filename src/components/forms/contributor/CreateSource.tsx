
import { useFormik, Field } from "formik";
import React, { useState, useEffect, useMemo } from "react";

import { trpc } from "../../../utils/trpc";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

import FormTemplate from '../main';
import { AlertForm } from '../../alert';

const SourceForm: React.FC<{preUrl: string | null}> = ({ preUrl }) => {
    const [dataReceived, setDataReceived] = useState(false);

    // Errors and success handles.
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // For submissions.
    const [submit, setSubmit] = useState(false);
    const [values, setValues] = useState<{
        name: string;
        url: string;
        classes: string | null,
        banner: string | null;
        icon: string | null;
        iremove: boolean;
        bremove: boolean;
    }>();
    const submitBtn = useMemo(() => {
        return (<>
            <div className="text-center">
                <button type="submit" className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">{preUrl == null ? "Add Source!" : "Edit Source!"}</button>
            </div>
        </>);
    }, [preUrl]);
    
    // For editing (prefilled fields).
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [classes, setClasses] = useState("");

    // File uplaods.
    const [icon, setIcon] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);

    const [iconData, setIconData] = useState<string | ArrayBuffer | null>(null);
    const [bannerData, setBannerData] = useState<string | ArrayBuffer | null>(null);

    // Queries.
    const sourceMut = trpc.source.addSource.useMutation();
    const sourceQuery = trpc.source.getSource.useQuery({
        url: preUrl,

        selName: true,
        selUrl: true,
        selClasses: true
    });

    // Form fields.
    const [sourceFormFields, setSourceFormFields] = useState<JSX.Element>(<></>);

    useEffect(() => {
        setSourceFormFields(<>
            <div className="mb-4">
                <label className="block text-gray-200 text-sm font-bold mb-2">Image</label>
                <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image" name="image" type="file" placeholder="Source Image" onChange={(e) => {
                    const val = (e?.currentTarget?.files != null) ? e.currentTarget.files[0] : null;

                    setIcon(val ?? null);
                }} />

                <Field className="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image-remove" name="iremove" type="checkbox" /> <label className="inline align-middle text-gray-200 text-sm font-bold mb-2">Remove Current</label>
            </div>

            <div className="mb-4">
                <label className="block text-gray-200 text-sm font-bold mb-2">Image Banner</label>
                <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image_banner" name="image_banner" type="file" placeholder="Source Image Banner" onChange={(e) => {
                    const val = (e?.currentTarget?.files != null) ? e.currentTarget.files[0] : null;

                    setBanner(val ?? null);
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
        </>);
    }, []);

    // Handle error messages to client.
    useMemo(() => {
        if (!sourceMut.isError && sourceMut.isSuccess) {
            setSuccess("Successfully added or edited source!");
            setError(null);
        }

        // Make sure we have an actual error.
        if (!sourceMut.isError)
            return;

        const err = sourceMut.error.message;

        // Check if we can simplify the error message for client.
        if (err.includes("Error parsing URL"))
            setError("Source URL is too short or empty (<2 bytes).");
        else if (err.includes("file extension is unknown"))
            setError(err);
        else if (err.includes("base64 data is null"))
            setError("Icon or banner file(s) corrupt/invalid.");
        else if (err.includes("is empty"))
            setError(err);
        else
            setError("Unable to create or edit source!");

        setSuccess(null);

        // Send alert and log full error to client's console.
        console.error(sourceMut.error);

    }, [sourceMut.isError, sourceMut.isSuccess]);

    useEffect(() => {
        if (!dataReceived) {
            // Retrieve source.
            const source = sourceQuery.data;
    
            // Check if our source is null.
            if (source != null) {
                setName(source.name);
                setUrl(source.url);
    
                // Classes is optional; Check if null.
                if (source.classes != null)
                    setClasses(source.classes);
                
                setDataReceived(true);
            }
        }
    }, [sourceQuery.data]);

    useEffect(() => {
        // Make sure we are submitting, values are valid, and we aren't still fetching relation data.
        if (!submit || !values)
            return;

        // Create new values.
        const newVals = values;

        newVals.icon = iconData?.toString() ?? null;
        newVals.banner = bannerData?.toString() ?? null;

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

        // We are no longer submitting.
        setSubmit(false);
    }, [submit, values]);


    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: name,
            url: url,
            classes: classes,
            iremove: false,
            bremove: false
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
        
                // Check banner and handle upload.
                if (banner != null) {
                    // Increase our total uploads count.
                    totalUploads++;
        
                    // Create new reader.
                    const reader = new FileReader();
        
                    // On file uploaded.
                    reader.onload = () => {
                        // Set Base64 data to bannerData.
                        setBannerData(reader.result);
        
                        // We're done; Increment uploads.
                        uploads++;
                    };
        
                    // Read banner file.
                    reader.readAsDataURL(banner);
                }
                
                // Create a for loop for 30 seconds to allow files to upload. We could make a while loop, but I'd prefer having a 30 second timeout (these are image files).
                for (let i = 0; i < 30; i++) {
                    // If we're done, break to get to resolve().
                    if (uploads >= totalUploads)
                        break;

                    // Wait 1 second to save CPU cycles.
                    await delay(1000);
                }
        
                // We're done uploading files.
                resolve();
            }).then(() => {
                // Insert into the database via mutation.
                setSubmit(true);
                setValues({
                    name: values.name,
                    url: values.url,
                    classes: values.classes,

                    icon: null,
                    banner: null,
        
                    iremove: values.iremove,
                    bremove: values.bremove
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
                content={sourceFormFields}
                submitBtn={submitBtn}
            ></FormTemplate>
        </>
    );
};

export default SourceForm;