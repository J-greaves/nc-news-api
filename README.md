# Northcoders News API

This project is RESTful API designed for a news application that supports CRUD operations. It is a backend service that allows users to interact with various elements of a news platform such as articles, topics, comments and other user profiles.
Built with Node.js, Express and PostgreSQL.

### Key Features:

- CRUD Operations: Create, Read, Update and Delete operations for articles, comments and users.
- Sorting and Filtering: Enables users to sort and filter articles by criteria such as date, author, topic etc. helping users find relevant content
- Comment Count Aggregation: Provides aggregate data on the number of comments associated with each article, giving users insights into engagement and interaction.
- Error Handling: Comprehensive error handling for invalid requests and nonexistent resources.

## Hosted Version

You can access the hosted version of this API [here](https://nc-news-api-jg.onrender.com/api).

## Setup instructions!

1.  Clone the Repository

    Start by cloning your own local version of the original repository in your terminal, then navigate to the root directory.
    In your terminal, run

    - git clone https://github.com/J-greaves/nc-news-api.git
    - cd be-nc-news

2.  Create .env files

    In the root directory of the project, create these files:

        - `.env.development`
        - `.env.test`

    Inside these files, add the following line of code:

        For the `.env.development` file:

            - PGDATABASE=nc_news

        For the `env.test` file:

            - PGDATABASE=nc_news_test

    These names refer to the different databases you'll use for development and testing, defined in the `db/setup.sql` file.

    Ensure the .gitignore file has a line that reads:

        .env.*

    This will prevent the env files from being pushed to the repository

3.  Install dependencies

    Ensuring you are in the root directory of the repository, run the following command in your terminal:

        - npm install

4.  Set up the databases

    Next run the following command in your terminal to set up the databases:

        - npm run seed

5.  Seed the development database

    Now that the database has been created, it can be seeded with data. Run the following command:

        - npm run seed

## Minimum Requirements

- Node.js: v14.x or later
- PostgreSQL: v12.x or later
