import { Field } from "formik"
import { ChangeEventHandler } from "react"

export default function FormCheckbox ({
    name,
    text
} : {
    name: string
    text: JSX.Element
}) {
    return (
        <div className="flex gap-1">
            <Field
                type="checkbox"
                name={name}
            />
            {text}
        </div>
    )
}