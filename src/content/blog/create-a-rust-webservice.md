---
author: Harrison Hemstreet
pubDatetime: 2023-11-26T20:41:31-07:00
title: "How to Build a Web Service in Rust"
postSlug: How-to-Build-a-Web-Service-in-Rust
featured: true
draft: false
tags:
  - computer science
  - beginner
  - rust
  - rustlang
  - webservice
  - web service
  - api
description: Learn how to build a web service using Rust, Actix-Web, PostgreSQL, SQLx and Docker!
ogImage: https://cdn.midjourney.com/86afb322-6124-47e8-93d8-408488ae9b37/0_1.webp
---

## Table of contents

## Intro

In this tutorial, I will show you how to use my `webservice_tutorial` project as a template for you to easily start building your own web services using Rust, Actix-Web, Docker, PostgreSQL and Postman. The purpose of this tutorial is to explain the more complex portions of my project so that you can quickly understand and build your own web services in Rust.

## Required Tools

1. **Rust**
   - Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. **Docker Compose & Docker Desktop**
   - make sure to install `docker compose`, not `docker-compose`. You can install both `docker compose` and Docker Desktop [here](https://docs.docker.com/desktop/). Just choose your operating system below and follow the instructions.
3. **Postman**
   - download the Postman Desktop Client [here](https://www.postman.com/downloads/). You must use the desktop version for this to work.
4. **Web Browser**
5. **Terminal / Command Prompt**
   - If you are on Windows, make sure to install WSL. You can learn how to do that [here](https://learn.microsoft.com/en-us/windows/wsl/install).
6. **Text Editor or IDE**
   - Check out JetBrain's new Rust IDE, [RustRover](https://www.jetbrains.com/rust/)

## Helpful Background Info

1. **What is REST?**
   - [How Did REST Come To Mean The Opposite of REST?](https://htmx.org/essays/how-did-rest-come-to-mean-the-opposite-of-rest/)
2. **API Best Practices**
   - [OpenAPI Specification v3.1.0](https://spec.openapis.org/oas/v3.1.0)

## Why Rust?

Rust is an excellent choice for writing web services due to its emphasis on safety and performance. Its ownership model ensures memory safety and prevents common bugs seen in other languages, enhancing the reliability of web services. Rust’s concurrency model, built around zero-cost abstractions, allows for efficient handling of multiple requests, crucial for high-traffic web services. The language's performance is comparable to C/C++, making it ideal for compute-intensive tasks. Moreover, Rust's growing ecosystem, including frameworks like Actix-Web, provides the necessary tools for web development, making it a robust and future-proof choice for building scalable, efficient, and secure web services.

## Why Actix-Web?

Actix Web is a powerful, pragmatic, and extremely fast web framework for Rust. It is designed to provide a robust foundation for building efficient and high-performance web applications and services in Rust. Actix Web leverages the strengths of Rust, such as safety and concurrency, to offer a highly scalable and fast web framework suitable for a wide range of web development needs.

## Why SQLx?

SQLx is an async, pure Rust SQL crate featuring compile-time checked queries without a DSL. It supports PostgreSQL, MySQL, SQLite, and MSSQL and is fully compatible with async-std and tokio. SQLx provides a seamless and efficient way to interact with SQL databases using Rust, allowing developers to leverage Rust's strong type system and async capabilities for database operations. The crate's emphasis on compile-time query validation helps catch errors early in the development cycle, enhancing code reliability and maintainability.

## Why Docker?

In our project, we are utilizing Docker primarily for its ability to rapidly set up a PostgreSQL database. This approach simplifies development by eliminating the need to install and configure databases directly on personal computers. Docker containers offer a lightweight, isolated environment, ensuring that the PostgreSQL instance runs consistently across different machines. This consistency is crucial for development teams, as it avoids the "works on my machine" problem.

Beyond this specific use case, Docker is renowned for its efficiency in creating, deploying, and running applications by using containers. Containers allow developers to package an application with all its dependencies into a single unit, which can then be easily moved between environments while maintaining consistency. This makes Docker an invaluable tool for modern development workflows, offering both flexibility and reliability.

## Building the Web Service

### 1. Project Setup

- **Initialize the Project**: Start by creating a new Rust project using Cargo:
  ```bash
  cargo new webservice_tutorial
  cd webservice_tutorial
  ```
- **Configure Cargo.toml**: Define your dependencies in `Cargo.toml`:
  ```toml
  [dependencies]
  actix-web = "4.3.1"
  dotenv = "0.15.0"
  serde = { version = "1.0.160", features = ["derive"] }
  serde_json = "1.0.96"
  tokio = { version = "1.27.0", features = ["full"] }
  chrono = { version = "0.4.28", features = ["serde"] }
  sqlx = { version = "0.7.1", features = ["postgres", "runtime-tokio", "chrono", "uuid", "macros"] }
  actix-cors = "0.6.4"
  uuid = { version = "1.4.1", features = ["serde"] }
  argon2 = "0.5.2"
  jsonwebtoken = "9.1.0"
  futures = "0.3.28"
  base64 = "0.21.4"
  ```

### 2. Database Setup

- **Create SQL Files**: Define your database schema and initial data. Run:
  ```bash
  touch init.sql && mkdir sql && cd sql && touch auth.sql blog.sql tag.sql
  ```
- In your project, you have separate SQL files for different parts of your schema (`auth.sql`, `blog.sql`, `tag.sql`). These files contain SQL commands to create tables and insert initial data. Since this is a tutorial primarily on Rust, we will not be covering the how-to's of PostgreSQL. Go ahead and make sure you copy the init.sql file [here](https://github.com/HarrisonHemstreet/webservice_tutorial/blob/main/init.sql) and the other sql files [here](https://github.com/HarrisonHemstreet/webservice_tutorial/tree/main/sql).

- **Docker Compose**: Use Docker Compose to set up your PostgreSQL database:

  ```yaml
  version: "3.6"
  services:
    postgres:
      image: postgres
      restart: always
      environment:
        - DATABASE_HOST=127.0.0.1
        - POSTGRES_USER=root
        - POSTGRES_PASSWORD=root
        - POSTGRES_DB=webservice_tutorial

      ports:
        - "5440:5432"
      volumes:
        - ./init.sql:/docker-entrypoint-initdb.d/init.sql
        - ./sql:/docker-entrypoint-initdb.d/sql

    pgadmin-compose:
      image: dpage/pgadmin4
      environment:
        PGADMIN_DEFAULT_EMAIL: "test@test.com"
        PGADMIN_DEFAULT_PASSWORD: "test"
      ports:
        - "16543:80"
      depends_on:
        - postgres
  ```

### 3. webservice_tutorial Application Development

Use the `webservice_tutorial` project as a template in [GitHub](https://github.com/HarrisonHemstreet/webservice_tutorial/tree/main). The following is a high level explanation for the most complex pieces.

#### Starting Application

- **Main Application**: In `src/main.rs`, set up your Actix-Web server and routes:

  ```rust
  use actix_web::{get, web, App, HttpServer, Responder};

  #[get("/")]
  async fn index() -> impl Responder {
      "Hello, World!"
  }

  #[get("/{name}")]
  async fn hello(name: web::Path<String>) -> impl Responder {
      format!("Hello {}!", &name)
  }

  #[actix_web::main]
  async fn main() -> std::io::Result<()> {
      HttpServer::new(|| App::new().service(index).service(hello))
          .bind(("127.0.0.1", 8080))?
          .run()
          .await
  }
  ```

- This helpful bit of code was taken from the [Actix homepage](https://actix.rs/).

#### Explaining the Starting Application

This code is a Rust application using the Actix-Web framework to create a simple web server with two routes. Let's break it down:

1. **Imports**:

   ```rust
   use actix_web::{get, web, App, HttpServer, Responder};
   ```

   This line imports several components from the `actix_web` crate:

   - `get`: A macro to define a handler for GET HTTP requests.
   - `web`: A module that provides types and functions for route registration and data extraction.
   - `App`: A class to set up and configure web applications.
   - `HttpServer`: A class to create and configure an HTTP server.
   - `Responder`: A trait used for types that can be converted into an HTTP response.

2. **Route Handlers**:

   - **Index Handler**:

     ```rust
     #[get("/")]
     async fn index() -> impl Responder {
         "Hello, World!"
     }
     ```

     This function is a route handler for the root URL (`"/"`). When a GET request is made to the root URL, this function responds with the text "Hello, World!". The `#[get("/")]` attribute specifies that this is a handler for GET requests to the root path. The function returns a type that implements the `Responder` trait, which in this case is a simple string slice.

   - **Hello Handler**:
     ```rust
     #[get("/{name}")]
     async fn hello(name: web::Path<String>) -> impl Responder {
         format!("Hello {}!", &name)
     }
     ```
     This function is a route handler for any GET request with a path of the form `/{name}`. It takes a `name` parameter from the path, which is extracted using `web::Path`. The function returns a formatted string greeting the provided name. The `#[get("/{name}")]` attribute specifies that this is a handler for GET requests where the path includes a name.

3. **Main Function**:
   ```rust
   #[actix_web::main]
   async fn main() -> std::io::Result<()> {
       HttpServer::new(|| App::new().service(index).service(hello))
           .bind(("127.0.0.1", 8080))?
           .run()
           .await
   }
   ```
   - `#[actix_web::main]`: This attribute macro sets up the async runtime for Actix-Web.
   - `HttpServer::new(...)`: This creates a new HTTP server. The closure passed to `new` sets up the application with the routes defined earlier.
   - `App::new()`: This creates a new application instance.
   - `.service(index).service(hello)`: These lines add the `index` and `hello` functions as services (or route handlers) to the application.
   - `.bind(("127.0.0.1", 8080))?`: This binds the server to the local address `127.0.0.1` on port `8080`. The `?` operator is used for error handling; it will return the error if the `bind` operation fails.
   - `.run()`: This starts the server asynchronously.
   - `.await`: This awaits the future returned by `run`, effectively keeping the server running indefinitely or until an error occurs.

In summary, this code sets up a basic web server with two routes: the root route (`"/"`) that responds with "Hello, World!" and a dynamic route (`"/{name}"`) that responds with a personalized greeting. The server listens on `127.0.0.1:8080`. Go ahead and try this out by going to your web browser (or Postman) and hit `http://127.0.0.1:8080/{name}`. Replace `{name}` with your name.

#### Explaining the Changes

We are now enhancing our Rust actix-web server to include additional modules and middleware for more robust functionality. The changes are as follows:

1. **Module Inclusions**:

   ```rust
   pub mod data_types;
   pub mod db;
   pub mod middleware;
   pub mod routes;
   pub mod utils;
   ```

   These lines import various custom modules:

   - `data_types`: Defines data structures used across the application.
   - `db`: Contains functionality for database interactions.
   - `middleware`: Includes middleware functions for request handling.
   - `routes`: Defines the various routes and their corresponding handlers.
   - `utils`: Utility functions used in different parts of the application.

2. **Server Configuration**:

   ```rust
   HttpServer::new(move || {
       App::new().wrap(middleware::handle_cors()).service(
           web::scope("/api/v1")
               .wrap(middleware::JWTAuth)
               .wrap(middleware::CaptureUri)
               .service(routes::auth())
               .service(routes::blog())
               .service(routes::tag()),
       )
   })
   ```

   The server is now configured to use the defined middleware and route modules. `middleware::handle_cors()` applies Cross-Origin Resource Sharing (CORS) settings. The server is scoped to `/api/v1`, meaning all routes will be prefixed with this path. It also uses JWT-based authentication (`middleware::JWTAuth`) and captures URI for logging or analysis (`middleware::CaptureUri`). The services (`routes::auth()`, `routes::blog()`, `routes::tag()`) are linked to their respective route handlers defined in the `routes` module.

3. **Server Binding and Execution**:

   ```rust
   .bind(("127.0.0.1", 8080))?
   .run()
   .await
   .expect("\nERROR: src/main.rs: server initialization fail\n");
   ```

   The server binds to `127.0.0.1` on port `8080`. The `run` method starts the server asynchronously, and `await` keeps it running. The `expect` method provides an error message if the server fails to initialize.

These enhancements make our web server more structured and feature-rich, allowing for modular development and easier maintenance. Each component has a specific role, making the codebase more readable and scalable.

#### Adding the Data Structures

In the `webservice_tutorial/src/data_types/structs/mod.rs` file found [here](https://github.com/HarrisonHemstreet/webservice_tutorial/blob/main/src/data_types/structs/mod.rs), we define several data structures that are essential for our Rust-based web service. This module serves as a central location for struct definitions, making our codebase more organized and maintainable.

1. **Imports**:

   ```rust
   use serde::{Deserialize, Serialize};
   ```

   The `serde` crate is used for serializing and deserializing data, a common requirement in web services for handling JSON data.

2. **Sub-Modules**:

   - `pub mod blog; pub use self::blog::Blog;`
   - `pub mod error_message; pub use self::error_message::ErrorMessage;`
   - `pub mod auth; pub use self::auth::Auth; pub use self::auth::Status;`
   - `mod tag; pub use self::tag::Tag; pub use self::tag::AssocTable; pub use self::tag::TagQueryParams;`

   These lines define and publicly expose structs from sub-modules like `blog`, `error_message`, `auth`, and `tag`. This modular approach allows for separation of concerns, where each module focuses on a specific area of the application (e.g., authentication, blog-related data).

3. **Id Struct**:

   ```rust
   #[derive(Serialize, Deserialize, Debug)]
   pub struct Id {
       pub id: Option<i32>,
   }
   ```

   The `Id` struct is a simple structure with an optional integer field `id`. It is marked with `Serialize` and `Deserialize` to enable easy conversion to and from JSON. The `Debug` trait is derived for convenient debugging.

4. **Display Implementation for Id**:
   ```rust
   impl std::fmt::Display for Id {
       fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
           if let Some(id) = self.id {
               return write!(f, "Id: {}", id);
           }
           write!(f, "Id: {}", "None")
       }
   }
   ```
   This implementation of the `Display` trait for the `Id` struct allows it to be formatted as a string. This is useful for logging or displaying the `Id` in a human-readable format. The implementation checks if `id` is `Some` and displays its value; otherwise, it displays `"None"`.

These data structures and their organization into modules lay the foundation for a clean and efficient codebase, crucial for a scalable and maintainable web service. Make sure to check out each struct [here](https://github.com/HarrisonHemstreet/webservice_tutorial/tree/main/src/data_types/structs). The `Auth`, `Blog` and `Tag` structs are definitions for the data we want to take in from the users and the data we want to output to the users.

#### Connecting to the Database

The "Connecting to the Database" section in our Rust web service project details the process of establishing a connection to the PostgreSQL database using the `sqlx` crate.

1. **Environment Variable**:

   - The `DATABASE_URL` environment variable is used to retrieve the database connection string, crucial for connecting to the PostgreSQL database.

2. **Connection Process**:

   - The function `connect` attempts to establish a connection pool to the database using `PgPool::connect`.
   - It returns a `Result` type, which either contains a `PgPool` object on successful connection or an `ErrorMessage` struct upon failure.

3. **Error Handling**:
   - The function includes comprehensive error handling to catch and format different types of database connection errors (`Configuration`, `Database`, and other unknown errors).

This approach ensures a reliable and maintainable way of connecting to the database, centralizing the database connection logic and error handling.

#### Auth Routes

The "Auth Routes" section in our Rust web service project focuses on handling user authentication, including user creation and login. The code leverages various Rust crates and our own modules to implement these features securely and efficiently.

1. **Environment and Dependencies**:

   - The code uses environment variables and external crates like `jsonwebtoken`, `argon2`, and `sqlx` to handle JWT token generation, password hashing, and database interactions.

2. **Structs for JWT Claims and Login Messages**:

   - `Claims` and `Claims2` structs are defined for handling JWT claims. They hold user-related data and the expiration time for the token.
   - `LoginMessage` struct is used to structure the response message after a successful login.

3. **Create User Route (`/auth/create_user`)**:

   - This endpoint allows users to register. It connects to the database, hashes the user's password using Argon2, and inserts the new user into the database.
   - A JWT token is generated and returned in the response header, authorizing the newly created user.

4. **Login Route (`/auth/login`)**:

   - This endpoint authenticates users. It fetches the user from the database based on the username and verifies the password using Argon2.
   - Upon successful authentication, a JWT token is generated with the user's claims and returned in the response header.

5. **Error Handling**:
   - Both routes include error handling to manage database connection issues and potential runtime errors during the authentication process.

This implementation provides a secure and efficient way to handle user authentication in our Rust web service, leveraging the power of Actix-Web and Rust's strong type system.

#### Blog Routes

The "Blog Routes" section in our Rust web service project provides various endpoints for managing blog-related data. These routes allow for creating, retrieving, updating, and deleting blog entries. The Tag routes follow nearly the same conventions. Here's an overview of each route:

1. **Create Blog (`/blog`)**:

   - This POST route allows users to create a new blog entry. It accepts a `Blog` struct as JSON, inserts it into the database, and returns the newly created blog entry.

2. **Get Featured Blogs (`/blog/featured`)**:

   - The GET route fetches featured blog entries (limited to 2). It queries the database for blogs where `featured` is `TRUE` and returns them.

3. **Get Blog by ID or All Blogs (`/blog`)**:

   - This GET route uses a query parameter `id` to fetch a specific blog entry. If `id` is not provided, it returns all blog entries. It dynamically adjusts the SQL query based on the presence of the `id`.

4. **Update Blog (`/blog`)**:

   - The PUT route updates an existing blog entry. It uses the `ON CONFLICT` SQL clause to handle the update, ensuring that the blog entry is updated if it exists or created if it doesn't.

5. **Delete Blog (`/blog`)**:
   - This DELETE route allows for the deletion of a blog entry based on its `id`. It removes the entry from the database and returns a `204 No Content` status on success.

Each route includes error handling for database connection issues and potential runtime errors. These blog routes provide a comprehensive set of functionalities for blog management within the web service.

#### The HTTPServiceFactory

The "HTTPServiceFactory" section of the Rust web service project (found [here](https://github.com/HarrisonHemstreet/webservice_tutorial/blob/main/src/routes/mod.rs)) focuses on creating and organizing HTTP service factories for different modules like `auth`, `tag`, and `blog`. Each module corresponds to a specific set of functionalities within the web service. The code leverages Actix Web's `HttpServiceFactory` to group related request handlers.

1. **Function Definitions**:

   - Each function (`auth`, `tag`, `blog`) returns an implementation of `HttpServiceFactory`. This trait is used to construct HTTP services in Actix Web.

2. **Module Integration**:

   - The functions integrate route handlers from their respective modules. For example, `auth()` returns a tuple containing `auth::login` and `auth::create_user`, representing the login and user creation endpoints.

3. **Purpose**:
   - These functions provide a clean and organized way to group related routes and expose them as services. This structure enhances the modularity and readability of the web service code.

By using `HttpServiceFactory`, the code effectively organizes different sets of functionalities (authentication, blog management, tag management) into distinct services, making the application more maintainable and scalable.

#### JWT Middleware

The "JWT Middleware" section in our Rust web service project provides a middleware for handling JSON Web Token (JWT) authentication. This middleware ensures that routes are protected by verifying JWTs in incoming requests. Here's an overview of its functionality:

1. **Middleware Setup**:

   - The middleware is defined as `JWTAuth` and `AuthMiddleware`. `JWTAuth` serves as a factory for creating instances of `AuthMiddleware`.

2. **Claims Structure**:

   - A `Claims` struct is defined to deserialize the expected fields from the JWT, including user information and the token's expiration time.

3. **Middleware Logic**:

   - The middleware extracts the `Authorization` header from incoming requests and verifies the JWT using the `jsonwebtoken` crate.
   - It checks the token's validity based on the provided secret key and algorithm (HS256).
   - If the token is valid, the request is allowed to proceed. If it's invalid, an unauthorized error is returned.

4. **Environment Variables and Configuration**:
   - Environment variables, like `JWT_SECRET`, are used to configure important aspects of the middleware, like the JWT decoding key.
   - An optional `SKIP_AUTH` environment variable allows bypassing authentication for certain routes, which is useful during development or testing.

This JWT middleware is essential for securing routes and ensuring that only authenticated users can access specific parts of the web service.

#### CORS Middleware

The "CORS Middleware" in the Rust web service project is designed to handle Cross-Origin Resource Sharing (CORS) settings. CORS is crucial for allowing or restricting web applications from different domains to interact with the service. This middleware is implemented using the `actix_cors` crate.

1. **Environment Variables**:

   - The middleware uses environment variables to dynamically set the allowed origins. `FRONTEND_URL` is used for the production environment, and `DEV_FRONTEND_URL` is used in development environments.

2. **Configuration**:
   - The `Cors::permissive()` method is used to create a new CORS middleware instance.
   - The middleware is configured to allow requests from the specified origin (`allowed_origin`), which is determined based on the build configuration (debug or release).
   - It is set to accept any HTTP method (`allow_any_method`) and any header (`allow_any_header`).

This setup ensures flexibility in handling CORS policies, allowing seamless interaction between the frontend and backend across different environments.

### Using webservice_tutorial as a Template

Now that all that is explained, you should be able to easily take the current [webservice_tutorial project](https://github.com/HarrisonHemstreet/webservice_tutorial/tree/main) and be able to extend it for all your web service needs! In order to use this project as a starting platform for yourself, go to the project page on [GitHub](https://github.com/HarrisonHemstreet/webservice_tutorial/tree/main). Next, find the green button that says, `Use this template`. Click `Create a new repository`. You should then be able to create a new repo from your own account.

## Conclusion

In conclusion, the `webservice_tutorial` project is a comprehensive guide to building a web service using Rust, Actix-Web, SQLx, and Docker. This tutorial covers everything from setting up the environment and database to developing a robust web application with features like JWT authentication and CORS middleware. By following this guide, developers can leverage Rust's safety and performance benefits, creating scalable and efficient web services. The modular approach and detailed explanations of each component make this project an excellent starting point for anyone looking to dive into web development with Rust.

The project is structured to be easily extendable, allowing you to adapt and build upon the foundational elements for your specific needs. The use of environment variables, middleware, and organized routes ensures that the application is both secure and maintainable.

For those looking to start their own projects, the `webservice_tutorial` on [GitHub](https://github.com/HarrisonHemstreet/webservice_tutorial/tree/main) serves as a valuable template. Simply use the "Use this template" feature on GitHub to create a new repository and begin customizing it for your purposes. This approach streamlines the development process, giving you a solid foundation to build upon, and allowing you to focus on the unique aspects of your web service.
