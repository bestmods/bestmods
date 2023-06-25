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
                <div className="alert-error">
                    <h3>Error!</h3>
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="alert-success">
                    <h3>Success!</h3>
                    <p>{success}</p>
                </div>
            )}
        </div>
    </>);
};