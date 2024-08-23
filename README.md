# Northcoders News API

# Setup instructions!

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
