const responseBuilder = (
    status: boolean,
    message: string,
    data = {},
    accessToken: string | undefined = undefined
) => {
    return {
        status: status,
        payload: {
            message: message,
            data: {
                data: data,
                accessToken: accessToken
            }
        }
    };
};

export default responseBuilder;
