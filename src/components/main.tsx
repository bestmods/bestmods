import { Field, Form, Formik } from "formik";
import React from "react";
import HeadInfo from "../components/Head";

export const BestModsPage: React.FC<{content: JSX.Element}> = ({ content }) => {
    return (
      <>
        <HeadInfo />
        <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#002736] to-[#00151b]">
          <BestModsBackground></BestModsBackground>
          
          <div className="container mx-auto flex flex-col items-center justify-center gap-12 px-4 py-16 ">
            <BestModsHeader></BestModsHeader>
            {content}
          </div>
        </main>
      </>
    )
  };
  
export const BestModsBackground = () => {
    return (<>
        <div id="bgol"></div>
        <div id="bg"></div>
    </>);
};
  
export const BestModsHeader = () => {
    return (<>
        <h1 className="text-center text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
        <a href="/"><span className="text-blue-400">B</span>est{" "}
        <span className="text-blue-400">M</span>ods</a>
        </h1>
        <SearchBar />
    </>);
};
  
const SearchBar = () => {
    return (
        <Formik
            initialValues={{ search: "" }}
            onSubmit={(e) => {
                history.pushState(null, "", `?search=${e.search}`);
            }}
        >
            <Form className="w-4/5">
                <div className="relative">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    <Field type="search" name="search" id="default-search" className="block p-4 pl-10 w-full text-sm text-gray-100 bg-gray-700 rounded-lg border border-gray-600 focus:ring-blue-500 focus:border-blue-500" placeholder="Search for your favorite mods!" />

                    <div className="flex absolute inset-y-0 right-0 items-center pr-3">
                        <a href="#" id="settings-btn"><svg className="w-5 h-5 text-white" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="transparent" fillOpacity="0.01"></rect><path d="M36.686 15.171C37.9364 16.9643 38.8163 19.0352 39.2147 21.2727H44V26.7273H39.2147C38.8163 28.9648 37.9364 31.0357 36.686 32.829L40.0706 36.2137L36.2137 40.0706L32.829 36.686C31.0357 37.9364 28.9648 38.8163 26.7273 39.2147V44H21.2727V39.2147C19.0352 38.8163 16.9643 37.9364 15.171 36.686L11.7863 40.0706L7.92939 36.2137L11.314 32.829C10.0636 31.0357 9.18372 28.9648 8.78533 26.7273H4V21.2727H8.78533C9.18372 19.0352 10.0636 16.9643 11.314 15.171L7.92939 11.7863L11.7863 7.92939L15.171 11.314C16.9643 10.0636 19.0352 9.18372 21.2727 8.78533V4H26.7273V8.78533C28.9648 9.18372 31.0357 10.0636 32.829 11.314L36.2137 7.92939L40.0706 11.7863L36.686 15.171Z" fill="transparent" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"></path><path d="M24 29C26.7614 29 29 26.7614 29 24C29 21.2386 26.7614 19 24 19C21.2386 19 19 21.2386 19 24C19 26.7614 21.2386 29 24 29Z" fill="transparent" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"></path></svg></a>
                    </div>
                </div>
            </Form>
        </Formik>
    );
};  