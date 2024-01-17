import React from "react";
import { useField, useFormikContext } from "formik";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export function DatePickerField ({
    name
} : {
    name: string
}) {
    const { setFieldValue } = useFormikContext();
    const [ field ] = useField({
        name: name
    });

    return (
        <DatePicker
            {...field}
            name={name}
            selected={(field.value && new Date(field.value)) || null}
            onChange={val => {
                setFieldValue(field.name, val);
            }}
        />
    );
}