
import { useFormik, Field } from "formik";
import React, { useState } from "react";

import { trpc } from "@utils/trpc";

import FormTemplate from "@components/forms/main";
import { AlertForm } from "@utils/alert";

import { type Category } from "@prisma/client";
import { type CategoryWithChildren } from "~/types/category";
import ScrollToTop from "@utils/scroll";

export default function CategoryForm ({
    cat,
    cats
} : {
    cat?: Category,
    cats: CategoryWithChildren[]
 }) {
    // Errors and success handles.
    let error: string | undefined = undefined;
    let success: string | undefined = undefined;

    // We must handle the parent ourselves.
    const [parent, setParent] = useState<number | null>(cat?.parentId ?? null);

    // Submit button.
    const submitBtn = 
        <div className="text-center">
            <button 
                type="submit"
                className="btn btn-normal"
            >{!cat ? "Add Category!" : "Edit Category!"}</button>
        </div>;

    // File uploads.
    const [iconData, setIconData] = useState<string | ArrayBuffer | null>(null);

    // Queries.
    const cat_mut = trpc.category.addCategory.useMutation();

    // Hande success and errors.
    if (cat_mut.isSuccess) {
        success = "Successfully added or edited category!";
        error = undefined;
    } else if (cat_mut.isError) {
        const err_msg = cat_mut.error.message;

        // Check if we can simplify the error message for client.
        if (err_msg.includes("file extension is unknown"))
            error = err_msg;
        else if (err_msg.includes("base64 data is null"))
            error = "Banner file corrupt/invalid.";
        else if (err_msg.includes("is empty"))
            error = err_msg;
        else
            error = "Unable to create or edit category!";

        success = undefined;

        // Send alert and log full error to client's console.
        console.error(cat_mut.error);
    }

    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: cat?.name ?? "",
            name_short: cat?.nameShort ?? "",
            description: cat?.description ?? "",
            url: cat?.url ?? "",
            classes: cat?.classes ?? "",
            iremove: false,
            has_bg: cat?.hasBg ?? false
        },
        enableReinitialize: true,
        onSubmit: (values) => {
            // Insert into database.
            cat_mut.mutate({
                ...values,
                parent_id: parent,
                id: cat?.id,
                icon: iconData?.toString()
            });

            // Scroll to top.
            ScrollToTop();
        }
    });

    return (
        <>
            <AlertForm
                error={error}
                success={success}
            />
            <FormTemplate
                form={form}
                submitBtn={submitBtn}
            >
                <div className="form-container">
                    <label
                        htmlFor="icon" 
                        className="form-label"
                    >Icon</label>
                    <input
                        type="file"
                        className="form-input"
                        name="icon"
                        placeholder="Category Icon"
                        onChange={(e) => {
                            const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                            if (file) {
                                const reader = new FileReader();

                                reader.onloadend = () => {
                                    setIconData(reader.result);
                                };
                                
                                reader.readAsDataURL(file);
                            }
                        }}
                    />

                    <Field
                        type="checkbox"
                        className="form-checkbox"
                        name="iremove"
                    />
                    <label
                        htmlFor="iremove"
                        className="form-checkbox-label"
                    >Remove Current</label>
                </div>

                <div className="form-container">
                    <label
                        htmlFor="has_bg"
                        className="form-label"
                    >Has Background</label>

                    <Field
                        type="checkbox"
                        className="form-checkbox"
                        name="has_bg"
                    />
                    <label
                        htmlFor="has_bg" 
                        className="form-checkbox-label"
                    >Yes</label>
                </div>

                <div className="form-container">
                    <label
                        htmlFor="parent_id"
                        className="form-label"
                    >Parent</label> 
                    <select 
                        className="form-input"
                        name="parent_id"
                        placeholder="Category Parent"
                        defaultValue={parent ?? 0}
                        onChange={(e) => {
                            const val = e.target.value;

                            if (val)
                                setParent(Number(val));
                        }}
                    >
                        <option value="0">None</option>
                        {cats.map((cat) => {
                            return (
                                <React.Fragment key={cat.id}>
                                    <option value={cat.id}>{cat.name}</option>

                                    {cat.children.map((child) => {
                                        return <option key={child.id} value={child.id}>-- {child.name}</option>
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </select>
                </div>

                <div className="form-container">
                    <label
                        htmlFor="name"
                        className="form-label"
                    >Name</label>
                    <Field
                        type="text"
                        className="form-input"
                        name="name"
                        placeholder="Category Name"
                    />
                </div>

                <div className="form-container">
                    <label
                        htmlFor="name_short"
                        className="form-label"
                    >Short Name</label>
                    <Field
                        type="text"
                        className="form-input"
                        name="name_short"
                        placeholder="Category Short Name"
                    />
                </div>

                <div className="form-container">
                    <label
                        htmlFor="description"
                        className="form-label"
                    >Description</label>
                    <Field
                        as="textarea"
                        rows={16}
                        cols={32}
                        className="form-input"
                        name="description"
                        placeholder="Category Description"
                    />
                </div>

                <div className="form-container">
                    <label
                        htmlFor="url"
                        className="form-label"
                    >URL</label>
                    <Field
                        type="text"
                        className="form-input"
                        name="url"
                        placeholder="models"
                    />
                </div>

                <div className="form-container">
                    <label
                        htmlFor="classes"
                        className="form-label"
                    >Classes</label>
                    <Field
                        type="text" 
                        className="form-input"
                        name="classes"
                        placeholder="CSS Classes"
                    />
                </div>
            </FormTemplate>
        </>
    )
}