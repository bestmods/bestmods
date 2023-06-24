import React from 'react';

export const AlertForm: React.FC<{
    error?: string | null,
    success?: string | null
}> = ({
    error,
    success
}) => {
    return (<>
        <div id="alertbox">
            {error && (
                <div className="p-4 bg-red-800/50 text-white">
                    <h3 className="text-xl font-bold">Error!</h3>
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="p-4 bg-lime-500/50 text-white">
                    <h3 className="text-xl font-bold">Success!</h3>
                    <p>{success}</p>
                </div>
            )}
        </div>
    </>);
};