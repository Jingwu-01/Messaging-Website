function getDocumentResult(docName: string, doc: string, databasePath: string, username: string, createdAt: number, lastModifiedAt: number): string {
    return `{
        "path": ${databasePath}/${docName},
        "doc": ${doc},
        "meta": {
            "createdAt": ${createdAt.toString()},
            "createdBy": ${username},
            "lastModifiedAt": 1701827861753,
            "lastModifiedBy": ${lastModifiedAt.toString()}
        }
    }`
}

function stringAdditionHelper(keyName: string, dataPair: [string, boolean]) {
    if (dataPair[1]) {
        return `${keyName}: ${dataPair[0]}`;
    } else {
        return '';
    }
}

function getReactionArray(smile: [string, boolean], frown: [string, boolean], like: [string, boolean], celebrate: [string, boolean], additionalReaction: [string, string, boolean]) {
    return `{
        ${stringAdditionHelper("smile", smile)},
        ${stringAdditionHelper("frown", frown)},
        ${stringAdditionHelper("like", like)},
        ${stringAdditionHelper("celebrate", celebrate)},
        ${stringAdditionHelper(additionalReaction[0], [additionalReaction[1], additionalReaction[2]])}
    }`;
}

function getPostBody(message: string, parent: [string, boolean], reactions: [string, boolean], extensions: [string, boolean]) {
    return `{
        message: ${message},
        ${stringAdditionHelper("parent", parent)},
        ${stringAdditionHelper("reactions", reactions)},
        ${stringAdditionHelper("extensions", extensions)}
    }`;
}

function getDocumentBodies(databasePath: string, username: string): Map<string, string> {
    return new Map<string, string>([
        ["empty_workspace", getEmptyDocumentResult("empty_workspace", databasePath, username)],

        ["workspace_onechannel", getEmptyDocumentResult("workspace_onechannel", databasePath, username)],
        ["onechannel_multposts", getEmptyDocumentResult("onechannel_multposts", databasePath, username)],
        ["multposts_post1", getPostBody("test message", )]

        ["workspace_multchannels", getEmptyDocumentResult("workspace_multchannels", databasePath, username)],
    ])
}

