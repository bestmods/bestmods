import { ErrorCtx, SuccessCtx } from "@pages/_app";
import { type Redirect } from "@prisma/client";
import { trpc } from "@utils/trpc";
import { Field, Form, Formik } from "formik";
import { useContext } from "react";

export default function RedirectForm({
    redirect,
    className
} : {
    redirect?: Redirect
    className?: string
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const addMut = trpc.redirect.addOrSave.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle(`Error ${redirect ? "Saving" : "Adding"} Redirect`);
                errorCtx.setMsg(`Error ${redirect ? "saving" : "adding"} redirect. Check the console for more details.`)
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`${redirect ? "Saved" : "Added"} Redirect Successfully!`);
                successCtx.setMsg(`${redirect ? "Saved" : "Added"} redirect successfully!`);
            }
        }
    })

    const importMut = trpc.redirect.import.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Import Redirects");
                errorCtx.setMsg("There was an error import redirects. Check the console for more details.")
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Redirects Imported Successfully!");
                successCtx.setMsg("Successfully imported redirects!");
            }
        }
    })

    return (
        <Formik
            initialValues={{
                url: redirect?.url ?? "",
                redirect: redirect?.redirect ?? "",
                redirects: ""
            }}
            onSubmit={(values) => {
                if (values.redirects.length > 2) {
                    importMut.mutate({
                        contents: values.redirects
                    })
                } else {
                    addMut.mutate({
                        id: redirect?.id,
                        url: values.url,
                        redirect: values.redirect
                    })
                }
            }}
        >
            <Form className={className}>
                <div className="p-2">
                    <label htmlFor="url">URL</label>
                    <Field name="url" />
                </div>
                <div className="p-2">
                    <label htmlFor="redirect">Redirect</label>
                    <Field name="redirect" />
                </div>
                {!redirect && (
                    <div className="p-2">
                        <label htmlFor="redirects">Import Redirects</label>
                        <Field
                            as="textarea"
                            name="redirects"
                            rows={16}
                        />
                        <p>
                            Format should be <span className="italic">{"{"}url{"}"}</span>:<span className="italic">{"{"}redirect{"}"}</span>
                        </p>
                    </div>
                )}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >{redirect ? "Save" : "Add"} Redirect(s)</button>
                </div>
            </Form>
        </Formik>
    )
}