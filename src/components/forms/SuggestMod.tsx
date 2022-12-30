import { useFormik } from "formik";
import { useContext } from "react";
import { DirtyContext, FieldStyle } from "../../pages";
import { trpc } from "../../utils/trpc";

const SuggestMod = () => {
  const mutation = trpc.public.suggestMod.useMutation();
  const dirtyContext = useContext(DirtyContext);

  const { handleSubmit, handleChange, values } = useFormik({
    initialValues: {
      name: "",
      url: "",
      description: "",
    },

    onSubmit: (values) => {
      mutation.mutate(values);
      dirtyContext?.setDirty(true);
    },
  });

  return (
    <form onSubmit={handleSubmit} className="text-slate-200">
      <label htmlFor="name">Mod Name</label>

      <input
        id="name"
        name="name"
        type="text"
        className={`px-2 py-1 text-base ${FieldStyle}`}
        onChange={handleChange}
        value={values.name}
      />

      <label htmlFor="url">Mod URL</label>

      <input
        id="url"
        name="url"
        type="text"
        className={`px-2 py-1 text-base ${FieldStyle}`}
        onChange={handleChange}
        value={values.url}
      />

      <label htmlFor="modDescription">Description</label>

      <input
        id="description"
        name="description"
        type="textarea"
        className={`px-2 py-1 text-base ${FieldStyle}`}
        onChange={handleChange}
        value={values.description}
      />

      <button type="submit">Submit</button>
    </form>
  );
};

export default SuggestMod;
