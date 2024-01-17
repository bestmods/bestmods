import Markdown from "@components/markdown/markdown";
import { ErrorCtx, SuccessCtx } from "@pages/_app";
import { type Source } from "@prisma/client";
import { GetContents } from "@utils/file";
import { trpc } from "@utils/trpc";
import { Field, FieldArray, Form, Formik } from "formik";
import React, { useContext, useState } from "react";
import { type CategoryWithChildren } from "~/types/category";
import { type ModWithRelations } from "~/types/mod";
import FormCheckbox from "../checkbox";
import ScrollToTop from "@utils/scroll";

import { DatePickerField } from "@components/date_field";

export default function ModForm ({
    mod,
    sources,
    categories,
    className
} : {
    mod?: ModWithRelations
    sources: Source[]
    categories: CategoryWithChildren[]
    className?: string
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const EMPTY_DOWNLOAD = {
        name: "",
        url: "",

        size: 0,
        uploadDate: null,
    
        modId: 0
    }
    
    const EMPTY_SOURCE = {
        sourceUrl: sources?.[0]?.url ?? "",
        query: "",
    
        modId: 0,
        primary: false
    }
    
    const EMPTY_SCREENSHOT = {
        url: "",
    
        modId: 0
    }
    
    const EMPTY_INSTALLER = {
        sourceUrl: sources?.[0]?.url ?? "",
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

    const EMPTY_REQUIRED = {
        sId: 0,
        dId: 0
    }

    // Mutations.
    const mut = trpc.mod.add.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle(`Failed To ${mod ? `Save` : `Add`} Mod`);
                errorCtx.setMsg(`Failed to ${mod ? `save` : `add`} mod. Please check the console for more information.`);

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${mod ? "Saved" : "Added"} Mod!`);
                successCtx.setMsg(`Successfully ${mod ? `saved` : `added`} Mod!`);

                ScrollToTop();
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
                version: mod?.version ?? "",

                bremove: false,

                nsfw: mod?.nsfw ?? false,
                autoUpdate: mod?.autoUpdate ?? false,
                
                // We need to loop through each download and ensure uploadDate isn't a string to prevent annoying errors. If it is a st ring, convert to a Date object.
                downloads: mod?.ModDownload?.map((dl) => ({
                    ...dl,
                    uploadDate: dl.uploadDate ? new Date(dl.uploadDate) : null
                })) ?? [EMPTY_DOWNLOAD],
                sources: mod?.ModSource ?? [EMPTY_SOURCE],
                screenshots: mod?.ModScreenshot ?? [EMPTY_SCREENSHOT],
                installers: mod?.ModInstaller ?? [EMPTY_INSTALLER],
                credits: mod?.ModCredit ?? [EMPTY_CREDIT],
                required: mod?.requiredSrc ?? []
            }}
            onSubmit={(values) => {
                mut.mutate({
                    ...values,
                    categoryId: Number(values.categoryId ?? 0),
                    banner: banner?.toString(),
                    id: mod?.id,
                })
            }}
        >
            {(form) => (
                <Form className={className}>
                    <h2>General</h2>
                    <div className="p-2">
                        <label htmlFor="icon">Banner</label>
                        <input
                            type="file"
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
                            <div className="p-2">
                                <FormCheckbox
                                    name="bremove"
                                    text={<span>Remove Current</span>}
                                />
                            </div>
                        )}
                    </div>
                    <div className="p-2">
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
                                {categories.map((category, index) => {
                                    return (
                                        <React.Fragment key={`category-${index.toString()}`}>
                                            <option value={category.id}>{category.name}</option>

                                            {category.children.map((child, index) => {
                                                return (
                                                    <option
                                                        key={`child-${index.toString()}`}
                                                        value={child.id}
                                                    >-- {child.name}</option>
                                                )
                                            })}
                                        </React.Fragment>
                                    )
                                })}
                            </select>
                        )}
                    </div>
                    <div className="p-2">
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
                    <div className="p-2">
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
                    <div className="p-2">
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
                    <div className="p-2">
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
                    <div className="p-2">
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
                    <div className="p-2">
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
                    <div className="p-2">
                        <label htmlFor="version">Version</label>
                        {previewMode ? (
                            <p>{form.values.version}</p>
                        ) : (
                            <Field name="version" />
                        )}
                    </div>
                    <h2>Other Options</h2>
                    <div className="p-2">
                        <FormCheckbox
                            name="nsfw"
                            text={<>NSFW</>}
                        />
                    </div>
                    <div className="p-2">
                        <FormCheckbox
                            name="autoUpdate"
                            text={<>Auto Update</>}
                        />
                    </div>
                    <h2>Sources</h2>
                    <div className="p-2 flex flex-col gap-2">
                        <FieldArray name="sources">
                            {({ push, remove}) => (
                                <>
                                    {form.values.sources.map((src, index) => {
                                        const fieldStr = `sources[${index.toString()}]`;

                                        return (
                                            <div
                                                key={`source-${index.toString()}`}
                                                className="flex flex-col gap-1 bg-bestmods-3/80 rounded p-2"
                                            >
                                                <h3>Source #{(index + 1).toString()}</h3>
                                                <div className="p-2">
                                                    <label htmlFor={`${fieldStr}.sourceUrl`}>Source</label>

                                                    {previewMode ? (
                                                        <p>{src.sourceUrl ?? "N/A"}</p>
                                                    ) : (
                                                        <select
                                                            name={`${fieldStr}.sourceUrl`}
                                                            value={src.sourceUrl}
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
                                                <div className="p-2">
                                                    <label htmlFor={`${fieldStr}.query`}>Query</label>

                                                    {previewMode ? (
                                                        <p>{src.query ?? "N/A"}</p>
                                                    ) : (
                                                        <Field
                                                            name={`${fieldStr}.query`}
                                                        />
                                                    )}
                                                </div>
                                                <div className="p-2">
                                                    <label htmlFor={`${fieldStr}.primary`}>Primary</label>

                                                    {previewMode ? (
                                                        <p>{src.primary ? "Yes" : "No"}</p>
                                                    ) : (
                                                        <>
                                                            <FormCheckbox
                                                                name={`${fieldStr}.primary`}
                                                                text={<span>Yes</span>}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => remove(index)}
                                                    >Remove</button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => push(EMPTY_SOURCE)}
                                        >Add Source</button>
                                    </div>
                                </>
                            )}
                        </FieldArray>
                    </div>
                    <h2>Installers</h2>
                    <div className="p-2 flex flex-col gap-2">
                        <FieldArray name="installers">
                            {({ push, remove }) => (
                                <>
                                    {form.values.installers.map((ins, index) => {
                                        const fieldStr = `installers[${index.toString()}]`;

                                        return (
                                            <div
                                                key={`installer-${index.toString()}`}
                                                className="flex flex-col gap-1 bg-bestmods-3/80 rounded p-2"
                                            >
                                                <h3>Installer #{(index + 1).toString()}</h3>
                                                <div className="p-2">
                                                    <label htmlFor={`${fieldStr}.sourceUrl`}>Source</label>

                                                    {previewMode ? (
                                                        <p>{ins.sourceUrl ?? "N/A"}</p>
                                                    ) : (
                                                        <select
                                                            name={`${fieldStr}.sourceUrl`}
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
                                                <div className="p-2">
                                                    <label htmlFor={`${fieldStr}.url`}>URL</label>

                                                    {previewMode ? (
                                                        <p>{ins.url ?? "N/A"}</p>
                                                    ) : (
                                                        <Field
                                                            name={`${fieldStr}.url`}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => remove(index)}
                                                    >Remove</button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => push(EMPTY_INSTALLER)}
                                        >Add Installer</button>
                                    </div>
                                </>
                            )}
                        </FieldArray>
                    </div>
                    <h2>Screenshots</h2>
                    <div className="p-2 flex flex-col gap-2">
                        <FieldArray name="screenshots">
                            {({ push, remove }) => (
                                <>
                                    {form.values.screenshots.map((ss, index) => {
                                        const fieldStr = `screenshots[${index.toString()}]`;

                                        return (
                                            <div
                                                key={`screenshot-${index.toString()}`}
                                                className="flex flex-col gap-1 bg-bestmods-3/80 rounded p-2"
                                            >
                                                <h3>Screenshot #{(index + 1).toString()}</h3>
                                                <div className="p-2">
                                                    <label htmlFor={`${fieldStr}.url`}>URL</label>

                                                    {previewMode ? (
                                                        <p>{ss.url ?? "N/A"}</p>
                                                    ) : (
                                                        <Field
                                                            name={`${fieldStr}.url`}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => remove(index)}
                                                    >Remove</button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => push(EMPTY_SCREENSHOT)}
                                        >Add Screenshot</button>
                                    </div>
                                </>
                            )}
                        </FieldArray>
                    </div>
                    <h2>Downloads</h2>
                    <div className="p-2 flex flex-col gap-2">
                        <FieldArray name="downloads">
                            {({ push, remove }) => (
                                <>
                                    {form.values.downloads.map((dl, index) => {
                                        const fieldStr = `downloads[${index.toString()}]`;

                                        return (
                                            <div
                                                key={`download-${index.toString()}`}
                                                className="flex flex-col gap-1 bg-bestmods-3/80 rounded p-2"
                                            >
                                                <h3>Download #{(index + 1).toString()}</h3>
                                                <div>
                                                    <div className="p-2">
                                                        <label htmlFor={`${fieldStr}.name`}>Name</label>

                                                        {previewMode ? (
                                                            <p>{dl.name ?? "N/A"}</p>
                                                        ) : (
                                                            <Field name={`${fieldStr}.name`} />
                                                        )}
                                                    </div>
                                                    <div className="p-2">
                                                        <label htmlFor={`${fieldStr}.url`}>URL</label>

                                                        {previewMode ? (
                                                            <p>{dl.url ?? "N/A"}</p>
                                                        ) : (
                                                            <Field
                                                                name={`${fieldStr}.url`}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="p-2">
                                                        <label htmlFor={`${fieldStr}.size`}>Size</label>

                                                        {previewMode ? (
                                                            <p>{dl.size?.toString() ?? "0"} Bytes</p>
                                                        ) : (
                                                            <Field
                                                                type="number"
                                                                name={`${fieldStr}.size`}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="p-2">
                                                            <label htmlFor={`${fieldStr}.uploadDate`}>Upload Date</label>
                                                            {previewMode ? (
                                                                <p>{dl.uploadDate ? new Date(dl.uploadDate).toDateString() : "N/A"}</p>
                                                            ) : (
                                                                <DatePickerField name={`${fieldStr}.uploadDate`} />
                                                            )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => remove(index)}
                                                    >Remove</button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                     <div>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => push(EMPTY_DOWNLOAD)}
                                        >Add Download</button>
                                    </div>
                                </>
                            )}
                        </FieldArray>
                    </div>
                    <h2>Credits</h2>
                    <div className="p-2 flex flex-col gap-2">
                        <FieldArray name="credits">
                            {({ push, remove }) => (
                                <>
                                    {form.values.credits.map((cre, index) => {
                                        const fieldStr = `credits[${index.toString()}]`;

                                        return (
                                            <div
                                                key={`credit-${index.toString()}`}
                                                className="flex flex-col gap-1 bg-bestmods-3/80 rounded p-2"
                                            >
                                                <h3>Credit #{(index + 1).toString()}</h3>
                                                <div className="p-2">
                                                    <label htmlFor={`${fieldStr}.name`}>Name</label>

                                                    {previewMode ? (
                                                        <p>{cre.name ?? "N/A"}</p>
                                                    ) : (
                                                        <Field name={`${fieldStr}.name`} />
                                                    )}
                                                </div>
                                                <div className="p-2">
                                                    <label htmlFor={`${fieldStr}.credit`}>Credit</label>

                                                    {previewMode ? (
                                                        <p>{cre.credit ?? "N/A"}</p>
                                                    ) : (
                                                        <Field name={`${fieldStr}.credit`} />
                                                    )}
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => remove(index)}
                                                    >Remove</button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => push(EMPTY_CREDIT)}
                                        >Add Credit</button>
                                    </div>
                                </>
                            )}
                        </FieldArray>
                    </div>
                    <h2>Requirements</h2>
                    <div className="p-2 flex flex-col gap-2">
                        <FieldArray name="required">
                            {({ push, remove }) => (
                                <>
                                    {form.values.required.map((req, index) => {
                                        const fieldStr = `required[${index.toString()}]`;

                                        return (
                                            <div
                                                key={`required-${index.toString()}`}
                                                className="flex flex-col gap-1 bg-bestmods-3/80 rounded p-2"
                                            >
                                                <h2>Requirement #{(index + 1).toString()}</h2>
                                                <div className="p-2">
                                                    <label htmlFor={`${fieldStr}.dId`}>Destination Mod ID</label>

                                                    {previewMode ? (
                                                        <p className="italic">{req.dId.toString()}</p>
                                                    ) : (
                                                        <Field
                                                            type="number"
                                                            name={`${fieldStr}.dId`}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => remove(index)}
                                                    >Remove</button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => push(EMPTY_REQUIRED)}
                                        >Add Requirement</button>
                                    </div>
                                </>
                            )}
                        </FieldArray>
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