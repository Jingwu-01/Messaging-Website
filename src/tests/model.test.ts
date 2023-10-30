import {OwlDBModel} from "../model/model"

const owldbModel = new OwlDBModel();

// Test all posts.
test('Get all posts', async () => {
    // Set process environmental variables. Is there a better way to do this?
    process.env.DATABASE_HOST = "http://localhost:4318";
    process.env.DATABASE_PATH = "/v1/p2group50"
    // This always fails because 'fetch' is not recognized?
    const data = await owldbModel.getPosts("ws1", "ch1", "Uuc5ABwJhqd4gDd");
    expect(data).toBe([]);
});