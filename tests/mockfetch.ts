import { jest } from "@jest/globals";
import { slog } from "../src/slog";

function getDocumentResult(docName: string, doc: string, databasePath: string, username: string, createdAt: number, lastModifiedAt: number, prefixPath: string): string {
    return `{
        "path": "${databasePath}${prefixPath}/${docName}",
        "doc": ${doc},
        "meta": {
            "createdAt": 5,
            "createdBy": "${username}",
            "lastModifiedAt": 5,
            "lastModifiedBy": “${username}",
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

function getReactionObject(smile: [string, boolean], frown: [string, boolean], like: [string, boolean], celebrate: [string, boolean], additionalReaction: [string, string, boolean]) {
    return `{
        ${stringAdditionHelper("smile", smile)},
        ${stringAdditionHelper("frown", frown)},
        ${stringAdditionHelper("like", like)},
        ${stringAdditionHelper("celebrate", celebrate)},
        ${stringAdditionHelper(additionalReaction[0], [additionalReaction[1], additionalReaction[2]])}
    }`;
}

function getExtensionObject(p2group50: [string, boolean]) {
    return `{
        ${stringAdditionHelper("p2group50", p2group50)}
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

        ["existingworkspace_onechannel", getDocumentResult("existingworkspace_onechannel", "{}", databasePath, username, 1701876023839, 1701876029328, "")],
        ["existing_onechannel_onepost", getDocumentResult("existing_onechannel_multposts", "{}", databasePath, username, 1701873177565, 1701873257345, "/existingworkspace_onechannel/channels")],
        ["existing_post1", getDocumentResult("multposts_post1", getPostBody("test message 1", ["", false], ["", false], ["", false]), databasePath, username, 1701876075240, 1701876083511, "existingworkspace_onechannel/channels/existing_onechannel_onepost/posts")],

        ["empty_workspace", getDocumentResult("empty_workspace", "{}", databasePath, username, 1701873100944, 1701873107272, "")],

        ["workspace_onechannel", getDocumentResult("workspace_onechannel", "{}", databasePath, username, 1701873141526, 1701873147688, "")],
        ["onechannel_multposts", getDocumentResult("onechannel_multposts", "{}", databasePath, username, 1701873177565, 1701873257345, "/workspace_onechannel/channels")],
        ["multposts_post1", getDocumentResult("multposts_post1", getPostBody("test message 1", ["", false], ["", false], ["", false]), databasePath, username, 1701873686563, 1701873691816, "/workspace_onechannel/channels/onechannel_multposts/posts")],
        ["multposts_post2", getDocumentResult("multposts_post2", getPostBody("another test message for post 2. contains reactions", [`${databasePath}/channels/onechannel_multposts/multposts_post1`, true], [getReactionObject([`[${username}]`, true], [`[${username}]`, true], [`[${username}]`, true], [`[${username}]`, true], ["", "", false]), true], ["", false]), databasePath, username, 1701873756630, 1701873756630, "/workspace_onechannel/channels/onechannel_multposts/posts")],
        ["multposts_post3", getDocumentResult("multposts_post3", getPostBody("some post content for post 3. contains extensions :smile::like::celebrate:**bold***italic*[text](https://www.google.com])", ["", false], ["", false], [getExtensionObject([`[${username}]`, true]), true]), databasePath, username, 1701873686563, 1701873691816, "/workspace_onechannel/channels/onechannel_multposts/posts")],


        ["workspace_multchannels", getDocumentResult("workspace_multchannels", `{"some data": "some value"}`, databasePath, username, 1701874540189, 1701874546840, "")],
        ["multchannels_noposts", getDocumentResult("multchannels_noposts", "{'channel data': 'channel value'}", databasePath, username, 1701873177565, 1701873257345, "/workspace_multchannels/channels")],
        ["multchannels_onepost", getDocumentResult("multchannels_noposts", "{'channel data': 'channel value'}", databasePath, username, 1701874668908, 1701874679548, "/workspace_multchannels/channels")],
        ["onepost_ <script>alert('this is an attack!')</script>", getDocumentResult("onepost_ <script>alert('this is an attack!')</script>", getPostBody("<script>alert('attack script!')</script>", ["", false], ["", false], ["", false]), databasePath, username, 1701874873310, 1701874878667, "/workspace_multchannels/channels/multchannels_onepost/posts")]
    ]);
}