(global as any).fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {

    let baseUrl = "http://localhost:4318";
    let invalidSchemaUrl = "http://localhost:3200";
    let databasePath = "/v1/p2group50_testdb_6";
    let authPath = "auth";
    let dbUrl = `${baseUrl}${databasePath}`;
    let body = "";
    let ok = true;
    let status = 200;
    let statusText = "OK";
    let username = "test_user";
    
    // define all workspace, channels, etc. bodies that I need.

    switch (input) {
        case `${baseUrl}/${authPath}`:
            if (init === undefined || init.method === undefined) {
                break;
            }
            switch (init.method) {
                case "POST":
                    if (init !== undefined && init?.body !== undefined) {
                        let requestBody = init.body?.toString();
                        if (requestBody === undefined) {
                            ok = false;
                            status = 400;
                            statusText = "Bad Request";
                            break;
                        }
                        let parsedBody = JSON.parse(requestBody);
                        if (parsedBody.username === undefined) {
                            ok = false;
                            status = 400;
                            statusText = "Bad Request";
                            break;
                        }
                        let username = parsedBody.username;
                        if (username === "") {
                            ok = false;
                            status = 400;
                            statusText = "Bad Request";
                            break;
                        }
                        body = `{"token": "test"}`;
                        break;
                    }
                    ok = false;
                    status = 400;
                    statusText = "Bad Request";
                    break;
                case "DELETE":
                    if (init.headers !== undefined) {
                        let requestHeaders = new Headers(init.headers);
                        let authVal = requestHeaders.get("Authorization");
                        if (!authVal?.startsWith("Bearer ")) {
                            ok = false;
                            status = 400;
                            statusText = "Bad Request";
                            break;
                        }
                        authVal = authVal.slice(7);
                        if (authVal !== "test") {
                            ok = false;
                            status = 401;
                            statusText = "Unauthorized";
                            break;
                        }
                        status = 204;
                        statusText = "No Content";
                        break;
                    }
                    ok = false;
                    status = 400;
                    statusText = "Bad Request";
                    break;
            }
            // should be unreachable
            break;
        case `${invalidSchemaUrl}/${authPath}`:
            if (init === undefined || init.method === undefined) {
                break;
            }
            switch (init.method) {
                case "POST":
                    if (init !== undefined && init?.body !== undefined) {
                        let requestBody = init.body?.toString();
                        if (requestBody === undefined) {
                            ok = false;
                            status = 400;
                            statusText = "Bad Request";
                            break;
                        }
                        let parsedBody = JSON.parse(requestBody);
                        if (parsedBody.username === undefined) {
                            ok = false;
                            status = 400;
                            statusText = "Bad Request";
                            break;
                        }
                        let username = parsedBody.username;
                        if (username === "") {
                            ok = false;
                            status = 400;
                            statusText = "Bad Request";
                            break;
                        }
                        body = `{"somefield": "somevalue"}`;
                        break;
                    }
                    ok = false;
                    status = 400;
                    statusText = "Bad Request";
                    break;
                case "DELETE":
                    if (init.headers !== undefined) {
                        let requestHeaders = new Headers(init.headers);
                        let authVal = requestHeaders.get("Authorization");
                        if (!authVal?.startsWith("Bearer ")) {
                            ok = false;
                            status = 400;
                            statusText = "Bad Request";
                            break;
                        }
                        authVal = authVal.slice(7);
                        if (authVal !== "test") {
                            ok = false;
                            status = 401;
                            statusText = "Unauthorized";
                            break;
                        }
                        body = "some body";
                        status = 204;
                        statusText = "No Content";
                        break;
                    }
                    ok = false;
                    status = 400;
                    statusText = "Bad Request";
                    break;
            }
            break;
        case `${dbUrl}/fetchSuccessful`:
            body = "some body";
            break;
        case `${dbUrl}/fetchError`:
            return Promise.reject("failed fetch");
        case `${dbUrl}/fetchNoContent`:
            break;
        case `${dbUrl}/fetchResponseError`:
            ok = false;
            status = 400;
            statusText = "Bad Request";
            break;
        case `${dbUrl}/checkAuth`:
            // idk how to avoid this for now.
            if (init !== undefined && init.headers !== undefined) {
                let requestHeaders = new Headers(init.headers);
                let authVal = requestHeaders.get("Authorization");
                if (!authVal?.startsWith("Bearer ")) {
                    ok = false;
                    status = 400;
                    statusText = "Bad Request";
                    break;
                }
                authVal = authVal.slice(7);
                if (authVal !== "test") {
                    ok = false;
                    status = 401;
                    statusText = "Unauthorized";
                    break;
                }
                // TODO: make an empty string?
                body = "auth passed";
                break;
            }
            ok = false;
            status = 401;
            statusText = "Unauthorized";
            break;
        
        // M3ssaging cases: workspaces, channels, etc.
        case `${dbUrl}/`:
            let method: string;
            if (init === undefined || init.method === undefined) {
                method = "GET";
            } else {
                method = init.method;
            }
            switch (method) {
                case "GET":
                    
            }
            

        case `${dbUrl}/test_workspace`:
            if (init === undefined || init.method === undefined) {
                method = "GET";
            } else {
                method = init.method;
            }
            switch (method) {
                case "GET":
                    body = `{
                        "path": "/test_workspace",
                        "doc": {},
                        "meta": {
                            "createdBy": ${username},
                            "createdAt": 1701826733252,
                            "lastModifiedBy": ${username},
                            "lastModifiedAt": 1701826733252
                        }
                    }`;
                    break;
                case "PUT":
                    body = `{
                        "uri": ${databasePath}/workspace1
                    }`;
                    break;
                case "DELETE":
                    status = 204;
                    statusText = "No Content";
                    break;
            }
            break;
        case `${dbUrl}/test_workspace/channels/`:
            if (init === undefined || init.method === undefined) {
                method = "GET";
            } else {
                method = init.method;
            }
            switch (method) {
                case "GET":
                    body = 
            }
            
        default:
            ok = false;
            status = 404;
            statusText = "Not Found";
            body = "Could not find specified resource";
            break;
            

    }

    const hdrs = new Headers();
    hdrs.set("Content-Length", `${body.length}`);
    const response: Response = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: hdrs,
        json: () => Promise.resolve(JSON.parse(body)),
    } as Response;

    return Promise.resolve(response);
})