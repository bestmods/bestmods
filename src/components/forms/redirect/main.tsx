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

    const mut = trpc.redirect.addOrSave.useMutation({
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

    return (
        <Formik
            initialValues={{
                url: redirect?.url ?? "",
                redirect: redirect?.redirect ?? ""
            }}
            onSubmit={(values) => {
                mut.mutate({
                    id: redirect?.id,
                    url: values.url,
                    redirect: values.redirect
                })
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
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >{redirect ? "Save" : "Add"} Redirect</button>
                </div>
            </Form>
        </Formik>
    )
}