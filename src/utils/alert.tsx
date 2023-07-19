import React from "react";

export const AlertForm: React.FC<{
    error?: string,
    success?: string
}> = ({
    error,
    success
}) => {
    return (<>
        <div className="alert">
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