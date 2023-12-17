import { ErrorCtx, SuccessCtx } from "@pages/_app";
import { type Source } from "@prisma/client";
import { GetContents } from "@utils/file";
import { trpc } from "@utils/trpc";
import { Field, Form, Formik } from "formik";
import { useContext, useState } from "react";
import FormCheckbox from "../checkbox";
import ScrollToTop from "@utils/scroll";

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
                errorCtx.setMsg(`Failed to ${source ? `save` : `add`} source. Please check the console for more information.`);

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${source ? "Saved" : "Added"} Source!`);
                successCtx.setMsg(`Successfully ${source ? `saved` : `added`} source!`);

                ScrollToTop();
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
                    ...values,
                    update: source ? true : false,
                    banner: banner?.toString(),
                    icon: icon?.toString(),
                })
            }}
        >
            {() => (
                <Form className="bg-bestmods-2/80 p-2 rounded">
                    <div className="p-2">
                        <label htmlFor="icon">Icon</label>
                        <input
                            type="file"
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
                            <div className="p-2">
                                <FormCheckbox
                                    name="iremove"
                                    text={<span>Remove Current</span>}
                                />
                            </div>
                        )}
                    </div>
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

                        {source?.banner && (
                            <div className="p-2">
                                <FormCheckbox
                                    name="bremove"
                                    text={<span>Remove Current</span>}
                                />
                            </div>
                        )}
                    </div>
                    <div className="p-2">
                        <label htmlFor="name">Name</label>
                        <Field
                            name="name"
                            placeholder="Source Name..."
                        />
                    </div>
                    <div className="p-2">
                        <label htmlFor="description">Description</label>
                        <Field
                            as="textarea"
                            rows={16}
                            cols={32}
                            name="description"
                            placeholder="Source description..."
                        />
                    </div>
                    <div className="p-2">
                        <label htmlFor="name">URL</label>
                        <Field
                            name="url"
                            placeholder="Source URL..."
                        />
                    </div>
                    <div className="p-2">
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