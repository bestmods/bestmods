import React, { type ReactNode } from "react";

import { FormikProvider } from "formik";

const FormTemplate: React.FC<{ 
    form: any,
    submitBtn: JSX.Element,
    children: ReactNode 
}> = ({
    form,
    submitBtn,
    children 
}) => {
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
    );
}

export default FormTemplate;