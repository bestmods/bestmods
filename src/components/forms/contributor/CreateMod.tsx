
import { useFormik, FormikProvider, Field } from "formik";
import React, { useState, useEffect, useMemo } from "react";
import { string } from "zod";

import { trpc } from "../../../utils/trpc";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const ModForm: React.FC<{preUrl: string | null}> = ({ preUrl }) => {    
    const [id, setId] = useState(0);
    const [dataReceived, setDataReceived] = useState(false);

    const [submit, setSubmit] = useState(false);
    const [values, setValues] = useState<{
        description: string;
        category: number;
        id: number;
        name: string;
        url: string;
        banner: string | null;
        description_short: string;
        install: string | null;
        bremove: boolean | null;
        downloads: string | null;
        screenshots: string | null;
        sources: string | null;
    }>();

    // State values we cannot extract from Formik.
    const [category, setCategory] = useState(0);

    // States for number of download and screenshot forms to show.
    const [downloadCount, setDownloadCount] = useState(1);
    const [screenShotCount, setScreenShotCount] = useState(1);
    const [sourceCount, setSourceCount] = useState(1);

    const [downloadForm, setDownloadForm] = useState<JSX.Element>(<></>);
    const [screenShotForm, setScreenShotForm] = useState<JSX.Element>(<></>);
    const [sourceForm, setSourceForm] = useState<JSX.Element>(<></>);

    // For editing (prefilled fields).
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [descriptionShort, setDescriptionShort] = useState("");
    const [url, setUrl] = useState("");
    const [install, setInstall] = useState("");

    // File uploads.
    const [banner, setBanner] = useState<File | null>(null);
    const [bannerData, setBannerData] = useState<string | ArrayBuffer | null>(null);

    // Queries.
    const modMut = trpc.mod.addMod.useMutation();
    const sources = trpc.source.getAllSources.useQuery();
    const catsWithChildren = trpc.category.getCategoriesMapping.useQuery();
    const modQuery = trpc.mod.getMod.useQuery({url: preUrl ?? ""});

    // Handle error messages to client.
    useMemo(() => {
        // Make sure we have an actual error.
        if (!modMut.isError)
            return;

        let errMsg = "";

        // Check if we can simplify the error message for client.
        if (modMut.error.message.includes("Error parsing URL"))
            errMsg = "Mod URL is too short or empty (<2 bytes).";
        else if (modMut.error.message.includes("file extension is unknown"))
            errMsg = modMut.error.message;
        else if (modMut.error.message.includes("base64 data is null"))
            errMsg = "Icon or banner file(s) corrupt/invalid.";
            else
            errMsg = "Unable to create or edit mod!"; 

        // Send alert and log full error to client's console.
        console.error(modMut.error);
        alert("Error! " + errMsg);
    }, [modMut.isError]);


    // Handle dynamic downloads fields/array (uncontrolled input).
    type dlArrType = {
        name: string,
        url: string
    }

    const [dlsArr, setDlsArr] = useState<Array<dlArrType>>([]);
    const [fetchDls, setFetchDls] = useState(false);

    useEffect(() => {
        if (!fetchDls || typeof window === 'undefined')
            return;

        let arr: Array<dlArrType> = [];

        for (let i = 1; i <= 50; i++) {   
            const nameEle = document.getElementById("downloads-" + i + "-name");
            const urlEle = document.getElementById("downloads-" + i + "-url");

            if (nameEle == null || urlEle == null)
                continue;

            const nameVal = (document.getElementById(nameEle.id) as HTMLInputElement).value;
            const urlVal = (document.getElementById(urlEle.id) as HTMLInputElement).value;

            if (urlVal.length < 1)
                continue;

            arr.push({name: nameVal, url: urlVal});
        }
        
        // Add to our array.
        if (arr.length > 0)
            setDlsArr(arr);

        setFetchDls(false);
    }, [fetchDls])


    // Handle dynamic screenshots fields/array (uncontrolled input).
    type ssArrType = {
        url: string
    }

    const [sssArr, setSssArr] = useState<Array<ssArrType>>([]);
    const [fetchSss, setFetchSss] = useState(false);

    useEffect(() => {
        if (!fetchSss || typeof window === 'undefined')
            return;

        let arr: Array<ssArrType> = [];

        for (let i = 1; i <= 50; i++) {
            if (typeof window === 'undefined')
                break

            const urlEle = document.getElementById("screenshots-" + i + "-url");

            if (urlEle == null)
                break;

            const urlVal = (document.getElementById(urlEle.id) as HTMLInputElement).value;

            if (urlVal.length < 1)
                continue;

            arr.push({url: urlVal});
        }

        // Add to our array.
        if (arr.length > 0)
            setSssArr(arr);

        setFetchSss(false);
    }, [fetchSss]);

    // Handle dynamic sources (uncontrolled input).
    type srcArrType = {
        url: string
        query: string
    }

    const [srcsArr, setSrcsArr] = useState<Array<srcArrType>>([]);
    const [fetchSrcs, setFetchSrcs] = useState(false);

    useEffect(() => {
        if (!fetchSrcs || typeof window === 'undefined')
            return;

        let arr: Array<srcArrType> = [];

        for (let i = 1; i <= 50; i++) {
            if (typeof window === 'undefined')
                break
    
            const urlEle = document.getElementById("sources-" + i + "-url");
            const queryEle = document.getElementById("sources-" + i + "-query");

            if (urlEle == null || queryEle == null)
                continue;

            const urlVal = (document.getElementById(urlEle.id) as HTMLInputElement).value;
            const queryVal = (document.getElementById(queryEle.id) as HTMLInputElement).value;

            if (urlVal.length < 1)
                continue;

            arr.push({url: urlVal, query: queryVal});
        }

        if (arr.length > 0)
            setSrcsArr(arr);

        setFetchSrcs(false);
    }, [fetchSrcs]);


    // Handle dynamic download form.
    useMemo(() => {
        // Create a range from 1 to download count.
        const range = Array.from({length: downloadCount}, (value, index) => index + 1);

        setDownloadForm(<>
            {range.map((num) => {
                const nameId = "downloads-" + num + "-name";
                const urlId = "downloads-" + num + "-url";

                return (<div key={num} className="mb-4">
                    <div className="mb-4">
                        <h3 className="text-gray-200 text-lg font-bold mb-2">Download #{num}</h3>

                        <label className="block text-gray-200 text-sm font-bold mb-2">Name</label>
                        <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={nameId} id={nameId} type="text" />

                        <label className="block text-gray-200 text-sm font-bold mb-2">URL</label>
                        <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={urlId} id={urlId} type="text" />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setDownloadCount(downloadCount - 1);
                        }} className="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Remove</button>
                    </div>
                </div>);
            })}
            <div className="mb-4">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setDownloadCount(downloadCount + 1);
                }} className="text-white bg-lime-500 hover:bg-lime-600 focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Add</button>
            </div>
        </>);
    }, [downloadCount])

    // Handle dynamic dynamic screenshot form.
    useMemo(() => {
        // Create a range from 1 to screenshot count.
        const range = Array.from({length: downloadCount}, (value, index) => index + 1);

        setScreenShotForm(<>
            {range.map((num) => {
                const urlId = "screenshots-" + num + "-url";

                return (<div key={num} className="mb-4">
                    <div className="mb-4">
                        <h3 className="text-gray-200 text-lg font-bold mb-2">Screenshot #{num}</h3>

                        <label className="block text-gray-200 text-sm font-bold mb-2">URL</label>
                        <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={urlId} id={urlId} type="text" />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setScreenShotCount(screenShotCount - 1);
                        }} className="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Remove</button>
                    </div>
                </div>);
            })}
            <div className="mb-4">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setScreenShotCount(screenShotCount + 1);
                }} className="text-white bg-lime-500 hover:bg-lime-600 focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Add</button>
            </div>
        </>);
    }, [screenShotCount]);

    // Handle dynamic sources.
    useEffect(() => {
        // Create a range from 1 to sources count.
        const range = Array.from({length: sourceCount}, (value, index) => index + 1);

        // Fetch pre-existing source data for URL select box.
        const sourcesArr = sources.data;

        setSourceForm(<>
            {range.map((num) => {
                const srcUrl = "sources-" + num + "-url";
                const srcQuery = "sources-" + num + "-query";

                return (<div key={num} className="mb-4">
                    <div className="mb-4">
                        <h3 className="text-gray-200 text-lg font-bold mb-2">Source #{num}</h3>

                        <label className="block text-gray-200 text-sm font-bold mb-2">Source</label>
                        <select className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={srcUrl} id={srcUrl}>
                            {sourcesArr?.map((src) => {
                                return (
                                    <option key={src.url} value={src.url}>{src.name}</option>
                                )
                            })}
                        </select>

                        <label className="block text-gray-200 text-sm font-bold mb-2">Query URL</label>
                        <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={srcQuery} id={srcQuery} type="text" />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setSourceCount(sourceCount - 1);
                        }} className="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Remove</button>
                    </div>
                </div>);
            })}
            <div className="mb-4">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setSourceCount(sourceCount + 1);
                }} className="text-white bg-lime-500 hover:bg-lime-600 focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Add</button>
            </div>
        </>);

    }, [sourceCount, sources.data]);

    useEffect(() => {
        if (!dataReceived) {
            // Retrieve mod.
            const mod = modQuery.data;
    
            // Check if our mod is null.
            if (mod != null) {
                setId(mod.id);

                setName(mod.name);
                setUrl(mod.url);
                setDescription(mod.description);
                setDescriptionShort(mod.description_short ?? "");
                setInstall(mod.install ?? "");

                setDataReceived(true);
            }
        }
    
    }, [modQuery.data]);

    useEffect(() => {
        // Make sure we are submitting, values are valid, and we still aren't fetching relation data.
        if (!submit || !values || fetchDls || fetchSss || fetchSrcs)
            return;

        // Create new values.
        const newVals = values;

        // Convert relation arrays to JSON string.
        const dlsStr = JSON.stringify(dlsArr);
        const sssStr = JSON.stringify(sssArr);
        const srcsStr = JSON.stringify(srcsArr);

        // Assign relation data to new values now.
        newVals.downloads = dlsStr;
        newVals.screenshots = sssStr;
        newVals.sources = srcsStr;
        
        // Insert into database.
        modMut.mutate(newVals);

        // We are no longer submitting.
        setSubmit(false);
    }, [submit, values, fetchDls, fetchSss, fetchSrcs]);


    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: name,
            description: description,
            descriptionShort: descriptionShort,
            install: install,
            url: url,
            bremove: false
        },
        enableReinitialize: true,

        onSubmit: (values) => {
            setFetchDls(true);
            setFetchSss(true);
            setFetchSrcs(true);

            // First, handle file uploads via a promise. Not sure of any other way to do it at the moment (though I am new to TypeScript, Next.JS, and React).
            new Promise<void>(async (resolve, reject) => {
                // We have uploads / total uploads.
                let uploads: number = 0;
                let totalUploads: number = 0;

                // Check banner and handle upload.
                if (banner != null) {
                    // Increase our total uploads count.
                    totalUploads++;
        
                    // Create new reader.
                    const reader = new FileReader();
        
                    // On file uploaded.
                    reader.onload = () => {
                        console.debug("Banner uploaded!");
        
                        // Set Base64 data to bannerData.
                        setBannerData(reader.result);
        
                        console.debug("Banner data => " + bannerData);
        
                        // We're done; Increment uploads.
                        uploads++;
                    };
        
                    // Read banner file.
                    reader.readAsDataURL(banner);
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
                setSubmit(true);
                setValues({
                    id: id,
                    name: values.name,
                    banner: bannerData?.toString() ?? null,
                    url: values.url,
                    category: category,
        
                    description: values.description,
                    description_short: values.descriptionShort,
                    install: values.install,
        
                    downloads: null,
                    screenshots: null,
                    sources: null,
        
                    bremove: values.bremove
                });
            });
        }
    });

    return (
        <>
            {form != null ? (
                <FormikProvider value={form}>
                    <form method="POST" onSubmit={form.handleSubmit}>
                        <h2 className="text-white text-2xl font-bold">General Information</h2>
                        <div className="mb-4">
                            <label className="block text-gray-200 text-sm font-bold mb-2">Image Banner</label>
                            <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image_banner" name="image_banner" type="file" placeholder="Mod Image Banner" onChange={(e) => {
                                setBanner(e.currentTarget.files[0]);
                            }} />

                            <input className="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="bremove" name="image_banner-remove" type="checkbox" /> <label className="inline align-middle text-gray-200 text-sm font-bold mb-2">Remove Current</label>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-200 text-sm font-bold mb-2">Name</label>
                            <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="name" name="name" type="text" placeholder="Mod Name" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-200 text-sm font-bold mb-2">URL</label>
                            <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="url" name="url" type="text" placeholder="bestmods.io/view/value" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-200 text-sm font-bold mb-2">Category</label>
                            <select className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" onChange={(e) => {
                                const val = (e.target.value > 0) ? Number(e.target.value) : null;

                                setCategory(val ?? 0);
                            }}>
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
                            <label className="block text-gray-200 text-sm font-bold mb-2">Short Description</label>
                            <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="descriptionShort" name="descriptionShort" as="textarea" placeholder="Mod Short Description" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-200 text-sm font-bold mb-2">Description</label>
                            <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="description" name="description" as="textarea" placeholder="Mod Description" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-200 text-sm font-bold mb-2">Installation</label>
                            <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="install" name="install" as="textarea" placeholder="Mod Installation" />
                        </div>
                        
                        <h2 className="text-white text-2xl font-bold">Sources</h2>
                        {sourceForm}

                        <h2 className="text-white text-2xl font-bold">Downloads</h2>
                        {downloadForm}

                        <h2 className="text-white text-2xl font-bold">Screenshots</h2>
                        {screenShotForm}

                        <button type="submit" className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">{preUrl == null ? "Add Mod!" : "Edit Mod!"}</button>
                    </form>
                </FormikProvider>) : (
                    <div>Loading</div>
                )}
        </>
    );
};

export default ModForm;