
import { useFormik, FormikProvider, Field } from "formik";
import React, { useState, useEffect, useMemo, useContext } from "react";

import { trpc } from "../../../utils/trpc";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

import FormTemplate from '../main';
import { SessionCtx } from '../../main';
import { AlertForm } from '../../alert';
import { Mod, Source } from "@prisma/client";

const SourceForm: React.FC<{mod: any, num: number, sources: Source[]}> = ({ mod, num, sources }) => {
    const srcUrl = "sources-" + num + "-url";
    const srcQuery = "sources-" + num + "-query";
    
    const curUrl = mod != null && mod.ModSource != null && mod.ModSource[num - 1] != null ? mod.ModSource[num - 1]?.sourceUrl ?? "" : "";

    const [srcUrlVal, setSrcUrlVal] = useState(curUrl);

    useEffect(() => {
        setSrcUrlVal(curUrl);
    }, [mod]);

    return (
        <>
            <h3 className="text-gray-200 text-lg font-bold mb-2">Source #{num}</h3>

            <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Source</label>
            <select className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={srcUrl} id={srcUrl} value={srcUrlVal} onChange={(e) => {
                const val = e.target.value;

                setSrcUrlVal(val);
            }}>
                {sources?.map((src) => {
                    return (
                        <option key={src.url} value={src.url}>{src.name}</option>
                    );
                })}
            </select>

            <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Query URL</label>
            <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={srcQuery} id={srcQuery} defaultValue={mod != null && mod.ModSource != null && mod.ModSource[num - 1] != null ? mod.ModSource[num - 1]?.query ?? "" : ""} type="text" />

        </>
    )
};

const InstallerForm: React.FC<{mod: any, num: number, sources: Source[]}> = ({ mod, num, sources }) => {
    const srcUrl = "installers-" + num + "-srcurl";
    const url = "installers-" + num + "-url";
    
    const curUrl = mod != null && mod.ModInstaller != null && mod.ModInstaller[num - 1] != null ? mod.ModInstaller[num - 1]?.sourceUrl ?? "" : "";

    const [srcUrlVal, setSrcUrlVal] = useState(curUrl);

    useEffect(() => {
        setSrcUrlVal(curUrl);
    }, [mod]);

    return (
        <>
            <h3 className="text-gray-200 text-lg font-bold mb-2">Installer #{num}</h3>

            <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Source</label>
            <select className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={srcUrl} id={srcUrl} value={srcUrlVal} onChange={(e) => {
                const val = e.target.value;

                setSrcUrlVal(val);
            }}>
                {sources?.map((src) => {
                    return (
                        <option key={src.url} value={src.url}>{src.name}</option>
                    );
                })}
            </select>

            <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">URL</label>
            <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={url} id={url} defaultValue={mod != null && mod.ModInstaller != null && mod.ModInstaller[num - 1] != null ? mod.ModInstaller[num - 1]?.url ?? "" : ""} type="text" />

        </>
    )
};

