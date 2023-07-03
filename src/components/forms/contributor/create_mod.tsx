
import { useFormik, Field } from "formik";
import React, { useState, useMemo } from "react";

import { trpc } from "../../../utils/trpc";

import FormTemplate from '../main';
import { AlertForm } from '../../utils/alert';
import { type Source } from "@prisma/client";
import { type CategoriesWithChildren, type ModWithRelations } from "../../types";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

type values_type = {
    owner_name?: string
    description: string
    category?: number
    id?: number
    name: string
    url: string
    banner?: string
    description_short: string
    install: string
    bremove?: boolean
    downloads?: string
    screenshots?: string
    sources?: string
    installers?: string
    credits?: string
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
    src_url: string
    url: string
};

type cre_arr_type = {
    name: string
    credit: string
};

const DownloadForm: React.FC<{
    mod: ModWithRelations | null,
    num: number
}> = ({
    mod,
    num
}) => {
    const nameId = "downloads-" + num + "-name";
    const urlId = "downloads-" + num + "-url";

    return (
        <>
            <h3>Download #{num}</h3>

            <div className="form-container">
                <label className="form-label">Name</label>
                <input className="form-input" name={nameId} id={nameId} defaultValue={mod && mod.ModDownload ? mod.ModDownload[num - 1]?.name ?? "" : ""} type="text" />
            </div>

            <div className="form-container">
                <label className="form-label">URL</label>
                <input className="form-input" name={urlId} id={urlId} defaultValue={mod && mod.ModDownload ? mod.ModDownload[num - 1]?.url ?? "" : ""} type="text" />
            </div>
        </>
    );
};

const ScreenshotForm: React.FC<{
    mod: ModWithRelations | null,
    num: number
}> = ({
    mod,
    num
}) => {
    const url_id = "screenshots-" + num + "-url";

    return (
        <>
            <h3>Screenshot #{num}</h3>

            <div className="form-container">
                <label className="form-label">URL</label>
                <input className="form-input" name={url_id} id={url_id} defaultValue={mod && mod.ModScreenshot ? mod.ModScreenshot[num - 1]?.url ?? "" : ""} type="text" />
            </div>
        </>
    );
}

