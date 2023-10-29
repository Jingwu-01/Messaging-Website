import {OwlDBModel} from "../model/model"

const owldbModel = new OwlDBModel();

test('Get all posts', async () => {
    process.env.DATABASE_HOST = "http://localhost:4318";
    process.env.DATABASE_PATH = "/v1/p2group50"
    const data = await owldbModel.getPosts("ws1", "ch1", "Uuc5ABwJhqd4gDd");
    expect(data).toBe([]);
});