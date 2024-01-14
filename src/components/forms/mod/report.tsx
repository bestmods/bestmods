import { ErrorCtx, SuccessCtx } from "@pages/_app";
import ScrollToTop from "@utils/scroll";
import { trpc } from "@utils/trpc";
import { Field, Form, Formik } from "formik";
import { useContext } from "react";

export default function ModReportForm ({
    modId,
    className
} : {
    modId: number
    className?: string
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    const addMut = trpc.modReport.add.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle("Failed To Add Report");
                errorCtx.setMsg("There was an error adding this report. Please check the console for more details.");

                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle("Added Report!");
                successCtx.setMsg("Successfully added report!");

                ScrollToTop()
            }
        }
    })

    return (
        <Formik
            initialValues={{
                contents: ""
            }}
            onSubmit={(values) => {
                addMut.mutate({
                    modId: modId,
                    contents: values.contents
                })
            }}
        >
            <Form className={className}>
                <div className="p-2">
                    <label htmlFor="contents">Reason</label>
                    <Field
                        as="textarea"
                        name="contents"
                        rows={16}
                        cols={8}
                    />
                </div>
                <div className="p-2 flex justify-center items-center">
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >Add Report</button>
                </div>
            </Form>
        </Formik>
    )
}