const app = require("../app");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const endpoints = require("../endpoints.json");
require("jest-sorted");

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
        expect(response.body).toHaveProperty("endpoints");
        expect(response.body.endpoints).toEqual(endpoints);
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("GET:200 retrieves an article by its ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body.article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("GET:404 returns an error if the article ID does not exist", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article not found");
      });
  });
  test("GET:400 returns an error if the article ID is invalid", () => {
    return request(app)
      .get("/api/articles/bad_request")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Article ID is invalid");
      });
  });
});

describe("/api/articles", () => {
  test("GET 200 returns all the articles sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length > 0).toBe(true);
        expect(response.body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
        response.body.articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("string");
          expect(article.body).toBe(undefined);
        });
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("GET: 200 returns all comments from the article that matches id query", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length > 0).toBe(true);
        expect(response.body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
        response.body.comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(comment.article_id).toBe(3);
        });
      });
  });
  test("GET: 200 returns empty array if article exists but has no comments", () => {
    return request(app)
      .get("/api/articles/4/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments.length).toBe(0);
        expect(Array.isArray(response.body.comments)).toBe(true);
      });
  });
  test("GET: 404 returns error if article id does not exist", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article ID does not exist");
      });
  });
  test("GET: 400 returns error if article id is invalid", () => {
    return request(app)
      .get("/api/articles/invalid_id/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Article ID is invalid");
      });
  });
});
describe("/api/articles/:article_id/comments", () => {
  test("POST: 201 adds a new comment to article with specified ID and responds with that comment", () => {
    const newComment = {
      username: "icellusedkars",
      body: "this is a comment by icellusedkars",
    };
    return request(app)
      .post("/api/articles/4/comments")
      .send(newComment)
      .expect(201)
      .then((response) => {
        expect(response.body.comment.body).toBe(
          "this is a comment by icellusedkars"
        );
        expect(response.body.comment.author).toBe("icellusedkars");
      });
  });
  test("POST:400 inserts a new treasure to the db and sends the new treasure back to the client", () => {
    const newComment = {
      body: "this is a comment by icellusedkars",
    };
    return request(app)
      .post("/api/articles/4/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Missing username or body");
      });
  });
  test("GET: 404 returns error if article id does not exist", () => {
    const newComment = {
      username: "icellusedkars",
      body: "this is a comment by icellusedkars",
    };
    return request(app)
      .post("/api/articles/999/comments")
      .send(newComment)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article ID does not exist");
      });
  });
  test("GET: 404 returns error if username does not exist", () => {
    const newComment = {
      username: "icellusedkarszzzzzzzzz",
      body: "this is a comment by icellusedkars",
    };
    return request(app)
      .post("/api/articles/4/comments")
      .send(newComment)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Username does not exist");
      });
  });
});
