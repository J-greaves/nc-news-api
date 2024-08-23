const app = require("../app");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");

beforeEach(() => {
  return seed(data);
});
afterAll(() => db.end());

describe("/api/whaaaaaaaa???", () => {
  test("GET:404 receive 404 and relevant message if trying to access non existant endpoint", () => {
    return request(app)
      .get("/api/whaaaaaaaa???")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Route not found");
      });
  });
});

describe("/api/topics", () => {
  test("GET:200 sends an array of topics to the client", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        console.log(response.body.topics);
        expect(response.body.topics.length).toBe(3);
        response.body.topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug", expect.any(String));
          expect(topic).toHaveProperty("description", expect.any(String));
        });
      });
  });
  test("POST: should return 405 for invalid method", () => {
    return request(app)
      .post("/api/topics")
      .expect(405)
      .then((response) => {
        expect(response.body.msg).toBe("Method not allowed");
      });
  });
});
