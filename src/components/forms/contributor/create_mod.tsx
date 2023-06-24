
import { useFormik, Field } from "formik";
import React, { useState, useEffect, useMemo } from "react";

import { trpc } from "../../../utils/trpc";

import FormTemplate from '../main';
import { AlertForm } from '../../alert';
import { type Source } from "@prisma/client";
import { type CategoriesWithChildren, type ModWithRelations } from "../../types";

type values_type = {
    owner_name?: string | null
    description: string
    category?: number | null
    id?: number | null
    name: string
    url: string
    banner?: string | null
    description_short: string
    install: string | null
    bremove?: boolean
    downloads?: string | null
    screenshots?: string | null
    sources?: string | null
    installers?: string | null
};

type dl_arr_type = {
    name: string
    url: string
};

type ss_arr_type = {
    url: string
};

type src_arr_type = {
    url: string
    query: string
};

type ins_arr_type = {
    srcUrl: string
    url: string
}

const DownloadForm: React.FC<{
    mod: ModWithRelations | null,
    num: number
}> = ({
    mod,
    num
}) => {
    const nameId = "downloads-" + num + "-name";
    const urlId = "downloads-" + num + "-url";

    return (<>
        <div className="mb-4">
            <h3 className="text-gray-200 text-lg font-bold mb-2">Download #{num}</h3>

            <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Name</label>
            <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={nameId} id={nameId} defaultValue={mod != null && mod.ModDownload != null && mod.ModDownload[num - 1] != null ? mod.ModDownload[num - 1]?.name ?? "" : ""} type="text" />

            <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">URL</label>
            <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={urlId} id={urlId} defaultValue={mod != null && mod.ModDownload != null && mod.ModDownload[num - 1] != null ? mod.ModDownload[num - 1]?.url ?? "" : ""} type="text" />
        </div>
    </>);
};

const ScreenshotForm: React.FC<{
    mod: ModWithRelations | null,
    num: number
}> = ({
    mod,
    num
}) => {
    const url_id = "screenshots-" + num + "-url";

    return (<>
        <h3 className="text-gray-200 text-lg font-bold mb-2">Screenshot #{num}</h3>

        <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">URL</label>
        <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={url_id} id={url_id} defaultValue={mod && mod.ModScreenshot && mod.ModScreenshot[num - 1] != null ? mod.ModScreenshot[num - 1]?.url ?? "" : ""} type="text" />
    </>);
}

