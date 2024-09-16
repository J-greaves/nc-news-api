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

describe("/api/bad_endpoint", () => {
  test("GET:404 receive 404 and relevant message if trying to access non existant endpoint", () => {
    return request(app)
      .get("/api/bad_endpoint")
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
          comment_count: "11",
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
        expect(response.body.msg).toBe("article_id not found");
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
  test("GET 200 returns all the articles sorted by title in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=asc")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length > 0).toBe(true);
        expect(response.body.articles).toBeSortedBy("title", {
          ascending: true,
        });
      });
  });
  test("GET: 400 responds with an error message for an invalid sort_by column", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid_column&order=asc")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid sort_by column");
      });
  });

  test("GET: 400 responds with an error message for an invalid order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=invalid_order")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid order");
      });
  });

  test("GET: 200 - filters articles by topic (max 10 due to pagination default)", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toHaveLength(10);
        response.body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("GET: 404 - responds with error if topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=bad_topic")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe(
          "Topic not found or no articles for this topic"
        );
      });
  });
  test("GET: 200 - returns all articles if no topic is provided (max 10 due to pagination default)", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(10);
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
  test("POST:400 returns error when missing username in req body", () => {
    const newComment = {
      body: "this is a comment by icellusedkars",
    };
    return request(app)
      .post("/api/articles/4/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Missing required username or body");
      });
  });
  test("POST: 404 returns error if article id does not exist", () => {
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
  test("POST: 404 returns error if username does not exist", () => {
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
describe("/api/articles/:article_id", () => {
  test("PATCH: 200 updates article by article_id with positive vote increment", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 10 })
      .expect(201)
      .then((response) => {
        expect(response.body.article.article_id).toBe(1);
        expect(response.body.article.votes).toBe(110);
      });
  });
  test("PATCH: 200 updates article by article_id with negative vote increment", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -10 })
      .expect(201)
      .then((response) => {
        expect(response.body.article.article_id).toBe(1);
        expect(response.body.article.votes).toBe(90);
      });
  });
  test("PATCH: 200 updates article by article_id when article doesn't already have any votes", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({ inc_votes: 10 })
      .expect(201)
      .then((response) => {
        expect(response.body.article.article_id).toBe(2);
        expect(response.body.article.votes).toBe(10);
      });
  });
  test("PATCH: 400 returns error if inc_votes is missing from req.body", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Missing votes");
      });
  });
  test("PATCH: 404 returns error if article id does not exist", () => {
    return request(app)
      .patch("/api/articles/999")
      .send({ inc_votes: 10 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article ID does not exist");
      });
  });
});
describe("/api/comments/:comment_id", () => {
  test("DELETE: 204 returns 204 code and empty res.body", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
  test("DELETE: 404 return error if comment_id does not exist", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Comment ID does not exist");
      });
  });
  test("DELETE: 400 return error if comment_id is invalid", () => {
    return request(app)
      .delete("/api/comments/invalid_id")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Comment ID is invalid");
      });
  });
});
describe("/api/users", () => {
  test("GET: 200 respond with all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        expect(response.body.users.length).toBe(4);
        response.body.users.forEach((user) => {
          expect(user).toHaveProperty("username", expect.any(String));
          expect(user).toHaveProperty("name", expect.any(String));
          expect(user).toHaveProperty("avatar_url", expect.any(String));
        });
      });
  });
});
describe("/api/users/:username", () => {
  test("GET: 200 responds with user object for username passed as param", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then((response) => {
        expect(response.body.user).toEqual({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  test("GET: 404 responds with error msg when username passed as param does not exist", () => {
    return request(app)
      .get("/api/users/non_existant_user")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Username does not exist");
      });
  });
});
describe("/api/comments/:comment_id", () => {
  test("PATCH: 200 updates comment votes by comment_id with positive vote increment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then((response) => {
        expect(response.body.comment.comment_id).toBe(1);
        expect(response.body.comment.votes).toBe(17);
      });
  });
  test("PATCH: 200 updates comment votes by comment_id with negative vote increment", () => {
    return request(app)
      .patch("/api/comments/5")
      .send({ inc_votes: -1 })
      .expect(200)
      .then((response) => {
        expect(response.body.comment.comment_id).toBe(5);
        expect(response.body.comment.votes).toBe(-1);
      });
  });
  test("PATCH: 200 updates comment votes by comment_id when comment doesn't already have any votes", () => {
    return request(app)
      .patch("/api/comments/5")
      .send({ inc_votes: 1 })
      .expect(200)
      .then((response) => {
        expect(response.body.comment.comment_id).toBe(5);
        expect(response.body.comment.votes).toBe(1);
      });
  });
  test("PATCH: 400 returns error if inc_votes is missing from req.body", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Missing votes");
      });
  });
  test("PATCH: 404 returns error if comment id does not exist", () => {
    return request(app)
      .patch("/api/comments/999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Comment ID does not exist");
      });
  });
  test("PATCH: 400 returns error if comment id is invalid format", () => {
    return request(app)
      .patch("/api/comments/invalid_format")
      .send({ inc_votes: 1 })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Comment ID is invalid");
      });
  });
});

