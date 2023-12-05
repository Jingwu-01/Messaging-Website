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

    switch (input) {
        case `${baseUrl}/${authPath}`:
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
        case `${invalidSchemaUrl}/${authPath}`:
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
        case ``
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