const ModForm: React.FC<{preUrl: string | null}> = ({ preUrl }) => {
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

    const [id, setId] = useState(0);
    const [dataReceived, setDataReceived] = useState(false);

    // Errors and success handles.
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // For submissions.
    const [submit, setSubmit] = useState(false);
    const [values, setValues] = useState<{
        ownerName: string | null,
        description: string;
        category: number;
        id: number;
        name: string;
        url: string;
        banner: string | null;
        descriptionShort: string;
        install: string | null;
        bremove: boolean | null;
        downloads: string | null;
        screenshots: string | null;
        sources: string | null;
        installers: string  | null;
    }>();
    const submitBtn = useMemo(() => {
        return (<>
            <div className="text-center">
                <button type="submit" className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">{preUrl == null ? "Add Mod!" : "Edit Mod!"}</button>
            </div>
        </>);
    }, [preUrl]);

    // State values we cannot extract from Formik.
    const [category, setCategory] = useState(0);

    // States for number of download and screenshot forms to show.
    const [downloadCount, setDownloadCount] = useState(1);
    const [screenShotCount, setScreenShotCount] = useState(1);
    const [sourceCount, setSourceCount] = useState(1);
    const [installerCount, setInstallerCount] = useState(1);

    const [downloadForm, setDownloadForm] = useState<JSX.Element>(<></>);
    const [screenShotForm, setScreenShotForm] = useState<JSX.Element>(<></>);
    const [sourceForm, setSourceForm] = useState<JSX.Element>(<></>);
    const [installerForm, setInstallerForm] = useState<JSX.Element>(<></>);

    // For editing (prefilled fields).
    const [ownerName, setOwnerName] = useState("");
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

    const mod = modQuery.data;

    useEffect(() => {
        if (mod) {
            if (mod.ModDownload != null && mod.ModDownload.length > 1)
                setDownloadCount(mod.ModDownload.length);
            else if (mod.ModScreenshot != null && mod.ModScreenshot.length > 1)
                setScreenShotCount(mod.ModScreenshot.length);
            else if (mod.ModSource != null && mod.ModSource.length > 1)
                setSourceCount(mod.ModSource.length);
            else if (mod.ModInstaller != null && mod.ModInstaller.length > 1)
                setInstallerCount(mod.ModInstaller.length);

            setCategory(mod.categoryId);
        }
    }, [mod]);

    // Form fields.
    const [modFormFields, setModFormFields] = useState<JSX.Element>(<></>);

    useEffect(() => {
        setModFormFields(<>
            <h2 className="text-white text-2xl font-bold">General Information</h2>
            <div className="mb-4">
                <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Image Banner</label>
                <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="image_banner" name="image_banner" type="file" placeholder="Mod Image Banner" onChange={(e) => {
                    setBanner(e.currentTarget.files[0]);
                }} />

                <Field className="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="bremove" name="bremove" type="checkbox" /> <label className="inline align-middle text-gray-200 text-sm font-bold mb-2">Remove Current</label>
            </div>

            <div className="mb-4">
                <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Name</label>
                <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="name" name="name" type="text" placeholder="Mod Name" />
            </div>

            <div className="mb-4">
                <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Owner Name</label>
                <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="ownerName" name="ownerName" type="text" placeholder="Owner Name If Any" />
            </div>

            <div className="mb-4">
                <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">URL</label>
                <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="url" name="url" type="text" placeholder="bestmods.io/view/value" />
            </div>

            <div className="mb-4">
                <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Category</label>
                <select className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" value={category} onChange={(e) => {
                    const val = (e.target.value > 0) ? Number(e.target.value) : null;

                    setCategory(val ?? 0);
                }}>
                    {catsWithChildren?.data?.map((cat) => {
                        // Check if we need to set default category.
                        if (category < 1)
                            setCategory(cat.id);
                        
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
                <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Short Description</label>
                <Field rows="16" cols="32" className="shadow appearance-none border-blue-900 rounded w-full p-6 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="descriptionShort" name="descriptionShort" as="textarea" placeholder="Mod Short Description" />
            </div>

            <div className="mb-4">
                <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Description</label>
                <Field rows="16" cols="32" className="shadow appearance-none border-blue-900 rounded w-full p-6 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="description" name="description" as="textarea" placeholder="Mod Description" />
            </div>

            <div className="mb-4">
                <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Installation</label>
                <Field rows="16" cols="32" className="shadow appearance-none border-blue-900 rounded w-full p-6 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" id="install" name="install" as="textarea" placeholder="Mod Installation" />
            </div>
            
            <h2 className="text-white text-2xl font-bold">Sources</h2>
            {sourceForm}

            <h2 className="text-white text-2xl font-bold">Installers</h2>
            {installerForm}

            <h2 className="text-white text-2xl font-bold">Downloads</h2>
            {downloadForm}

            <h2 className="text-white text-2xl font-bold">Screenshots</h2>
            {screenShotForm}
        </>);
    }, [catsWithChildren.data, sourceForm, downloadForm, screenShotForm, installerForm, category]);
    

    // Handle error messages to client.
    useMemo(() => {
        if (!modMut.isError && modMut.isSuccess) {
            setSuccess("Successfully added or edited mod!");
            setError(null);
        }

        // Make sure we have an actual error.
        if (!modMut.isError)
            return;

        const err = modMut.error.message;

        // Check if we can simplify the error message for client.
        if (err.includes("Error parsing URL"))
            setError("Mod URL is too short or empty (<2 bytes).");
        else if (err.includes("file extension is unknown"))
            setError(err);
        else if (err.includes("base64 data is null"))
            setError("Banner file corrupt/invalid.");
        else if (err.includes("is empty"))
            setError(err);
        else
            setError("Unable to create or edit mod!");

        setSuccess(null);

        // Send alert and log full error to client's console.
        console.error(modMut.error);

    }, [modMut.isError, modMut.isSuccess]);

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
    }, [fetchDls]);


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

    // Handle dynamic installers (uncontrolled input).
    type insArrType = {
        srcUrl: string
        url: string
    }

    const [inssArr, setInssArr] = useState<Array<insArrType>>([]);
    const [fetchInss, setFetchInss] = useState(false);

    useEffect(() => {
        if (!fetchInss || typeof window === 'undefined')
            return;

        let arr: Array<insArrType> = [];

        for (let i = 1; i <= 50; i++) {
            if (typeof window === 'undefined')
                break
    
            const srcUrlEle = document.getElementById("installers-" + i + "-srcurl");
            const urlEle = document.getElementById("installers-" + i + "-url");

            if (srcUrlEle == null || urlEle == null)
                continue;

            const srcUrlVal = (document.getElementById(srcUrlEle.id) as HTMLInputElement).value;
            const urlVal = (document.getElementById(urlEle.id) as HTMLInputElement).value;

            if (urlVal.length < 1)
                continue;

            arr.push({srcUrl: srcUrlVal, url: urlVal});
        }

        if (arr.length > 0)
            setInssArr(arr);

        setFetchInss(false);
    }, [fetchInss]);


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

                        <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Name</label>
                        <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={nameId} id={nameId} defaultValue={mod != null && mod.ModDownload != null && mod.ModDownload[num - 1] != null ? mod.ModDownload[num - 1]?.name ?? "" : ""} type="text" />

                        <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">URL</label>
                        <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={urlId} id={urlId} defaultValue={mod != null && mod.ModDownload != null && mod.ModDownload[num - 1] != null ? mod.ModDownload[num - 1]?.url ?? "" : ""} type="text" />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setDownloadCount(downloadCount - 1);
                        }} className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Remove</button>
                    </div>
                </div>);
            })}
            <div className="mb-4">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setDownloadCount(downloadCount + 1);
                }} className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Add</button>
            </div>
        </>);
    }, [downloadCount, mod]);

    // Handle dynamic dynamic screenshot form.
    useMemo(() => {
        // Create a range from 1 to screenshot count.
        const range = Array.from({length: screenShotCount}, (value, index) => index + 1);

        setScreenShotForm(<>
            {range.map((num) => {
                const urlId = "screenshots-" + num + "-url";

                return (<div key={num} className="mb-4">
                    <div className="mb-4">
                        <h3 className="text-gray-200 text-lg font-bold mb-2">Screenshot #{num}</h3>

                        <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">URL</label>
                        <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={urlId} id={urlId} defaultValue={mod != null && mod.ModScreenshot != null && mod.ModScreenshot[num - 1] != null ? mod.ModScreenshot[num - 1]?.url ?? "" : ""} type="text" />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setScreenShotCount(screenShotCount - 1);
                        }} className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Remove</button>
                    </div>
                </div>);
            })}
            <div className="mb-4">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setScreenShotCount(screenShotCount + 1);
                }} className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Add</button>
            </div>
        </>);
    }, [screenShotCount, mod]);

    // Handle dynamic sources.
    useEffect(() => {
        // Create a range from 1 to sources count.
        const range = Array.from({length: sourceCount}, (value, index) => index + 1);

        // Fetch pre-existing source data for URL select box.
        const sourcesArr = sources.data;

        setSourceForm(<>
            {range.map((num) => {
                return (
                    <>
                        <div key={num} className="mb-4">
                            <SourceForm 
                                mod={mod}
                                num={num}
                                sources={sourcesArr ?? []}
                            />

                            <button onClick={(e) => {
                                e.preventDefault();

                                // Subtract count.
                                setSourceCount(sourceCount - 1);
                            }} className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Remove</button>
                        </div>
                    </>
                );
            })}
            <div className="mb-4">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setSourceCount(sourceCount + 1);
                }} className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Add</button>
            </div>
        </>);

    }, [sourceCount, sources.data, mod]);

    // Handle dynamic installers.
    useEffect(() => {
        // Create a range from 1 to sources count.
        const range = Array.from({length: installerCount}, (value, index) => index + 1);

        // Fetch pre-existing source data for URL select box.
        const sourcesArr = sources.data;

        setInstallerForm(<>
            {range.map((num) => {
                return (
                    <>
                        <div key={num} className="mb-4">
                            <InstallerForm 
                                mod={mod}
                                num={num}
                                sources={sourcesArr ?? []}
                            />

                            <button onClick={(e) => {
                                e.preventDefault();

                                // Subtract count.
                                setInstallerCount(installerCount - 1);
                            }} className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Remove</button>
                        </div>
                    </>
                );
            })}
            <div className="mb-4">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setInstallerCount(installerCount + 1);
                }} className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Add</button>
            </div>
        </>);

    }, [installerCount, sources.data, mod]);

    useEffect(() => {
        if (!dataReceived) {
            // Retrieve mod.
            const mod = modQuery.data;
    
            // Check if our mod is null.
            if (mod != null) {
                setId(mod.id);

                setOwnerName(mod.ownerName);
                setName(mod.name);
                setUrl(mod.url);
                setDescription(mod.description);
                setDescriptionShort(mod.descriptionShort ?? "");
                setInstall(mod.install ?? "");

                setDataReceived(true);
            }
        }
    
    }, [modQuery.data]);

    useEffect(() => {
        // Make sure we are submitting, values are valid, and we aren't still fetching relation data.
        if (!submit || !values || fetchDls || fetchSss || fetchSrcs || fetchInss)
            return;

        // Create new values.
        const newVals = values;

        // Convert relation arrays to JSON string.
        const dlsStr = JSON.stringify(dlsArr);
        const sssStr = JSON.stringify(sssArr);
        const srcsStr = JSON.stringify(srcsArr);
        const inssStr = JSON.stringify(inssArr);

        // Assign relation data to new values now.
        newVals.downloads = dlsStr;
        newVals.screenshots = sssStr;
        newVals.sources = srcsStr;
        newVals.installers = inssStr;

        // Assign banner data.
        newVals.banner = bannerData?.toString() ?? null;
        
        // Insert into database.
        modMut.mutate(newVals);

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
    }, [submit, values, fetchDls, fetchSss, fetchSrcs, fetchInss]);


    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: name,
            ownerName: ownerName,
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
            setFetchInss(true);

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
                    id: id,

                    ownerName: values.ownerName,

                    name: values.name,
                    url: values.url,
                    category: category,
                    banner: null,
        
                    description: values.description,
                    descriptionShort: values.descriptionShort,
                    install: values.install,
        
                    downloads: null,
                    screenshots: null,
                    sources: null,
                    installers: null,
        
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
                content={modFormFields}
                submitBtn={submitBtn}
            ></FormTemplate>
        </>
    );
};

export default ModForm;