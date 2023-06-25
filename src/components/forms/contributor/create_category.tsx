
import { useFormik, Field } from "formik";
import React, { useState } from "react";

import { trpc } from "../../../utils/trpc";

import FormTemplate from '../main';
import { AlertForm } from '../../alert';
import { type Category } from "@prisma/client";
import { type CategoriesWithChildren } from "../../types";

type values_type = {
    id?: number;
    parent_id?: number | null;

    name: string;
    name_short: string;
    url: string;
    classes: string;

    icon?: string | null;
    iremove?: boolean | null;

    has_bg?: boolean
};

const CategoryForm: React.FC<{ 
    cat: Category,
    cats: CategoriesWithChildren[]
 }> = ({ 
    cat,
    cats
  }) => {
    // Errors and success handles.
    let error: string | null = null;
    let success: string | null = null;

    // We must handle the parent ourselves.
    const [parent, setParent] = useState<number | null>(cat?.parentId ?? null);

    // Submit button.
    const submitBtn = 
        <div className="text-center">
            <button type="submit" className="btn btn-blue">{!cat ? "Add Category!" : "Edit Category!"}</button>
        </div>;

    // File uploads.
    const [iconData, setIconData] = useState<string | ArrayBuffer | null>(null);

    // Queries.
    const cat_mut = trpc.category.addCategory.useMutation();

    // Hande success and errors.
    if (cat_mut.isSuccess) {
        success = "Successfully added or edited category!";
        error = null;
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

        success = null;

        // Send alert and log full error to client's console.
        console.error(cat_mut.error);
    }

    // Create form using Formik.
    const form = useFormik({
        initialValues: {
            name: cat?.name ?? "",
            name_short: cat?.nameShort ?? "",
            url: cat?.url ?? "",
            classes: cat?.classes ?? "",
            iremove: false,
            has_bg: cat?.hasBg ?? ""
        },
        enableReinitialize: true,

        onSubmit: (values) => {
        // Create new values.
        const new_vals: values_type = values;

        // Assign some additional values.
        new_vals.parent_id = parent;
        new_vals.id = cat?.id;
        new_vals.icon = iconData?.toString() ?? null;

        // Insert into database.
        cat_mut.mutate(new_vals);

        // Scroll to top.
        if (typeof window !== undefined) {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }
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
                    <label className="form-label">Image</label>
                    <input className="form-input" name="image" type="file" placeholder="Source Image" onChange={(e) => {
                        const file = (e?.target?.files) ? e?.target?.files[0] ?? null : null;

                        if (file) {
                            const reader = new FileReader();

                            reader.onloadend = () => {
                                setIconData(reader.result);
                            };
                            
                            reader.readAsDataURL(file);
                        }
                    }} />

                    <Field className="form-checkbox" name="iremove" type="checkbox" /> <label className="form-checkbox-label">Remove Current</label>
                </div>

                <div className="form-container">
                    <label className="form-label">Has Background</label>

                    <Field className="form-checkbox" name="has_bg" type="checkbox" /> <label className="form-checkbox-label">Yes</label>
                </div>

                <div className="form-container">
                    <label className="form-label">Parent</label> 
                    <select className="form-input" name="parent_id" placeholder="Category Parent" defaultValue={parent ?? 0} onChange={(e) => {
                        const val = e.target.value;

                        if (val)
                            setParent(Number(val));
                    }}>
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
                    <label className="form-label">Name</label>
                    <Field className="form-input" name="name" type="text" placeholder="Category Name" />
                </div>

                <div className="form-container">
                    <label className="form-label">Short Name</label>
                    <Field className="form-input" name="name_short" type="text" placeholder="Category Short Name" />
                </div>

                <div className="form-container">
                    <label className="form-label">URL</label>
                    <Field className="form-input" name="url" type="text" placeholder="models" />
                </div>

                <div className="form-container">
                    <label className="form-label">Classes</label>
                    <Field className="form-input" name="classes" type="text" placeholder="CSS Classes" />
                </div>
            </FormTemplate>
        </>
    );
};

export default CategoryForm;