export const fetchFunc = jest.fn((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {

    let baseUrl = "http://localhost:4318";
    let invalidSchemaUrl = "http://localhost:3200";
    let databasePath = "/v1/p2group50";
    let authPath = "auth";
    let dbUrl = `${baseUrl}${databasePath}`;
    let invalidSchemaDbUrl = `${invalidSchemaUrl}${databasePath}`;
    let body = '""';
    let ok = true;
    let status = 200;
    let statusText = "OK";
    let username = "test_user";
    let documentBodies = getDocumentBodies(databasePath, username);
    let method: string;
    if (init === undefined || init.method === undefined) {
        method = "GET";
    } else {
        method = init.method;
    }
    
    // define all workspace, channels, etc. bodies that I need.

    switch (input) {
        case `${baseUrl}/${authPath}`:
            switch (method) {
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
            body = `"some body"`;
            break;
        case `${dbUrl}/fetchError`:
            return Promise.reject("failed fetch");
        case `${dbUrl}/fetchNoContent`:
            body = '';
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
                body = '"auth passed"';
                break;
            }
            ok = false;
            status = 401;
            statusText = "Unauthorized";
            break;
        
        // M3ssaging cases: workspaces, channels, etc.
        case `${dbUrl}/`:
            switch (method) {
                case "GET":
                    body = `[
                        ${documentBodies.get("existingworkspace_onechannel")}
                    ]`;
                    break;
            }
            break;
        case `${dbUrl}/workspace_dne`:
            switch (method) {
                case "GET":
                    status = 404;
                    statusText = "Not Found";
                    break;
                case "DELETE":
                    status = 404;
                    statusText = "Not Found";
                    break;
            }
            break;
        case `${dbUrl}/workspace_dne?timestamp=0`:
            switch (method) {
                case "PUT":
                    status = 201;
                    statusText = "Created";
                    break;
            }
            break;
        case `${dbUrl}/workspace_dne/channels/`:
            switch (method) {
                case "PUT":
                    status = 201;
                    statusText = "Created";
                    break;
                case "DELETE":
                    status = 204;
                    statusText = "No Content";
                    break;
                case "GET":
                    body = "[]";
                    break;
            }
            break;
        case `${dbUrl}/empty_workspace`:
            switch (method) {
                case "GET":
                    body = `${documentBodies.get("empty_workspace")}`;
                    break;
                case "DELETE":
                    ok = false;
                    status = 404;
                    statusText = "No Content";
                    body = '"could not delete doc: does not exist"';
                    break;
            }
            break;
        case `${dbUrl}/empty_workspace?timestamp=0`:
            switch (method) {
                case "PUT":
                    ok = false;
                    status = 400;
                    statusText = "Bad Request";
                    body = '"could not create/replace doc: exists"';
                    break;
            }
            break;
        
        case `${dbUrl}/empty_workspace/channels/`:
            switch (method) {
                case "GET":
                    body = "[]";
                    break;
                case "PUT":
                    status = 200;
                    body = `{
                        "uri": "${databasePath}/empty_workspace/channels/"
                    }`;
                    break;
                case "DELETE":
                    ok = false;
                    status = 404;
                    statusText = "Not Found";
                    body = '"could not delete collection: does not exist"';
                    break;
            }
            break;
        
        case `${dbUrl}/existingworkspace_onechannel`:
            switch (method) {
                case "GET":
                    body = `${documentBodies.get("existingworkspace_onechannel")}`;
                    slog.info("called mock fetch existingworkspace_onechannel", ["existingworkspace_onechannel body", documentBodies.get("existingworkspace_onechannel")]);
                    break;
                case "PUT":
                    console.log("should never be overwriting an existing channel. this is an error.");
                    break;
                case "DELETE":
                    status = 204;
                    statusText = "No Content";
                    break;
            }
            break;
        
        case `${dbUrl}/existingworkspace_onechannel?timestamp=0`:
            switch (method) {
                case "PUT":
                    ok = false;
                    status = 400;
                    statusText = "Bad Request";
                    body = '"unable to create/replace doc: timestamp 0 does not match precondition timestamp of 1701876029328"';
                    break;
            }
            break;
        
        case `${dbUrl}/existingworkspace_onechannel/channels/`:
            switch (method) {
                case "PUT":
                    ok = false;
                    status = 400;
                    statusText = "Bad Request";
                    body = '"unable to create channel: exists"';
                    break;
                case "DELETE":
                    status = 204;
                    statusText = "No Content";
                    break;
                case "GET":
                    body = `[
                        ${documentBodies.get("existing_onechannel_onepost")}
                    ]`;
                    break;
            }
            break;
        
        case `${dbUrl}/existingworkspace_onechannel/channels/existing_onechannel_onepost`:
            switch (method) {
                case "GET":
                    body = `${documentBodies.get("existing_onechannel_onepost")}`;
                    break;
                case "PUT":
                    console.log("this operation will overwrite an existing channel and is an error.");
                    break;
                case "DELETE":
                    status = 204;
                    statusText = "No Content";
                    break;
            }
            break;
        
        case `${dbUrl}/existingworkspace_onechannel/channels/existing_onechannel_onepost?timestamp=0`:
            switch (method) {
                case "PUT":
                    ok = false;
                    status = 400;
                    statusText = "Bad Request";
                    body = '"unable to create/replace doc: timestamp 0 does not match precondition timestamp of 1701873257345"';
                    break;
            }
            break;
        
        case `${dbUrl}/existingworkspace_onechannel/channels/existing_onechannel_onepost/posts/`:
            switch (method) {
                case "PUT":
                    ok = false;
                    status = 400;
                    statusText = "Bad Request";
                    body = '"unable to create collection: exists"';
                    break;
                case "POST":
                    body = `{
                        "uri": "${databasePath}/existingworkspace_onechannel/channels/existing_onechannel_onepost/posts/existing_post1"
                    }`;
                    status = 201;
                    statusText = "Created";
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_onechannel`:
            switch (method) {
                case "GET":
                    body = `${documentBodies.get("workspace_onechannel")}`;
                    break;
                case "PUT":
                    console.log("should not be directly overwriting documents");
                    break;
                case "DELETE":
                    ok = false;
                    status = 404;
                    statusText = "Not Found";
                    body = '"could not delete document: not found"';
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_onechannel?timestamp=0`:
            switch (method) {
                case "PUT":
                    body = `{
                        "uri": "${databasePath}/workspace_onechannel"
                    }`;
                    status = 201;
                    statusText = "Created";
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_onechannel/channels/`:
            switch (method) {
                case "PUT":
                    body = `{
                        "uri": "${databasePath}/workspace_onechannel/channels/"
                    }`;
                    status = 201;
                    statusText = "Created";
                    break;
                case "DELETE":
                    ok = false;
                    body = '"could not delete collection: does not exist"';
                    status = 404;
                    statusText = "Not Found";
                    break;
                case "GET":
                    body = `[
                        ${documentBodies.get("onechannel_multposts")}
                    ]`;
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_onechannel/channels/onechannel_multposts`:
            switch (method) {
                case "GET":
                    body = `${documentBodies.get("onechannel_multposts")}`;
                    break;
                case "PUT":
                    console.log("should not be directly overwriting documents");
                    break;
                case "DELETE":
                    ok = false;
                    status = 404;
                    statusText = "Not Found";
                    body = '"could not delete document: not found"';
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_onechannel/channels/onechannel_multposts?timestamp=0`:
            switch (method) {
                case "PUT":
                    body = `{
                        "uri": "${databasePath}/workspace_onechannel/channels/onechannel_multposts"
                    }`;
                    status = 201;
                    statusText = "Created";
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_onechannel/channels/onechannel_multposts/posts/`:
            switch (method) {
                case "PUT":
                    body = `{
                        "uri": "${databasePath}/workspace_onechannel/channels/onechannel_multposts/posts/"
                    }`;
                    status = 201;
                    statusText = "Created";
                    break;
                case "POST":
                    body = `{
                        "uri": "${databasePath}/workspace_onechannel/channels/onechannel_multposts/posts/multposts_post1"
                    }`;
                    status = 201;
                    statusText = "Created";
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_onechannel/channels/onechannel_multposts/posts/multposts_post1`:
            switch (method) {
                case "PATCH":
                    body = `{
                        "uri": "${databasePath}/workspace_onechannel/channels/onechannel_multposts/posts/multposts_post1",
                        "patchFailed": true,
                        "message": "some reason that the patch failed"
                    }`;
                    break;
            }
            break;

        case `${dbUrl}/workspace_onechannel/channels/onechannel_multposts/posts/multposts_post2`:
            switch (method) {
                case "PATCH":
                    body = `{
                        "uri": "${databasePath}/workspace_onechannel/channels/onechannel_multposts/posts/multposts_post2",
                        "patchFailed": false,
                        "message": "patches applied"
                    }`;
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_multchannels`:
            switch (method) {
                case "GET":
                    body = `${documentBodies.get("workspace_multchannels")}`;
                    break;
                case "PUT":
                    console.log("should never be overwriting an existing document");
                    break;
                case "DELETE":
                    ok = false;
                    status = 404;
                    statusText = "Not Found";
                    body = '"could not delete document: not found"';
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_multchannels?timestamp=0`:
            switch (method) {
                case "PUT":
                    body = `{
                        "uri": "${databasePath}/workspace_multchannels"
                    }`;
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_multchannels/channels/`:
            switch (method) {
                case "GET":
                    body = `[
                        ${documentBodies.get("multchannels_noposts")},
                        ${documentBodies.get("multchannels_onepost")}
                    ]`;
                    break;
                case "PUT":
                    body = `{
                        "uri": "${databasePath}/workspace_multchannels/channels/"
                    }`;
                    status = 201;
                    statusText = "Created";
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_multchannels/channels/multchannels_noposts`:
            switch (method) {
                case "GET":
                    body = `${documentBodies.get("multchannels_noposts")}`;
                    break;
                case "PUT":
                    console.log("should never be overwriting an existing document");
                    break;
                case "DELETE":
                    ok = false;
                    status = 404;
                    statusText = "Not Found";
                    body = '"could not delete document: not found"';
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_multchannels/channels/multchannels_noposts?timestamp=0`:
            switch (method) {
                case "PUT":
                    body = `{
                        "uri": "${databasePath}/multchannels_noposts"
                    }`;
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_multchannels/channels/multchannels_noposts/posts/`:
            switch (method) {
                case "PUT":
                    body = `{
                        "uri": "${databasePath}/workspace_multchannels/channels/multchannels_noposts/posts/"
                    }`;
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_multchannels/channels/multchannels_onepost`:
            switch (method) {
                case "GET":
                    body = `${documentBodies.get("multchannels_onepost")}`;
                    break;
                case "PUT":
                    console.log("should never be overwriting an existing document");
                    break;
                case "DELETE":
                    ok = false;
                    status = 404;
                    statusText = "Not Found";
                    body = '"could not delete document: not found"';
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_multchannels/channels/multchannels_onepost?timestamp=0`:
            switch (method) {
                case "PUT":
                    body = `{
                        "uri": "${databasePath}/multchannels_noposts"
                    }`;
                    break;
            }
            break;
        
        case `${dbUrl}/workspace_multchannels/channels/multchannels_noposts/posts/`:
            switch (method) {
                case "PUT":
                    body = `{
                        "uri": "${databasePath}/workspace_multchannels/channels/multchannels_onepost/posts/"
                    }`;
                    break;
                case "POST":
                    body = `{
                        "uri": "${databasePath}/workspace_multchannels/channels/multchannels_onepost/posts/onepost_ <script>alert('this is an attack!')</script>"
                    }`;
                    status = 201;
                    statusText = "Created";
                    break;
            }
            break;
        
        // TODO: finish existing posts for this channel. Afterwards, proceed to adding all channels/ws in the map that I've defined
        // above.

        case `${invalidSchemaUrl}/${authPath}`:
            switch (method) {
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

        case `${invalidSchemaDbUrl}/workspace_onechannel`:
            switch (method) {
                case "GET":
                    body = "123";
                    break;
                case "PUT":
                    console.log("should not overwrite documents");
                    break;
                case "DELETE":
                    ok = false;
                    status = 404;
                    statusText = "Not Found";
                    body = "456";
                    break;
            }
            break;
        case `${invalidSchemaDbUrl}/workspace_onechannel?timestamp=0`:
            switch (method) {
                case "PUT":
                    body = `{
                        "some useless field": "some useless value"
                    }`;
                    status = 201;
                    statusText = "Created";
                    break;
            }
            break;
        
        case `${invalidSchemaDbUrl}/workspace_onechannel/channels/`:
            switch (method) {
                case "PUT":
                    body = `{
                        "useless field": "1.5"
                    }`;
                    status = 201;
                    statusText = "Created";
                    break;
                case "GET":
                    body = `{
                        "1.5": true
                    }`;
                    break;
            }
            break;
        
        case `${invalidSchemaDbUrl}/workspace_onechannel/channels/onechannel_multposts`:
            switch (method) {
                case "GET":
                    body = `false`;
                    break;
                case "PUT":
                    console.log("should not be overwriting existing documents");
                    break;
                case "DELETE":
                    body = '"some text"';
                    status = 204;
                    statusText = "No Content";
                    break;
            }
            break;
        
        case `${invalidSchemaDbUrl}/workspace_onechannel/channels/onechannel_multposts?timestamp=0`:
            switch (method) {
                case "PUT":
                    body = "5";
                    status = 201;
                    statusText = "Created";
                    break;
            }
            break;
        
        case `${invalidSchemaDbUrl}/workspace_onechannel/channels/onechannel_multposts/posts/`:
            switch (method) {
                case "GET":
                    body = `[
                        {
                            "invalid field 1": "joe",
                            "reactions": {},
                            "extensions": {},
                            "parent": ""
                        }
                    ]`;
                    break;
                case "PUT":
                    body = `["hello", "bye", "next"]`;
                    status = 201;
                    statusText = "Created";
                    break;
                case "DELETE":
                    body = "invalid json value";
                    status = 204;
                    statusText = "No Content";
                    break;
            }
            break;
        
        case `${invalidSchemaDbUrl}/workspace_onechannel/channels/onechannel_multposts/posts/multposts_post1`:
            switch (method) {
                case "PATCH":
                    body = `{
                        "uri": "${databasePath}/workspace_onechannel/channels/onechannel_multposts/posts/multposts_post2",
                        "message": "some reason that the patch failed"
                    }`;
                    break;
            }
            break;
        
        case `${invalidSchemaDbUrl}/workspace_onechannel/channels/onechannel_multposts/posts/multposts_post2`:
            switch (method) {
                case "PATCH":
                    body = `{
                        "hello": 123,
                    }`;
                    break;
            }
            break;

        default:
            ok = false;
            status = 404;
            statusText = "Not Found";
            body = '"Could not find specified resource"';
            console.log("error: sending requests to server outside of supported operations");
            break;
    }

    const hdrs = new Headers();
    hdrs.set("Content-Length", `${body.length}`);
    let resPromise: Promise<Response>;
    try {
        const jsonResp = JSON.parse(body);
        resPromise = Promise.resolve(jsonResp);
    } catch (e) {
        resPromise = Promise.reject(e);
    }
    slog.info("mockFetch: resPromise passed", ["resPromise.status", resPromise]);

    const response: Response = {
        ok: ok,
        status: status,
        statusText: statusText,
        headers: hdrs,
        json: () => resPromise,
    } as Response;

    return Promise.resolve(response);
})