const SourceForm: React.FC<{ 
    mod: ModWithRelations | null, 
    num: number,
    srcs: Source[] 
}> = ({ mod,
    num,
    srcs 
}) => {
    const src_url = "sources-" + num + "-url";
    const srcQuery = "sources-" + num + "-query";

    const cur_url = mod && mod.ModSource ? mod.ModSource[num - 1]?.sourceUrl ?? "" : "";

    const [srcUrlVal, setSrcUrlVal] = useState(cur_url);

    return (
        <>
            <h3>Source #{num}</h3>

            <div className="form-container">
                <label className="form-label">Source</label>
                <select className="form-input" name={src_url} id={src_url} value={srcUrlVal} onChange={(e) => {
                    const val = e.target.value;

                    setSrcUrlVal(val);
                }}>
                    {srcs.map((src) => {
                        return (
                            <option key={src.url} value={src.url}>{src.name}</option>
                        );
                    })}
                </select>
            </div>
            
            <div className="form-container">
                <label className="form-label">Query URL</label>
                <input className="form-input" name={srcQuery} id={srcQuery} defaultValue={mod && mod.ModSource  ? mod.ModSource[num - 1]?.query ?? "" : ""} type="text" />
            </div>
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
    const src_url = "installers-" + num + "-srcurl";
    const url = "installers-" + num + "-url";

    const cur_url = mod && mod.ModInstaller && mod.ModInstaller[num - 1] ? mod.ModInstaller[num - 1]?.sourceUrl ?? "" : "";

    const [srcUrlVal, setSrcUrlVal] = useState(cur_url);

    return (
        <>
            <h3>Installer #{num}</h3>
            <div className="form-container">
                <label className="form-label">Source</label>
                <select className="form-input" name={src_url} id={src_url} value={srcUrlVal} onChange={(e) => {
                    const val = e.target.value;

                    setSrcUrlVal(val);
                }}>
                    {srcs.map((src) => {
                        return (
                            <option key={src.url} value={src.url}>{src.name}</option>
                        );
                    })}
                </select>
            </div>
            
            <div className="form-container">
                <label className="form-label">URL</label>
                <input className="form-input" name={url} id={url} defaultValue={mod && mod.ModInstaller ? mod.ModInstaller[num - 1]?.url ?? "" : ""} type="text" />
            </div>
        </>
    )
};

const CreditForm: React.FC<{
    mod: ModWithRelations | null,
    num: number
}> = ({
    mod,
    num
}) => {
    const mod_credit = mod?.ModCredit[num - 1];

    const name = mod_credit?.name ?? "";
    const credit = mod_credit?.credit ?? "";

    const name_id = "credits-" + num + "-name";
    const credit_id = "credits-" + num + "-credit";

    return (
        <>
            <h3>Credit #{num}</h3>
            <div className="form-container">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" id={name_id} defaultValue={name} />
            </div>

            <div className="form-container">
                <label className="form-label">Credit</label>
                <input type="text" className="form-input" id={credit_id} defaultValue={credit} />
            </div>
        </>
    );
}

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
            <button type="submit" className="btn btn-blue">{!mod ? "Add Mod!" : "Edit Mod!"}</button>
        </div>;

    // State values we cannot extract from Formik.
    const [category, setCategory] = useState<number | undefined>(mod?.categoryId ?? undefined);

    // States for number of download and screenshot forms to show.
    const [downloadCount, setDownloadCount] = useState(mod?.ModDownload?.length || 1);
    const [screenShotCount, setScreenShotCount] = useState(mod?.ModScreenshot?.length || 1);
    const [sourceCount, setSourceCount] = useState(mod?.ModSource?.length || 1);
    const [installerCount, setInstallerCount] = useState(mod?.ModInstaller?.length || 1);
    const [creditCount, setCreditCount] = useState(mod?.ModCredit?.length || 1);

    // File uploads.
    const [bannerData, setBannerData] = useState<string | ArrayBuffer | null>(null);

    // Queries.
    const mod_mut = trpc.mod.addMod.useMutation();

    // Handle success and error messages.
    if (mod_mut.isSuccess) {
        success = "Successfully added or edited mod!";
        error = null;
    } else if (mod_mut.isError) {
        const err_msg = mod_mut.error.message;

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
        console.error(mod_mut.error);
    }

    //  Handle downloads form.
    const downloads_form = useMemo(() => {
       // Create a range from 1 to download count.
       const range = Array.from({ length: downloadCount }, (_, index) => index + 1);

        return (<>
            {range.map((num) => {                
                return (
                    <div key={"download-" + num} className="form-container">
                        <DownloadForm
                            mod={mod}
                            num={num}
                        />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setDownloadCount(downloadCount - 1);
                        }} className="btn btn-red">Remove</button>
                    </div>
                );
            })}
            <div className="mb-4">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setDownloadCount(downloadCount + 1);
                }} className="btn btn-green">Add</button>
            </div>
        </>);
    }, [downloadCount])


    // Handle screenshots form.
    const screenshots_form = useMemo(() => {
        const range = Array.from({ length: screenShotCount }, (value, index) => index + 1);

        return (<>
            {range.map((num) => {
                return (
                    <div key={"screenshot-" + num} className="form-container">
                        <ScreenshotForm
                            mod={mod}
                            num={num}
                        />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setScreenShotCount(screenShotCount - 1);
                        }} className="btn btn-red">Remove</button>
                    </div>
                );
            })}

            <div className="form-container">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setScreenShotCount(screenShotCount + 1);
                }} className="btn btn-green">Add</button>
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
                    <div key={num} className="form-container">
                        <SourceForm
                            mod={mod}
                            num={num}
                            srcs={srcs}
                        />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setSourceCount(sourceCount - 1);
                        }} className="btn btn-red">Remove</button>
                    </div>
                );
            })}
            <div className="form-container">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setSourceCount(sourceCount + 1);
                }} className="btn btn-green">Add</button>
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
                    <div key={"installer-" + num} className="form-container">
                        <InstallerForm
                            mod={mod}
                            num={num}
                            srcs={srcs}
                        />

                        <button onClick={(e) => {
                            e.preventDefault();

                            // Subtract count.
                            setInstallerCount(installerCount - 1);
                        }} className="btn btn-red">Remove</button>
                    </div>
                );
            })}
            <div className="form-container">
                <button onClick={(e) => {
                    e.preventDefault();

                    // Increment downloads count.
                    setInstallerCount(installerCount + 1);
                }} className="btn btn-green">Add</button>
            </div>
        </>);
    }, [installerCount]);

    const credits_form = useMemo(() => {
        const range = Array.from( { length: creditCount }, (_, index) => index + 1);

        return (
            <>
                {range.map((num) => {
                    return (
                        <div key={"credit-" + num} className="form-container">
                            <CreditForm
                                mod={mod}
                                num={num}
                            />

                            <button onClick={(e) => {
                                e.preventDefault();

                                // Subtract credits count.
                                setCreditCount(prev => prev - 1);
                            }} className="btn btn-red">Remove</button>
                        </div>
                    );
                })}
                <div className="form-container">
                    <button onClick={(e) => {
                        e.preventDefault();

                        // Increment credits count.
                        setCreditCount(prev => prev + 1);
                    }} className="btn btn-green">Add</button>
                </div>
            </>
        );
    }, [creditCount]);

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

            if (typeof window != "undefined" && typeof document != "undefined") {
                // Retrieve values from downloads.
                const dls_arr: Array<dl_arr_type> = [];

                for (let i = 1; i <= 50; i++) {
                    // Retrieve input values.
                    const name = (document.getElementById("downloads-" + i + "-name") as HTMLInputElement)?.value;
                    const url = (document.getElementById("downloads-" + i + "-url") as HTMLInputElement)?.value;
        
                    // Make sure they're valid.
                    if (!name || !url || url.length < 1)
                        continue;

                    // Push to array.
                    dls_arr.push({ 
                        name: name,
                        url: url
                    });
                }

                new_vals.downloads = JSON.stringify(dls_arr);

                // Retrieve values from screenshots.
                const sss_arr: Array<ss_arr_type> = [];

                for (let i = 1; i <= 50; i++) {        
                    // Retrieve input values.
                    const url = (document.getElementById("screenshots-" + i + "-url") as HTMLInputElement)?.value;
        
                    // Make sure they're valid.
                    if (!url || url.length < 1)
                        continue;
        
                    // Push to array.
                    sss_arr.push({ 
                        url: url 
                    });
                }

                new_vals.screenshots = JSON.stringify(sss_arr);

                // Retrieve values from sources.
                const srcs_arr: Array<src_arr_type> = [];

                for (let i = 1; i <= 50; i++) {
                    // Retrieve input values.
                    const url = (document.getElementById("sources-" + i + "-url") as HTMLInputElement)?.value;
                    const query = (document.getElementById("sources-" + i + "-query") as HTMLInputElement)?.value;
        
                    // Make sure they're valid.
                    if (!url || !query || query.length < 1)
                        continue;
        
                    // Push to array.
                    srcs_arr.push({ 
                        url: url,
                        query: query 
                    });
                }

                new_vals.sources = JSON.stringify(srcs_arr);

                // Retrieve values from installers.
                const ins_arr: Array<ins_arr_type> = [];

                for (let i = 1; i <= 50; i++) {
                    // Retrieve input values.
                    const src_url = (document.getElementById("installers-" + i + "-srcurl") as HTMLInputElement)?.value;
                    const url = (document.getElementById("installers-" + i + "-url") as HTMLInputElement)?.value;
        
                    // Make sure they're valid.
                    if (!src_url || !url || url.length < 1)
                        continue;
        
                    // Push to array.
                    ins_arr.push({ 
                        src_url: src_url,
                        url: url
                    });
                }

                new_vals.installers = JSON.stringify(ins_arr);

                // Retrieve values from credits.
                const cre_arr: cre_arr_type[] = [];

                for (let i = 1; i <= 50; i++) {
                    // Retrieve input values.
                    const name = (document.getElementById("credits-" + i + "-name") as HTMLInputElement)?.value;
                    const credit = (document.getElementById("credits-" + i + "-credit") as HTMLInputElement)?.value;

                    // Make sure they're valid.
                    if (!name || !credit)
                        continue;

                    // Push to array.
                    cre_arr.push({
                        name: name,
                        credit: credit
                    });
                }

                new_vals.credits = JSON.stringify(cre_arr);
            }

            // Assign category and ID if any.
            new_vals.id = mod?.id;
            new_vals.category = category;

            // Assign banner data.
            new_vals.banner = bannerData?.toString();

            // Insert into database.
            mod_mut.mutate(new_vals);

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

    // Preview mode.
    const [previewMode, setPreviewMode] = useState(false);

    // Retrieve current values for preview mode.
    let description_val = "N/A";
    let install_val = "N/A";

    if (typeof document !== "undefined" && previewMode) {
        description_val = (document.getElementById("description") as HTMLInputElement)?.value ?? "N/A";
        install_val = (document.getElementById("install") as HTMLInputElement)?.value ?? "N/A";
    }

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
                <h2>General Information</h2>
                <div className="form-container">
                    <label className="form-label">Image Banner</label>
                    <input className="form-input" name="image_banner" type="file" placeholder="Mod Image Banner" onChange={(e) => {
                          const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                          if (file) {
                              const reader = new FileReader();
  
                              reader.onloadend = () => {
                                  setBannerData(reader.result);
                              };
                              
                              reader.readAsDataURL(file);
                          }
                    }} />

                    <Field className="form-checkbox" name="bremove" type="checkbox" /> <label className="form-checkbox-label">Remove Current</label>
                </div>

                <div className="form-container">
                    <label className="form-label">Name</label>
                    <Field className="form-input" name="name" type="text" placeholder="Mod Name" />
                </div>

                <div className="form-container">
                    <label className="form-label">Owner Name</label>
                    <Field className="form-input" name="owner_name" type="text" placeholder="Owner Name If Any" />
                </div>

                <div className="form-container">
                    <label className="form-label">URL</label>
                    <Field className="form-input" name="url" type="text" placeholder="bestmods.io/view/value" />
                </div>

                <div className="form-container">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={category ?? 0} onChange={(e) => {
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

                <div className="form-container">
                    <label className="form-label">Short Description</label>
                    <Field rows="16" cols="32" className="form-input" name="description_short" as="textarea" placeholder="Mod Short Description" />
                </div>

                <div className="form-container">
                    <label className="form-label">Description</label>
                    {previewMode && (
                        <ReactMarkdown className="content-markdown">
                            {description_val}
                        </ReactMarkdown>
                    )}
                    <Field rows="16" cols="32" className={previewMode ? "hidden" : "form-input"} id="description" name="description" as="textarea" placeholder="Mod Description" />
                </div>

                <div className="form-container">
                    <label className="form-label">Installation</label>
                    {previewMode && (
                        <ReactMarkdown className="content-markdown">
                            {install_val}
                        </ReactMarkdown>
                    )}
                    <Field rows="16" cols="32" className={previewMode ? "hidden" : "form-input"} id="install" name="install" as="textarea" placeholder="Mod Installation" />
                </div>

                <h2>Sources</h2>
                {sources_form}

                <h2>Installers</h2>
                {installers_form}

                <h2>Downloads</h2>
                {downloads_form}

                <h2>Screenshots</h2>
                {screenshots_form}

                <h2>Credits</h2>
                {credits_form}

                <div className="form-preview-mode-container">
                    <button type="button" onClick={(e) => {
                        e.preventDefault();

                        setPreviewMode(!previewMode);
                    }}>
                        {previewMode ? (
                            <span>Preview Off</span>
                        ) : (
                            <span>Preview On</span>
                        )}
                    </button>
                </div>
            </FormTemplate>
        </>
    );
};

export default ModForm;