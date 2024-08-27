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
        expect(response.body.topics.length).toBe(3);
        response.body.topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug", expect.any(String));
          expect(topic).toHaveProperty("description", expect.any(String));
        });
      });
  });
});

describe("/api", () => {
  test("GET:200 sends documentation for available endpoints to the client", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body.docs).toHaveProperty("GET /api");
        expect(response.body.docs).toHaveProperty("GET /api/topics");
        expect(response.body.docs).toHaveProperty("GET /api/articles");
      });
  });
});
