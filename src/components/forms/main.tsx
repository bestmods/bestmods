import React, { useState, useEffect, useMemo } from "react";

import {FormikProvider} from "formik";

const FormTemplate: React.FC<{form: any, submitBtn: JSX.Element, content: JSX.Element}> = ({ form, submitBtn, content }) => {
    return (
        <>
            {form != null && (
                <FormikProvider value={form}>
                    <form method="POST" onSubmit={form.handleSubmit} className="w-full flex flex-col bg-black bg-opacity-50 shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        {content}
                        {submitBtn}
                    </form>
                </FormikProvider>
            )}
        </>
    );
}

export default FormTemplate;