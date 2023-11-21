import React, { type ReactNode } from "react";

import { FormikProvider } from "formik";

export default function MainForm ({
    form,
    submitBtn,
    children
} : {
    form: any,
    submitBtn: JSX.Element,
    children: ReactNode 
}) {
    return (
        <>
            {form && (
                <FormikProvider value={form}>
                    <form method="POST" onSubmit={form.handleSubmit} className="form-main">
                        {children}
                        {submitBtn}
                    </form>
                </FormikProvider>
            )}
        </>
    )
}