describe("/api/articles", () => {
  test("POST: 201 adds a new article to the database and responds with that article", () => {
    const newArticle = {
      author: "icellusedkars",
      title: "New article by icellusedkars",
      body: "this is a new article by icellusedkars",
      topic: "paper",
      article_img_url:
        "https://www.worksheetsplanet.com/wp-content/uploads/2023/03/What-is-an-article.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((response) => {
        expect(response.body.article.author).toBe("icellusedkars");
        expect(response.body.article.title).toBe(
          "New article by icellusedkars"
        );
        expect(response.body.article.body).toBe(
          "this is a new article by icellusedkars"
        );
        expect(response.body.article.topic).toBe("paper");
        expect(response.body.article.article_img_url).toBe(
          "https://www.worksheetsplanet.com/wp-content/uploads/2023/03/What-is-an-article.jpg"
        );
        expect(response.body.article.comment_count).toBe(0);
        expect(typeof response.body.article.article_id).toBe("number");
        expect(typeof response.body.article.created_at).toBe("string");
      });
  });
  test("POST: 201 adds a new article to the database and responds with that article and sets article_img_url to default if not provided in request body", () => {
    const newArticle = {
      author: "icellusedkars",
      title: "New article by icellusedkars",
      body: "this is a new article by icellusedkars",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((response) => {
        expect(response.body.article.author).toBe("icellusedkars");
        expect(response.body.article.title).toBe(
          "New article by icellusedkars"
        );
        expect(response.body.article.body).toBe(
          "this is a new article by icellusedkars"
        );
        expect(response.body.article.topic).toBe("paper");
        expect(response.body.article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
        expect(response.body.article.comment_count).toBe(0);
        expect(typeof response.body.article.article_id).toBe("number");
        expect(typeof response.body.article.created_at).toBe("string");
      });
  });
  test("POST:400 returns error when missing required keys in request body", () => {
    const newArticle = {
      author: "icellusedkars",
      body: "this is a new article by icellusedkars",
      topic: "paper",
      article_img_url:
        "https://www.worksheetsplanet.com/wp-content/uploads/2023/03/What-is-an-article.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Missing required actricle property");
      });
  });
  test("POST:400 returns error when author is not in found in user table", () => {
    const newArticle = {
      author: "unknown_user",
      title: "New article by unknown_user",
      body: "this is a new article by unknown_user",
      topic: "paper",
      article_img_url:
        "https://www.worksheetsplanet.com/wp-content/uploads/2023/03/What-is-an-article.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Username does not exist");
      });
  });
  test("POST:400 returns error when topic is not in found in topic table", () => {
    const newArticle = {
      author: "icellusedkars",
      title: "New article by icellusedkars",
      body: "this is a new article by icellusedkars",
      topic: "unknown_topic",
      article_img_url:
        "https://www.worksheetsplanet.com/wp-content/uploads/2023/03/What-is-an-article.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Topic does not exist");
      });
  });
  test("POST:400 returns error when body keys have invalid values", () => {
    const newArticle = {
      author: "icellusedkars",
      title: 9999,
      body: "this is a new article by icellusedkars",
      topic: "paper",
      article_img_url:
        "https://www.worksheetsplanet.com/wp-content/uploads/2023/03/What-is-an-article.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid values in article properties");
      });
  });
});
describe("GET /api/articles", () => {
  test("GET /api/articles with default pagination returns articles with total count", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeInstanceOf(Array);
        expect(response.body.articles.length).toBeLessThanOrEqual(10);
        expect(response.body.total_count).toBeGreaterThan(0);
      });
  });
  test("GET /api/articles with custom pagination returns correct page of articles", () => {
    return request(app)
      .get("/api/articles?limit=5&p=2")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeInstanceOf(Array);
        expect(response.body.articles.length).toBe(5);
        expect(response.body.total_count).toBe(13);
      });
  });
  test("GET /api/articles with custom pagination and topic query returns correct page of articles", () => {
    return request(app)
      .get("/api/articles?limit=5&p=2&topic=mitch")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeInstanceOf(Array);
        expect(response.body.articles.length).toBe(5);
        expect(response.body.total_count).toBe(12);
      });
  });
  test("GET /api/articles with invalid pagination parameters returns error", () => {
    return request(app)
      .get("/api/articles?limit=-5&p=abc")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid pagination parameters");
      });
  });
});
