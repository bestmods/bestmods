
import { useFormik, Field } from "formik";
import React, { useState, useMemo } from "react";

import { trpc } from "../../../utils/trpc";

import FormTemplate from '../main';
import { AlertForm } from '../../utils/alert';
import { type Source } from "@prisma/client";
import { type CategoriesWithChildren, type ModWithRelations } from "../../types";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

/* 
    Default values for our relations.
    
    NOTE - We need to stay consistent with Prisma model type. This is why there are unused values added.
*/

const EMPTY_DOWNLOAD_VALUE = {
    name: "",
    url: "",

    modId: 0
};

const EMPTY_SOURCE_VALUE = {
    sourceUrl: "",
    query: "",

    modId: 0,
    primary: false
};

const EMPTY_SCREENSHOT_VALUE = {
    url: "",

    modId: 0
};

const EMPTY_INSTALLER_VALUE = {
    sourceUrl: "",
    url: "",

    modId: 0
};

const EMPTY_CREDIT_VALUE = {
    name: "",
    credit: "",

    id: 0,
    modId: 0,
    userId: null
};

const DownloadForm: React.FC<{
    form: any,
    index: number
}> = ({
    form,
    index
}) => {
    const vals = form?.values?.downloads[index] ?? undefined;

    const name = vals?.name ?? "";
    const url = vals?.url ?? "";

    return (
        <>
            <h3>Download #{index + 1}</h3>

            <div className="form-container">
                <label className="form-label">Name</label>
                <input
                    type="text"
                    className="form-input"
                    name={`downloads[${index}].name`} 
                    value={name}
                    onChange={form.handleChange}
                />
            </div>

            <div className="form-container">
                <label className="form-label">URL</label>
                <input
                    type="text"
                    className="form-input"
                    name={`downloads[${index}].url`} 
                    value={url}
                    onChange={form.handleChange}
                />
            </div>
        </>
    );
};

const ScreenshotForm: React.FC<{
    form: any,
    index: number
}> = ({
    form,
    index
}) => {
    const vals = form?.values?.screenshots[index] ?? undefined;

    const url = vals?.url ?? "";

    return (
        <>
            <h3>Screenshot #{index + 1}</h3>

            <div className="form-container">
                <label className="form-label">URL</label>
                <input
                    type="text"
                    className="form-input" 
                    name={`screenshots[${index}].url`}
                    value={url}
                    onChange={form.handleChange}
                />
            </div>
        </>
    );
}

const SourceForm: React.FC<{ 
    form: any, 
    index: number,
    srcs: Source[] 
}> = ({
    form,
    index,
    srcs 
}) => {
    const vals = form?.values?.sources[index] ?? undefined;

    const src_url = vals?.sourceUrl ?? "";
    const query = vals?.query ?? "";

    return (
        <>
            <h3>Source #{index + 1}</h3>

            <div className="form-container">
                <label className="form-label">Source</label>
                <select 
                    className="form-input"
                    name={`sources[${index}].sourceUrl`}
                    value={src_url}
                    onChange={form.handleChange}
                >
                    {srcs.map((src) => {
                        return (
                            <option key={src.url} value={src.url}>{src.name}</option>
                        );
                    })}
                </select>
            </div>
            
            <div className="form-container">
                <label className="form-label">Query URL</label>
                <input
                    type="text"
                    className="form-input"
                    name={`sources[${index}].query`}
                    value={query}
                    onChange={form.handleChange}
                />
            </div>
        </>
    )
};

const InstallerForm: React.FC<{ 
    form: any 
    index: number, 
    srcs: Source[] 
}> = ({
    form,
    index, 
    srcs 
}) => {
    const vals = form?.values?.installers[index] ?? undefined;

    const src_url = vals?.sourceUrl ?? "";
    const url = vals?.url ?? "";

    return (
        <>
            <h3>Installer #{index + 1}</h3>
            <div className="form-container">
                <label className="form-label">Source</label>
                <select 
                    className="form-input"
                    name={`installers[${index}].sourceUrl`} 
                    value={src_url}
                    onChange={form.handleChange}
                >
                    {srcs.map((src) => {
                        return (
                            <option key={src.url} value={src.url}>{src.name}</option>
                        );
                    })}
                </select>
            </div>
            
            <div className="form-container">
                <label className="form-label">URL</label>
                <input
                    type="text"
                    className="form-input"
                    name={`installers[${index}].url`}
                    value={url}
                    onChange={form.handleChange}
                />
            </div>
        </>
    )
};