const SourceForm: React.FC<{ 
    mod: ModWithRelations | null, 
    num: number,
    srcs: Source[] 
}> = ({ mod,
    num,
    srcs 
}) => {
    const srcUrl = "sources-" + num + "-url";
    const srcQuery = "sources-" + num + "-query";

    const curUrl = mod && mod.ModSource && mod.ModSource[num - 1] != undefined ? mod.ModSource[num - 1]?.sourceUrl ?? "" : "";

    const [srcUrlVal, setSrcUrlVal] = useState(curUrl);

    return (
        <>
            <h3 className="text-gray-200 text-lg font-bold mb-2">Source #{num}</h3>

            <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Source</label>
            <select className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={srcUrl} id={srcUrl} value={srcUrlVal} onChange={(e) => {
                const val = e.target.value;

                setSrcUrlVal(val);
            }}>
                {srcs.map((src) => {
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

const InstallerForm: React.FC<{ 
    mod: ModWithRelations | null, 
    num: number, 
    srcs: Source[] 
}> = ({ 
    mod, 
    num, 
    srcs 
}) => {
    const srcUrl = "installers-" + num + "-srcurl";
    const url = "installers-" + num + "-url";

    const curUrl = mod && mod.ModInstaller && mod.ModInstaller[num - 1] ? mod.ModInstaller[num - 1]?.sourceUrl ?? "" : "";

    const [srcUrlVal, setSrcUrlVal] = useState(curUrl);

    return (
        <>
            <h3 className="text-gray-200 text-lg font-bold mb-2">Installer #{num}</h3>

            <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Source</label>
            <select className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name={srcUrl} id={srcUrl} value={srcUrlVal} onChange={(e) => {
                const val = e.target.value;

                setSrcUrlVal(val);
            }}>
                {srcs.map((src) => {
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

const ModForm: React.FC<{
    cats: CategoriesWithChildren[],
    srcs: Source[],
    mod: ModWithRelations | null 
}> = ({
    cats,
    srcs,
    mod
 }) => {
    // Errors and success handles.
    let error: string | null = null;
    let success: string | null = null;

    // Submit button.
    const submitBtn =
        <div className="text-center">
            <button type="submit" className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">{!mod ? "Add Mod!" : "Edit Mod!"}</button>
        </div>;

    // State values we cannot extract from Formik.
    const [category, setCategory] = useState<number | null>(mod?.categoryId ?? null);

    // States for number of download and screenshot forms to show.
    const [downloadCount, setDownloadCount] = useState(mod?.ModDownload?.length ?? 1);
    const [screenShotCount, setScreenShotCount] = useState(mod?.ModScreenshot?.length ?? 1);
    const [sourceCount, setSourceCount] = useState(mod?.ModSource?.length ?? 1);
    const [installerCount, setInstallerCount] = useState(mod?.ModInstaller?.length ?? 1);

    // File uploads.
    const [bannerData, setBannerData] = useState<string | ArrayBuffer | null>(null);

    // Queries.
    const modMut = trpc.mod.addMod.useMutation();

    // Handle success and error messages.
    if (modMut.isSuccess) {
        success = "Successfully added or edited mod!";
        error = null;
    } else if (modMut.isError) {
        const err_msg = modMut.error.message;

        // Check if we can simplify the error message for client.
        if (err_msg.includes("Error parsing URL"))
            error = "Mod URL is too short or empty (<2 bytes).";
        else if (err_msg.includes("file extension is unknown"))
            error = err_msg;
        else if (err_msg.includes("base64 data is null"))
            error = "Banner file corrupt/invalid.";
        else if (err_msg.includes("is empty"))
            error = err_msg;
        else
            error = "Unable to create or edit mod!";

        success = null;

        // Send alert and log full error to client's console.
        console.error(modMut.error);
    }

    //  Handle downloads form.
    const downloads_form = useMemo(() => {
       // Create a range from 1 to download count.
       const range = Array.from({ length: downloadCount }, (_, index) => index + 1);

        return (<>
            {range.map((num) => {                
                return (
                    <div key={"download-" + num} className="mb-4">
                        <DownloadForm
                            mod={mod}
                            num={num}
                        />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setDownloadCount(downloadCount - 1);
                        }} className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Remove</button>
                    </div>
                );
            })}
            <div className="mb-4">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setDownloadCount(downloadCount + 1);
                }} className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Add</button>
            </div>
        </>);
    }, [downloadCount])


    // Handle screenshots form.
    const screenshots_form = useMemo(() => {
        const range = Array.from({ length: screenShotCount }, (value, index) => index + 1);

        return (<>
            {range.map((num) => {
                return (
                    <div key={"screenshot-" + num} className="mb-4">
                        <ScreenshotForm
                            mod={mod}
                            num={num}
                        />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setScreenShotCount(screenShotCount - 1);
                        }} className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Remove</button>
                    </div>
                );
            })}

            <div className="mb-4">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setScreenShotCount(screenShotCount + 1);
                }} className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Add</button>
            </div>
        </>);
    }, [screenShotCount]);

    // Handle sources form.
    const sources_form = useMemo(() => {
        // Create a range from 1 to sources count.
        const range = Array.from({ length: sourceCount }, (_, index) => index + 1);

        return (<>
            {range.map((num) => {

                return (
                    <div key={num} className="mb-4">
                        <SourceForm
                            mod={mod}
                            num={num}
                            srcs={srcs}
                        />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setSourceCount(sourceCount - 1);
                        }} className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Remove</button>
                    </div>
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
    }, [sourceCount]);

    // Handle installers form.
    const installers_form = useMemo(() => {
        // Create a range from 1 to sources count.
        const range = Array.from({ length: installerCount }, (_, index) => index + 1);

        return (<>
            {range.map((num) => {
                return (
                    <div key={"installer-" + num} className="mb-4">
                        <InstallerForm
                            mod={mod}
                            num={num}
                            srcs={srcs}
                        />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setInstallerCount(installerCount - 1);
                        }} className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 mt-2">Remove</button>
                    </div>
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
    }, [installerCount]);

    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: mod?.name ?? "",
            owner_name: mod?.ownerName ?? "",
            description: mod?.description ?? "",
            description_short: mod?.descriptionShort ?? "",
            install: mod?.install ?? "",
            url: mod?.url ?? "",
            bremove: false
        },
        enableReinitialize: true,

        onSubmit: (values) => {
            // Create new values.
            const new_vals: values_type = values;

            // Retrieve values from downloads.
            const dls_arr: Array<dl_arr_type> = [];

            for (let i = 1; i <= 50; i++) {
                const nameEle = document.getElementById("downloads-" + i + "-name");
                const urlEle = document.getElementById("downloads-" + i + "-url");
    
                if (nameEle == null || urlEle == null)
                    continue;
    
                const nameVal = (document.getElementById(nameEle.id) as HTMLInputElement).value;
                const urlVal = (document.getElementById(urlEle.id) as HTMLInputElement).value;
    
                if (urlVal.length < 1)
                    continue;
    
                    dls_arr.push({ name: nameVal, url: urlVal });
            }

            new_vals.downloads = JSON.stringify(dls_arr);

            // Retrieve values from screenshots.
            const sss_arr: Array<ss_arr_type> = [];

            for (let i = 1; i <= 50; i++) {
                if (typeof window === 'undefined')
                    break
    
                const urlEle = document.getElementById("screenshots-" + i + "-url");
    
                if (urlEle == null)
                    break;
    
                const urlVal = (document.getElementById(urlEle.id) as HTMLInputElement).value;
    
                if (urlVal.length < 1)
                    continue;
    
                    sss_arr.push({ url: urlVal });
            }

            new_vals.screenshots = JSON.stringify(sss_arr);

            // Retrieve values from sources.
            const srcs_arr: Array<src_arr_type> = [];

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
    
                    srcs_arr.push({ url: urlVal, query: queryVal });
            }

            new_vals.sources = JSON.stringify(srcs_arr);

            // Retrieve values from installers.
            const ins_arr: Array<ins_arr_type> = [];

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
    
                ins_arr.push({ srcUrl: srcUrlVal, url: urlVal });
            }

            new_vals.installers = JSON.stringify(ins_arr);

            // Assign category and ID if any.
            new_vals.id = mod?.id ?? null;
            new_vals.category = category;

            // Assign banner data.
            new_vals.banner = bannerData?.toString() ?? null;

            // Insert into database.
            modMut.mutate(new_vals);

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
                <h2 className="text-white text-2xl font-bold">General Information</h2>
                <div className="mb-4">
                    <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Image Banner</label>
                    <input className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="image_banner" type="file" placeholder="Mod Image Banner" onChange={(e) => {
                          const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                          if (file) {
  
                              const reader = new FileReader();
  
                              reader.onloadend = () => {
                                  setBannerData(reader.result);
                              };
                              
                              reader.readAsDataURL(file);
                          }
                    }} />

                    <Field className="inline align-middle border-blue-900 rounded py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="bremove" type="checkbox" /> <label className="inline align-middle text-gray-200 text-sm font-bold mb-2">Remove Current</label>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Name</label>
                    <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="name" type="text" placeholder="Mod Name" />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Owner Name</label>
                    <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="owner_name" type="text" placeholder="Owner Name If Any" />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">URL</label>
                    <Field className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="url" type="text" placeholder="bestmods.io/view/value" />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Category</label>
                    <select className="shadow appearance-none border-blue-900 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" value={category ?? 0} onChange={(e) => {
                        const val = e.target.value;

                        if (val)
                            setCategory(Number(val));
                    }}>
                        <option value="0">None</option>
                        {cats.map((cat) => {
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
                    <Field rows="16" cols="32" className="shadow appearance-none border-blue-900 rounded w-full p-6 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="description_short" as="textarea" placeholder="Mod Short Description" />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Description</label>
                    <Field rows="16" cols="32" className="shadow appearance-none border-blue-900 rounded w-full p-6 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="description" as="textarea" placeholder="Mod Description" />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-200 text-sm mt-4 font-bold mb-2">Installation</label>
                    <Field rows="16" cols="32" className="shadow appearance-none border-blue-900 rounded w-full p-6 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline" name="install" as="textarea" placeholder="Mod Installation" />
                </div>

                <h2 className="text-white text-2xl font-bold">Sources</h2>
                {sources_form}

                <h2 className="text-white text-2xl font-bold">Installers</h2>
                {installers_form}

                <h2 className="text-white text-2xl font-bold">Downloads</h2>
                {downloads_form}

                <h2 className="text-white text-2xl font-bold">Screenshots</h2>
                {screenshots_form}
            </FormTemplate>
        </>
    );
};

export default ModForm;