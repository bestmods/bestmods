import Markdown from "@components/markdown/markdown";
import { ErrorCtx, SuccessCtx } from "@pages/_app";
import { type Source } from "@prisma/client";
import { GetContents } from "@utils/file";
import { trpc } from "@utils/trpc";
import { Field, Form, Formik } from "formik";
import React, { useContext, useState } from "react";
import { type CategoryWithChildren } from "~/types/category";
import { type ModWithRelations } from "~/types/mod";

const EMPTY_DOWNLOAD = {
    name: "",
    url: "",

    modId: 0
}

const EMPTY_SOURCE = {
    sourceUrl: "",
    query: "",

    modId: 0,
    primary: false
}

const EMPTY_SCREENSHOT = {
    url: "",

    modId: 0
}

const EMPTY_INSTALLER = {
    sourceUrl: "",
    url: "",

    modId: 0
}

const EMPTY_CREDIT = {
    name: "",
    credit: "",

    id: 0,
    modId: 0,
    userId: null
}

export default function ModForm ({
    mod,
    sources,
    categories,
} : {
    mod?: ModWithRelations
    sources: Source[]
    categories: CategoryWithChildren[]
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Mutations.
    const mut = trpc.mod.add.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle(`Failed To ${mod ? `Save` : `Add`} Mod`);
                errorCtx.setMsg(`Failed to ${mod ? `save` : `add`} mod. Please check the console for more information.`)
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${mod ? "Saved" : "Added"} Source!`);
                successCtx.setMsg(`Successfully ${mod ? `saved` : `added`} source!`);
            }
        }
    });

    // Banners & icons.
    const [banner, setBanner] = useState<string | ArrayBuffer | null>(null);

    // Preview mode.
    const [previewMode, setPreviewMode] = useState(false);

    return (
        <Formik
            initialValues={{
                visible: mod?.visible ?? true,
                categoryId: mod?.categoryId ?? 0,
                name: mod?.name ?? "",
                ownerName: mod?.ownerName ?? "",
                description: mod?.description ?? "",
                descriptionShort: mod?.descriptionShort ?? "",
                url: mod?.url ?? "",
                install: mod?.install ?? "",
                
                downloads: mod?.ModDownload ?? [EMPTY_DOWNLOAD],
                sources: mod?.ModSource ?? [EMPTY_SOURCE],
                screenshots: mod?.ModScreenshot ?? [EMPTY_SCREENSHOT],
                installers: mod?.ModInstaller ?? [EMPTY_INSTALLER],
                credits: mod?.ModCredit ?? [EMPTY_CREDIT],

                bremove: false
            }}
            onSubmit={(values) => {
                mut.mutate({
                    ...values,
                    banner: banner?.toString(),
                    category: values.categoryId || undefined,
                    id: mod?.id,
                })
            }}
        >
            {(form) => (
                <Form>
                    <h2>General</h2>
                    <div className="form-container">
                        <label htmlFor="icon">Banner</label>
                        <input
                            type="file"
                            className="form-input"
                            name="banner"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const contents = await GetContents(file);
                                    setBanner(contents);
                                }
                            }}
                        />

                        {mod?.banner && (
                            <div className="form-checkbox">
                                <Field
                                    type="checkbox"
                                    name="bremove"
                                />
                                <label htmlFor="bremove">Remove Current</label>
                            </div>
                        )}
                    </div>
                    <div className="form-div">
                        <label htmlFor="categoryId">Category</label>
                        {previewMode ? (
                            <p>{form.values.categoryId?.toString()}</p>
                        ) : (
                            <select
                                name="categoryId"
                                value={form.values.categoryId}
                                onChange={form.handleChange}
                                onBlur={form.handleBlur}
                            >
                            <option value={0}>None</option>
                                {categories.map((category) => {
                                    return (
                                        <React.Fragment key={`category-${category.id.toString()}`}>
                                            <option value={category.id}>{category.name}</option>

                                            {category.children.map((categoryChild) => {
                                                return (
                                                    <option
                                                        key={`category-${categoryChild.id.toString()}`}
                                                        value={categoryChild.id}
                                                    >-- {categoryChild.name}</option>
                                                )
                                            })}
                                        </React.Fragment>
                                    )
                                })}
                            </select>
                        )}
                    </div>
                    <div className="form-container">
                        <label htmlFor="name">Name</label>
                        {previewMode ? (
                            <p>{form.values.name}</p>
                        ) : (
                            <Field
                                name="name"
                                placeholder="Mod Name..."
                            />
                        )}
                        
                    </div>
                    <div className="form-container">
                        <label htmlFor="ownerName">Owner Name</label>
                        {previewMode ? (
                            <p>{form.values.ownerName}</p>
                        ) : (
                            <Field
                                name="ownerName"
                                placeholder="Mod Owner Name..."
                            />
                        )}
                        
                    </div>
                    <div className="form-container">
                        <label htmlFor="name">URL</label>
                        {previewMode ? (
                            <p>{form.values.url}</p>
                        ) : (
                            <Field
                                name="url"
                                placeholder="Mod URL..."
                            />
                        )}
                        
                    </div>
                    <div className="form-container">
                        <label htmlFor="descriptionShort">Short Description</label>
                        {previewMode ? (
                            <Markdown rehype={true}>
                                {form.values.descriptionShort}
                            </Markdown>
                        ) : (
                            <Field
                                as="textarea"
                                rows={16}
                                cols={32}
                                name="descriptionShort"
                                placeholder="Mod short description..."
                            />
                        )}
                        
                    </div>
                    <div className="form-container">
                        <label htmlFor="description">Description</label>
                        {previewMode ? (
                            <Markdown rehype={true}>
                                {form.values.description}
                            </Markdown>
                        ) : (
                            <Field
                                as="textarea"
                                rows={16}
                                cols={32}
                                name="description"
                                placeholder="Mod description..."
                            />
                        )}
                    </div>
                    <div className="form-container">
                        <label htmlFor="install">Installation</label>
                        {previewMode ? (
                            <Markdown rehype={true}>
                                {form.values.install}
                            </Markdown>
                        ) : (
                            <Field
                                as="textarea"
                                rows={16}
                                cols={32}
                                name="install"
                                placeholder="Mod installation..."
                            />
                        )}
                        
                    </div>
                    <h2>Downloads</h2>
                    <div className="mod-form-relation">
                        <div>
                            {form.values.downloads.map((_download, index) => {
                                return (
                                    <div
                                        key={`download-${index.toString()}`}
                                    >
                                        <h3>Download #{(index + 1).toString()}</h3>
                                        <div>
                                            <div className="form-div">
                                                <label htmlFor={`downloads[${index.toString()}].name`}>Name</label>

                                                {previewMode ? (
                                                    <p>{form.values.downloads?.[index]?.name ?? "N/A"}</p>
                                                ) : (
                                                    <Field
                                                        name={`downloads[${index.toString()}].name`}
                                                    />
                                                )}
                                            </div>
                                            <div className="form-div">
                                                <label htmlFor={`downloads[${index.toString()}].url`}>URL</label>

                                                {previewMode ? (
                                                    <p>{form.values.downloads?.[index]?.url ?? "N/A"}</p>
                                                ) : (
                                                    <Field
                                                        name={`downloads[${index.toString()}].url`}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-danger"
                                                onClick={(e) => {
                                                    e.preventDefault();

                                                    const downloads = form.values.downloads;

                                                    downloads.splice(index, 1);

                                                    form.setValues({
                                                        ...form.values,
                                                        downloads: downloads
                                                    });
                                                }}
                                            >Remove</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div>
                            <button
                                className="btn btn-success"
                                onClick={(e) => {
                                    e.preventDefault();

                                    form.setValues({
                                        ...form.values,
                                        downloads: [...form.values.downloads, EMPTY_DOWNLOAD]
                                    });
                                }}
                            >Add Download</button>
                        </div>
                    </div>
                    <h2>Sources</h2>
                    <div className="mod-form-relation">
                        <div>
                            {form.values.sources.map((_source, index) => {
                                return (
                                    <div
                                        key={`source-${index.toString()}`}
                                    >
                                        <h3>Source #{(index + 1).toString()}</h3>
                                        <div>
                                            <div className="form-div">
                                                <label htmlFor={`sources[${index.toString()}].sourceUrl`}>Source</label>

                                                {previewMode ? (
                                                    <p>{form.values.sources?.[index]?.sourceUrl ?? "N/A"}</p>
                                                ) : (
                                                    <select
                                                        name={`sources[${index.toString()}].sourceUrl`}
                                                        value={form.values.sources[index]?.sourceUrl}
                                                        onChange={form.handleChange}
                                                        onBlur={form.handleBlur}
                                                    >
                                                        {sources.map((source, index) => {
                                                            return (
                                                                <option
                                                                    key={`source-${index.toString()}`}
                                                                    value={source.url}
                                                                >{source.name}</option>
                                                            )
                                                        })}
                                                    </select>
                                                )}
                                            </div>
                                            <div className="form-div">
                                                <label htmlFor={`sources[${index.toString()}].query`}>Query</label>

                                                {previewMode ? (
                                                    <p>{form.values.sources?.[index]?.query ?? "N/A"}</p>
                                                ) : (
                                                    <Field
                                                        name={`sources[${index.toString()}].query`}
                                                    />
                                                )}
                                            </div>
                                            <div className="form-div">
                                                <label htmlFor={`sources[${index.toString()}].primary`}>Primary</label>

                                                {previewMode ? (
                                                    <p>{form.values.sources?.[index]?.primary ? "Yes" : "No"}</p>
                                                ) : (
                                                    <>
                                                        <Field
                                                            as="checkbox"
                                                            name={`sources[${index.toString()}].primary`}
                                                        /> <span>Yes</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-danger"
                                                onClick={(e) => {
                                                    e.preventDefault();

                                                    const sources = form.values.sources;

                                                    sources.splice(index, 1);

                                                    form.setValues({
                                                        ...form.values,
                                                        sources: sources
                                                    });
                                                }}
                                            >Remove</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div>
                            <button
                                className="btn btn-success"
                                onClick={(e) => {
                                    e.preventDefault();

                                    form.setValues({
                                        ...form.values,
                                        sources: [...form.values.sources, EMPTY_SOURCE]
                                    });
                                }}
                            >Add Source</button>
                        </div>
                    </div>
                    <h2>Installers</h2>
                    <div className="mod-form-relation">
                        <div>
                            {form.values.installers.map((_installer, index) => {
                                return (
                                    <div
                                        key={`installer-${index.toString()}`}
                                    >
                                        <h3>Installer #{(index + 1).toString()}</h3>
                                        <div>
                                            <div className="form-div">
                                                <label htmlFor={`installers[${index.toString()}].sourceUrl`}>Source</label>

                                                {previewMode ? (
                                                    <p>{form.values.installers?.[index]?.sourceUrl ?? "N/A"}</p>
                                                ) : (
                                                    <select
                                                        name={`installers[${index.toString()}].sourceUrl`}
                                                        value={form.values.installers[index]?.sourceUrl}
                                                        onChange={form.handleChange}
                                                        onBlur={form.handleBlur}
                                                    >
                                                        {sources.map((source, index) => {
                                                            return (
                                                                <option
                                                                    key={`source-${index.toString()}`}
                                                                    value={source.url}
                                                                >{source.name}</option>
                                                            )
                                                        })}
                                                    </select>
                                                )}
                                            </div>
                                            <div className="form-div">
                                                <label htmlFor={`installers[${index.toString()}].url`}>URL</label>

                                                {previewMode ? (
                                                    <p>{form.values.installers?.[index]?.url ?? "N/A"}</p>
                                                ) : (
                                                    <Field
                                                        name={`installers[${index.toString()}].url`}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-danger"
                                                onClick={(e) => {
                                                    e.preventDefault();

                                                    const installers = form.values.installers;

                                                    installers.splice(index, 1);

                                                    form.setValues({
                                                        ...form.values,
                                                        installers: installers
                                                    });
                                                }}
                                            >Remove</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div>
                            <button
                                className="btn btn-success"
                                onClick={(e) => {
                                    e.preventDefault();

                                    form.setValues({
                                        ...form.values,
                                        installers: [...form.values.installers, EMPTY_INSTALLER]
                                    });
                                }}
                            >Add Installer</button>
                        </div>
                    </div>
                    <h2>Screenshots</h2>
                    <div className="mod-form-relation">
                        <div>
                            {form.values.screenshots.map((_screenshot, index) => {
                                return (
                                    <div
                                        key={`screenshot-${index.toString()}`}
                                    >
                                        <h3>Screenshot #{(index + 1).toString()}</h3>
                                        <div>
                                            <div className="form-div">
                                                <label htmlFor={`screenshots[${index.toString()}].url`}>URL</label>

                                                {previewMode ? (
                                                    <p>{form.values.screenshots?.[index]?.url ?? "N/A"}</p>
                                                ) : (
                                                    <Field
                                                        name={`screenshots[${index.toString()}].url`}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-danger"
                                                onClick={(e) => {
                                                    e.preventDefault();

                                                    const screenshots = form.values.screenshots;

                                                    screenshots.splice(index, 1);

                                                    form.setValues({
                                                        ...form.values,
                                                        screenshots: screenshots
                                                    });
                                                }}
                                            >Remove</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div>
                            <button
                                className="btn btn-success"
                                onClick={(e) => {
                                    e.preventDefault();

                                    form.setValues({
                                        ...form.values,
                                        screenshots: [...form.values.screenshots, EMPTY_SCREENSHOT]
                                    });
                                }}
                            >Add Screenshot</button>
                        </div>
                    </div>
                    <h2>Credits</h2>
                    <div className="mod-form-relation">
                        <div>
                            {form.values.credits.map((_credit, index) => {
                                return (
                                    <div
                                        key={`credit-${index.toString()}`}
                                    >
                                        <h3>Credit #{(index + 1).toString()}</h3>
                                        <div>
                                            <div className="form-div">
                                                <label htmlFor={`credits[${index.toString()}].name`}>Name</label>

                                                {previewMode ? (
                                                    <p>{form.values.credits?.[index]?.name ?? "N/A"}</p>
                                                ) : (
                                                    <Field
                                                        name={`credits[${index.toString()}].name`}
                                                    />
                                                )}
                                            </div>
                                            <div className="form-div">
                                                <label htmlFor={`credits[${index.toString()}].credit`}>Credit</label>

                                                {previewMode ? (
                                                    <p>{form.values.credits?.[index]?.credit ?? "N/A"}</p>
                                                ) : (
                                                    <Field
                                                        name={`credits[${index.toString()}].credit`}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-danger"
                                                onClick={(e) => {
                                                    e.preventDefault();

                                                    const credits = form.values.credits;

                                                    credits.splice(index, 1);

                                                    form.setValues({
                                                        ...form.values,
                                                        credits: credits
                                                    });
                                                }}
                                            >Remove</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div>
                            <button
                                className="btn btn-success"
                                onClick={(e) => {
                                    e.preventDefault();

                                    form.setValues({
                                        ...form.values,
                                        credits: [...form.values.credits, EMPTY_CREDIT]
                                    });
                                }}
                            >Add Screenshot</button>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button type="submit" className="btn btn-primary">{mod ? "Save" : "Add"} Mod!</button>
                        <button
                            className="btn btn-secondary"
                            onClick={(e) => {
                                e.preventDefault();

                                setPreviewMode(!previewMode);
                            }}
                        >{previewMode ? "Preview Off" : "Preview On"}</button>
                    </div>
                </Form>    
            )}

        </Formik>
    )
}