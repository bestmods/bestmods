import { type NextPage } from "next";
import React, { useEffect, useState } from "react";

import { BestModsPage } from '../../components/main';
import HeadInfo from "../../components/Head";

import { AlertForm } from '../../components/alert';

import { trpc } from '../../utils/trpc';

const Home: NextPage = () => {
  return (
    <>
      <HeadInfo />
      <BestModsPage
        content={<MainContent></MainContent>}
      ></BestModsPage>
    </>
  );
};

const MainContent: React.FC = () => {
    return (
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 gap-12 justify-items-center">
            <div className="p-10">
                <Categories />
            </div>
            <div className="p-10">
                <Sources />
            </div>
        </div>
    );
}

const Categories: React.FC = () => {
    const [success, setSuccess] = useState<string | null>(null);

    const catsQuery = trpc.category.getCategoriesMapping.useQuery();
    const cats = catsQuery.data;

    const delCats = trpc.category.delCategory.useMutation();

    return (
        <div className="relative bg-cyan-900 rounded-sm p-16">
            <AlertForm
                success={success}
            />

            <h1 className="text-white text-3xl font-bold text-center">Categories</h1>

            {cats ? (
                <>
                    {cats.map((cat) => {
                        const editLink = "/admin/add/category/" + cat.id;
                        const icon = (cat.icon != null) ? cat.icon : "/images/default_icon.png"
                        
                        return (
                            <div className="p-4">
                                <div className="flex items-center flex-wrap">
                                    <img src={icon} className="w-8 h-8" />
                                    <span className="text-white ml-2">{cat.name}</span>
                                    <a href={editLink} className="text-white hover:text-cyan-800 ml-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="style=fill"><g id="edit"><path id="Subtract" fillRule="evenodd" clipRule="evenodd" d="M18.9405 3.12087L21.0618 5.24219C22.2334 6.41376 22.2334 8.31326 21.0618 9.48483L19.2586 11.288L12.8947 4.92403L14.6978 3.12087C15.8694 1.94929 17.7689 1.94929 18.9405 3.12087ZM11.834 5.98469L3.70656 14.1121C3.22329 14.5954 2.91952 15.2292 2.84552 15.9086L2.45151 19.5264C2.31313 20.7969 3.38571 21.8695 4.65629 21.7311L8.27401 21.3371C8.95345 21.2631 9.58725 20.9594 10.0705 20.4761L18.1979 12.3486L11.834 5.98469Z" fill="#FFFFFF"/></g></g></svg></a>
                                    <button className="ml-2" onClick={(e) => {
                                                        e.preventDefault();

                                                        delCats.mutate({id: cat.id});

                                                        setSuccess("Deleted category #" + cat.id + " (" + cat.name + ")!");
                                                    }}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 12H8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#FFA574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                                </div>
                                {cat.children.length > 0 && (
                                    <div className="p-4">
                                        {cat.children.map((catChild) => {
                                            const editLinkChild = "/view/add/category/" + catChild.id;
                                            const iconChild = (catChild.icon != null) ? catChild.icon : "/images/default_icon.png";

                                            return (
                                                <div className="flex items-center flex-wrap ml-4">
                                                    <img src={iconChild} className="w-8 h-8" />
                                                    <span className="text-white ml-2">{catChild.name}</span>
                                                    <a href={editLinkChild} className="text-white hover:text-cyan-800 ml-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="style=fill"><g id="edit"><path id="Subtract" fillRule="evenodd" clipRule="evenodd" d="M18.9405 3.12087L21.0618 5.24219C22.2334 6.41376 22.2334 8.31326 21.0618 9.48483L19.2586 11.288L12.8947 4.92403L14.6978 3.12087C15.8694 1.94929 17.7689 1.94929 18.9405 3.12087ZM11.834 5.98469L3.70656 14.1121C3.22329 14.5954 2.91952 15.2292 2.84552 15.9086L2.45151 19.5264C2.31313 20.7969 3.38571 21.8695 4.65629 21.7311L8.27401 21.3371C8.95345 21.2631 9.58725 20.9594 10.0705 20.4761L18.1979 12.3486L11.834 5.98469Z" fill="#FFFFFF"/></g></g></svg></a>
                                                    <button className="ml-2" onClick={(e) => {
                                                        e.preventDefault();

                                                        delCats.mutate({id: catChild.id});

                                                        setSuccess("Deleted child category #" + catChild.id + " (" + catChild.name + ")!");
                                                    }}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 12H8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#FFA574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </>
            ) : (
                <p className="text-white">No categories found.</p>
            )}
            <div className="relative mx-auto">
                <a href="/admin/add/category">
                    <div className="text-white bg-cyan-700 hover:bg-cyan-800 rounded p-4 text-center">Add Category!</div>
                </a>
            </div>
        </div>
    );
}

const Sources: React.FC = () => {
    const [success, setSuccess] = useState<string | null>(null);

    const srcsQuery = trpc.source.getAllSources.useQuery();
    const srcs = srcsQuery.data;

    const delSrcs = trpc.source.delSource.useMutation();

    return (
        <div className="relative bg-cyan-900 rounded-sm p-16">
            <AlertForm
                success={success}
            />

            <h1 className="text-white text-3xl font-bold text-center">Sources</h1>

            {srcs ? (
                <>
                    {srcs.map((src) => {
                        const editLink = "/admin/add/source/" + src.url;
                        const icon = (src.icon != null) ? src.icon : "/images/default_icon.png"
                        
                        return (
                            <div className="p-4">
                                <div className="flex items-center flex-wrap">
                                    <img src={icon} className="w-8 h-8" />
                                    <span className="text-white ml-2">{src.name}</span>
                                    <a href={editLink} className="text-white hover:text-cyan-800 ml-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="style=fill"><g id="edit"><path id="Subtract" fillRule="evenodd" clipRule="evenodd" d="M18.9405 3.12087L21.0618 5.24219C22.2334 6.41376 22.2334 8.31326 21.0618 9.48483L19.2586 11.288L12.8947 4.92403L14.6978 3.12087C15.8694 1.94929 17.7689 1.94929 18.9405 3.12087ZM11.834 5.98469L3.70656 14.1121C3.22329 14.5954 2.91952 15.2292 2.84552 15.9086L2.45151 19.5264C2.31313 20.7969 3.38571 21.8695 4.65629 21.7311L8.27401 21.3371C8.95345 21.2631 9.58725 20.9594 10.0705 20.4761L18.1979 12.3486L11.834 5.98469Z" fill="#FFFFFF"/></g></g></svg></a>
                                    <button className="ml-2" onClick={(e) => {
                                                        e.preventDefault();

                                                        delSrcs.mutate({url: src.url});

                                                        setSuccess("Deleted source '" + src.url + "' (" + src.name + ")!");
                                                    }}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 12H8M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#FFA574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                                </div>
                            </div>
                        );
                    })}
                </>
            ) : (
                <p className="text-white">No sources found.</p>
            )}
            <div className="relative mx-auto">
                <a href="/admin/add/source">
                    <div className="text-white bg-cyan-700 hover:bg-cyan-800 rounded p-4 text-center">Add Source!</div>
                </a>
            </div>
        </div>
    );
}


export default Home;