const CreditForm: React.FC<{
    form: any,
    index: number
}> = ({
    form,
    index
}) => {
    const vals = form?.values?.credits[index] ?? undefined;

    const name = vals?.name ?? "";
    const credit = vals?.credit ?? "";

    return (
        <>
            <h3>Credit #{index + 1}</h3>
            <div className="form-container">
                <label className="form-label">Name</label>
                <input 
                    type="text" 
                    className="form-input" 
                    name={`credits[${index}].name`} 
                    value={name}
                    onChange={form.handleChange}
                />
            </div>

            <div className="form-container">
                <label className="form-label">Credit</label>
                <input 
                    type="text" 
                    className="form-input" 
                    name={`credits[${index}].credit`}
                    value={credit}
                    onChange={form.handleChange}
                />
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

    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: mod?.name ?? "",
            owner_name: mod?.ownerName ?? "",
            description: mod?.description ?? "",
            description_short: mod?.descriptionShort ?? "",
            install: mod?.install ?? "",
            url: mod?.url ?? "",
            bremove: false,
            downloads: mod?.ModDownload ?? [EMPTY_DOWNLOAD_VALUE],
            sources: mod?.ModSource ?? [EMPTY_SOURCE_VALUE],
            screenshots: mod?.ModScreenshot ?? [EMPTY_SCREENSHOT_VALUE],
            installers: mod?.ModInstaller ?? [EMPTY_INSTALLER_VALUE],
            credits: mod?.ModCredit ?? [EMPTY_CREDIT_VALUE]
        },
        enableReinitialize: true,

        onSubmit: (values) => {
            // Insert into database.
            mod_mut.mutate({
                ...values,
                category: category,
                ...(mod?.id && {
                    id: mod.id
                }),
                ...(bannerData && {
                    banner: bannerData?.toString()
                })
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

    // Downloads form.
    const downloads_form = useMemo(() => {
        const downloads = form.values.downloads;
 
        return (
            <>
                {downloads.map((_download, index) => {                
                    return (
                        <div key={"download" + index} className="form-container">
                            <DownloadForm
                                form={form}
                                index={index}
                            />

                            <button onClick={(e) => {
                                e.preventDefault();

                                const downloads = form.values.downloads;

                                downloads.splice(index, 1);

                                form.setValues({
                                    ...form.values,
                                    downloads
                                });
                            }} className="btn btn-red">Remove</button>
                        </div>
                    );
                })}
                <div className="mb-4">
                    <button onClick={(e) => {
                        e.preventDefault();

                        form.setValues({
                            ...form.values,
                            downloads: [...form.values.downloads, EMPTY_DOWNLOAD_VALUE]
                        });
                    }} className="btn btn-green">Add</button>
                </div>
            </>
        );
    }, [form.values]);

    // Sources form.
    const sources_form = useMemo(() => {
        const sources = form.values.sources;

        return (
            <>
                {sources.map((_source, index) => {
                    return (
                        <div key={"source" + index} className="form-container">
                            <SourceForm
                                form={form}
                                index={index}
                                srcs={srcs}
                            />

                            <button onClick={(e) => {
                                e.preventDefault();

                                const sources = form.values.sources;

                                sources.splice(index, 1);

                                form.setValues({
                                    ...form.values,
                                    sources
                                });
                            }} className="btn btn-red">Remove</button>
                        </div>
                    );
                })}
                <div className="form-container">
                    <button onClick={(e) => {
                        e.preventDefault();

                        form.setValues({
                            ...form.values,
                            sources: [...form.values.sources, EMPTY_SOURCE_VALUE]
                        });
                    }} className="btn btn-green">Add</button>
                </div>
            </>
        );
    }, [form.values]);

    // Screenshots form.
    const screenshots_form = useMemo(() => {
        const screenshots = form.values.screenshots;

        return (
            <>
                {screenshots.map((_screenshot, index) => {
                    return (
                        <div key={"screenshot" + index} className="form-container">
                            <ScreenshotForm
                                form={form}
                                index={index}
                            />

                            <button onClick={(e) => {
                                e.preventDefault();

                                const screenshots = form.values.screenshots;

                                screenshots.splice(index, 1);

                                form.setValues({
                                    ...form.values,
                                    screenshots
                                });
                            }} className="btn btn-red">Remove</button>
                        </div>
                    );
                })}

                <div className="form-container">
                    <button onClick={(e) => {
                        e.preventDefault();

                        form.setValues({
                            ...form.values,
                            screenshots: [...form.values.screenshots, EMPTY_SCREENSHOT_VALUE]
                        });
                    }} className="btn btn-green">Add</button>
                </div>
            </>
        );
    }, [form.values]);

    // Installers form.
    const installers_form = useMemo(() => {
        const installers = form.values.installers;

        return (
            <>
                {installers.map((_installer, index) => {
                    return (
                        <div key={"installer" + index} className="form-container">
                            <InstallerForm
                                form={form}
                                index={index}
                                srcs={srcs}
                            />

                            <button onClick={(e) => {
                                e.preventDefault();

                                const installers = form.values.installers;

                                installers.splice(index, 1);

                                form.setValues({
                                    ...form.values,
                                    installers
                                });
                            }} className="btn btn-red">Remove</button>
                        </div>
                    );
                })}
                <div className="form-container">
                    <button onClick={(e) => {
                        e.preventDefault();

                        form.setValues({
                            ...form.values,
                            installers: [...form.values.installers, EMPTY_INSTALLER_VALUE]
                        });
                    }} className="btn btn-green">Add</button>
                </div>
            </>
        );
    }, [form.values]);

    // Credits form.
    const credits_form = useMemo(() => {
        const credits = form.values.credits;

        return (
            <>
                {credits.map((_credit, index) => {
                    return (
                        <div key={"credit" + index} className="form-container">
                            <CreditForm
                                form={form}
                                index={index}
                            />

                            <button onClick={(e) => {
                                e.preventDefault();

                                const credits = form.values.credits;

                                credits.splice(index, 1);
                                form.setValues({
                                    ...form.values,
                                    credits
                                });
                            }} className="btn btn-red">Remove</button>
                        </div>
                    );
                })}
                <div className="form-container">
                    <button onClick={(e) => {
                        e.preventDefault();

                        form.setValues({
                            ...form.values,
                            credits: [...form.values.credits, EMPTY_CREDIT_VALUE]
                        });
                    }} className="btn btn-green">Add</button>
                </div>
            </>
        );
    }, [form.values]);

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