import { ErrorCtx, SuccessCtx } from "@pages/_app";
import { type Category } from "@prisma/client";
import { GetContents } from "@utils/file";
import { trpc } from "@utils/trpc";
import { Field, Form, Formik } from "formik";
import React from "react";
import { useContext, useState } from "react";
import { type CategoryWithChildren } from "~/types/category";
import FormCheckbox from "../checkbox";
import ScrollToTop from "@utils/scroll";

export default function CategoryForm ({
    category,
    categories,
    className
} : {
    category?: Category
    categories: CategoryWithChildren[]
    className?: string
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Mutations.
    const mut = trpc.category.add.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle(`Failed To ${category ? `Save` : `Add`} Category`);
                errorCtx.setMsg(`Failed to ${category ? `save` : `add`} category. Please check the console for more information.`);
                
                ScrollToTop();
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${category ? "Saved" : "Added"} Category!`);
                successCtx.setMsg(`Successfully ${category ? `saved` : `added`} category!`);

                ScrollToTop();
            }
        }
    });

    // Banners & icons.
    const [icon, setIcon] = useState<string | ArrayBuffer | null>(null);
    const [banner, setBanner] = useState<string | ArrayBuffer | null>(null);

    return (
        <Formik
            initialValues={{
                parentId: category?.parentId ?? 0,
                name: category?.name ?? "",
                nameShort: category?.nameShort ?? "",
                description: category?.description ?? "",
                url: category?.url ?? "",
                classes: category?.classes ?? "",
                hasBg: category?.hasBg ?? false,

                iremove: false,
                bremove: false
            }}
            onSubmit={(values) => {
                mut.mutate({
                    ...values,
                    parentId: values.parentId ? Number(values.parentId) : null,
                    id: category?.id,
                    banner: banner?.toString(),
                    icon: icon?.toString(),
                })
            }}
        >
            {(form) => (
                <Form className={className}>
                    <div className="p-2">
                        <label htmlFor="icon">Icon</label>
                        <input
                            type="file"
                            name="icon"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];

                                if (file) {
                                    const contents = await GetContents(file);

                                    setIcon(contents);
                                }
                            }}
                        />

                        {category?.icon && (
                            <div className="p-2">
                                <FormCheckbox
                                    name="iremove"
                                    text={<span>Remove Current</span>}
                                />
                            </div>
                        )}
                    </div>
                    <div className="p-2">
                        <label htmlFor="banner">Banner</label>
                        <input
                            type="file"
                            name="banner"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];

                                if (file) {
                                    const contents = await GetContents(file);

                                    setBanner(contents);
                                }
                            }}
                        />

                        {category?.banner && (
                            <div className="p-2">
                                <FormCheckbox
                                    name="bremove"
                                    text={<span>Remove Current</span>}
                                />
                            </div>
                        )}
                    </div>
                    <div className="p-2">
                        <label htmlFor="parentId">Parent</label> 
                        <select 
                            name="parentId"
                            value={form.values.parentId}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                        >
                            <option value="0">None</option>
                            {categories.map((cat) => {
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
                    <div className="p-2">
                        <label htmlFor="name">Name</label>
                        <Field
                            name="name"
                            placeholder="Category Name..."
                        />
                    </div>
                    <div className="p-2">
                        <label htmlFor="nameShort">Short Name</label>
                        <Field
                            name="nameShort"
                            placeholder="Category Short Name..."
                        />
                    </div>
                    <div className="p-2">
                        <label htmlFor="description">Description</label>
                        <Field
                            as="textarea"
                            rows={16}
                            cols={32}
                            name="description"
                            placeholder="Category description..."
                        />
                    </div>
                    <div className="p-2">
                        <label htmlFor="url">URL</label>
                        <Field
                            name="url"
                            placeholder="Category URL..."
                        />
                    </div>
                    <div className="p-2">
                        <label htmlFor="classes">Classes</label>
                        <Field
                            name="classes"
                            placeholder="Category classes..."
                        />
                    </div>
                    <h2>Other Settings</h2>
                    <div className="p-2">
                        <div className="p-2">
                            <FormCheckbox
                                name="hasBg"
                                text={<span>Has Background?</span>}
                            />
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button type="submit" className="btn btn-primary">{category ? "Save" : "Add"} Category!</button>
                    </div>
                </Form>
            )}
        </Formik>
    )
}