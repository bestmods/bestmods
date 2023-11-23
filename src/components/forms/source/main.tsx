import { ErrorCtx, SuccessCtx } from "@pages/_app";
import { type Source } from "@prisma/client";
import { GetContents } from "@utils/file";
import { trpc } from "@utils/trpc";
import { Field, Form, Formik } from "formik";
import { useContext, useState } from "react";

export default function SourceForm ({
    source
} : {
    source?: Source
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Mutations.
    const mut = trpc.source.add.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle(`Failed To ${source ? `Save` : `Add`} Source`);
                errorCtx.setMsg(`Failed to ${source ? `save` : `add`} source. Please check the console for more information.`)
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${source ? "Saved" : "Added"} Source!`);
                successCtx.setMsg(`Successfully ${source ? `saved` : `added`} source!`);
            }
        }
    });

    // Banners & icons.
    const [icon, setIcon] = useState<string | ArrayBuffer | null>(null);
    const [banner, setBanner] = useState<string | ArrayBuffer | null>(null);

    return (
        <Formik
            initialValues={{
                name: source?.name ?? "",
                description: source?.description ?? "",
                url: source?.url ?? "",
                classes: source?.classes ?? "",

                iremove: false,
                bremove: false
            }}
            onSubmit={(values) => {
                mut.mutate({
                    banner: banner?.toString(),
                    icon: icon?.toString(),

                    bremove: values.bremove,
                    iremove: values.iremove,

                    name: values.name,
                    description: values.description,
                    url: values.url,
                    classes: values.classes
                })
            }}
        >
            {() => (
                <Form>
                    <div className="form-container">
                        <label htmlFor="icon">Icon</label>
                        <input
                            type="file"
                            className="form-input"
                            name="icon"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];

                                if (file) {
                                    const contents = await GetContents(file);

                                    setIcon(contents);
                                }
                            }}
                        />

                        {source?.icon && (
                            <div className="form-checkbox">
                                <Field
                                    type="checkbox"
                                    name="iremove"
                                />
                                <label htmlFor="iremove">Remove Current</label>
                            </div>
                        )}
                    </div>
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

                        {source?.banner && (
                            <div className="form-checkbox">
                                <Field
                                    type="checkbox"
                                    name="bremove"
                                />
                                <label htmlFor="bremove">Remove Current</label>
                            </div>
                        )}
                    </div>
                    <div className="form-container">
                        <label htmlFor="name">Name</label>
                        <Field
                            name="name"
                            placeholder="Source Name..."
                        />
                    </div>
                    <div className="form-container">
                        <label htmlFor="description">Description</label>
                        <Field
                            as="textarea"
                            rows={16}
                            cols={32}
                            name="description"
                            placeholder="Source description..."
                        />
                    </div>
                    <div className="form-container">
                        <label htmlFor="name">URL</label>
                        <Field
                            name="url"
                            placeholder="Source URL..."
                        />
                    </div>
                    <div className="form-container">
                        <label htmlFor="name">Classes</label>
                        <Field
                            name="classes"
                            placeholder="Source classes..."
                        />
                    </div>
                    <div className="flex justify-center">
                        <button type="submit" className="btn btn-primary">{source ? "Save" : "Add"} Source!</button>
                    </div>
                </Form>      
            )}

        </Formik>
    )
}