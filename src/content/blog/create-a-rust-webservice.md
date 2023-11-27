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
ogImage: https://i.imgur.com/ffPQTa2.jpg
---

## Table of contents

## Introduction

Welcome to this comprehensive tutorial on building web services using Rust! Here, I'll guide you through my `webservice_tutorial` project, providing a template and detailed explanations to help you swiftly create your own web services. This tutorial focuses on Rust, Actix-Web, Docker, PostgreSQL, and Postman, highlighting complex aspects for a clear understanding. You can find and use the template in your future projects on GitHub [here](https://github.com/HarrisonHemstreet/webservice_tutorial/tree/main).

## Prerequisites

To follow along, ensure you have these tools installed:

1. **Rust**

   - Install Rust with this command:
     ```bash
     curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
     ```

2. **Docker Compose & Docker Desktop**

   - Install `docker compose` (not `docker-compose`) and Docker Desktop from [Docker's official site](https://docs.docker.com/desktop/). Select your OS and follow the instructions.

3. **Postman**

   - Download the Postman Desktop Client from [Postman's website](https://www.postman.com/downloads/). The desktop version is required.

4. **Web Browser**

5. **Terminal / Command Prompt**

   - Windows users should install WSL, as detailed [here](https://learn.microsoft.com/en-us/windows/wsl/install).

6. **Text Editor or IDE**
   - Consider using JetBrain's Rust IDE, [RustRover](https://www.jetbrains.com/rust/).

## Background Knowledge

Familiarize yourself with these concepts for a smoother learning experience:

1. **Understanding REST**

   - Read ["How Did REST Come To Mean The Opposite of REST?"](https://htmx.org/essays/how-did-rest-come-to-mean-the-opposite-of-rest/) for insights into REST.

2. **API Best Practices**
   - Refer to the [OpenAPI Specification v3.1.0](https://spec.openapis.org/oas/v3.1.0) for API guidelines.

## Why Choose Rust for Web Services?

Rust stands out for web services due to its safety and performance. Its ownership model guarantees memory safety, reducing common bugs. The language's concurrency model efficiently handles multiple requests, vital for high-traffic services. Rust's performance rivals C/C++, making it suitable for compute-intensive tasks. With a growing ecosystem, including frameworks like Actix-Web, Rust is a robust choice for scalable, efficient, and secure web services.

## The Power of Actix-Web

Actix Web is a high-performance, pragmatic web framework for Rust. It harnesses Rust's strengths, such as safety and concurrency, to provide a scalable and fast framework for diverse web development needs.

## SQLx: The Async SQL Crate for Rust

SQLx is an asynchronous, pure Rust SQL crate with compile-time checked queries, supporting PostgreSQL, MySQL, SQLite, and MSSQL. It's compatible with async-std and tokio, offering a seamless way to interact with SQL databases using Rust's type system and async capabilities.

## Docker: Simplifying Development

We use Docker to set up a PostgreSQL database quickly, avoiding the need to install and configure databases on personal computers. Docker containers ensure consistent environments, solving the "works on my machine" problem and streamlining development workflows.

## Examining the Web Service

### 1. Project Setup

- **Our Cargo.toml**:

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

- **SQL Files**: All SQL files are located in `webservice_tutorial/sql` with the initialization file at `webservice_tutorial/init.sql`.
- **Docker Compose**: Below is our `docker-compose.yml` file. For a detailed explanation of this setup, refer to [this guide](https://onexlab-io.medium.com/docker-compose-postgres-initdb-ba0021deef76):

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

Utilize the `webservice_tutorial` project as a template, available on [GitHub](https://github.com/HarrisonHemstreet/webservice_tutorial/tree/main). The following sections provide a comprehensive explanation of its most intricate components.

#### Starting Application

- **Main Application**: The `src/main.rs` file initializes the Actix-Web server and routes:

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

This code snippet is adapted from the [Actix homepage](https://actix.rs/).

#### Explaining the Starting Application

This Rust application leverages the Actix-Web framework to establish a basic web server with two routes. Here's a breakdown of its components:

1. **Imports**:

```rust
use actix_web::{get, web, App, HttpServer, Responder};
```

This line brings in several essential components from the `actix_web` crate, including the `get` macro for GET request handlers, the `web` module for route registration, `App` for application setup, `HttpServer` for server configuration, and `Responder` for response handling.

2. **Route Handlers**:

- **Index Handler**:

```rust
#[get("/")]
async fn index() -> impl Responder {
    "Hello, World!"
}
```

This function handles GET requests to the root URL (`"/"`), responding with "Hello, World!". The `#[get("/")]` attribute designates it as a handler for GET requests at the root path.

- **Hello Handler**:

```rust
#[get("/{name}")]
async fn hello(name: web::Path<String>) -> impl Responder {
    format!("Hello {}!", &name)
}
```

This function manages GET requests to `/{name}` paths, greeting the user with their name extracted from the URL.

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

This function sets up and runs the server, binding it to `127.0.0.1:8080`. The `#[actix_web::main]` macro initializes the async runtime, and the `?` operator handles potential errors during binding.

This code establishes a simple web server with two routes: a root route returning "Hello, World!" and a dynamic route for personalized greetings. Access these routes via a web browser or a tool like Postman at `http://127.0.0.1:8080/{name}`, replacing `{name}` with your desired name.

#### Explaining the Changes

We've enhanced our Rust actix-web server to include additional modules and middleware for more robust functionality. The updates are as follows:

1. **Module Inclusions**:

```rust
pub mod data_types;
pub mod db;
pub mod middleware;
pub mod routes;
pub mod utils;
```

These lines import custom modules, each serving a specific purpose, such as `data_types` for data structures, `db` for database interactions, `middleware` for request handling, `routes` for defining route handlers, and `utils` for utility functions.

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

The server now uses middleware for CORS handling (`middleware::handle_cors()`) and is scoped under `/api/v1`. It incorporates JWT-based authentication (`middleware::JWTAuth`) and URI capturing (`middleware::CaptureUri`). The `routes` module links to specific route handlers.

3. **Server Binding and Execution**:

```rust
.bind(("127.0.0.1", 8080))?


.run()
.await
```

The server binds to `127.0.0.1:8080` and runs asynchronously, awaiting incoming requests.

This enhanced server setup provides a structured and scalable foundation for building a feature-rich web service with Rust and Actix-Web.

#### Adding the Data Structures

In the `webservice_tutorial/src/data_types/structs/mod.rs` file, accessible [here](https://github.com/HarrisonHemstreet/webservice_tutorial/blob/main/src/data_types/structs/mod.rs), we meticulously define several pivotal data structures for our Rust-based web service. This module, acting as a centralized hub for struct definitions, significantly enhances the organization and maintainability of our codebase.

1. **Imports**:

```rust
use serde::{Deserialize, Serialize};
```

We utilize the `serde` crate for its robust serialization and deserialization capabilities, a fundamental requirement in web services for processing JSON data.

2. **Sub-Modules**:

```rust
pub mod blog;
pub use self::blog::Blog;

pub mod error_message;
pub use self::error_message::ErrorMessage;

pub mod auth;

mod tag;
pub use self::tag::Tag;
pub use self::tag::AssocTable;
pub use self::tag::TagQueryParams;

pub use self::auth::Auth;
pub use self::auth::Status;
```

These lines strategically define and expose structs from sub-modules like `blog`, `error_message`, `auth`, and `tag`. This modular design fosters a separation of concerns, allowing each module to concentrate on a distinct aspect of the application, such as authentication or blog-related data.

3. **Id Struct**:

```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct Id {
    pub id: Option<i32>,
}
```

The `Id` struct, with its optional integer field `id`, is streamlined for JSON conversion, thanks to the `Serialize` and `Deserialize` traits. The inclusion of the `Debug` trait aids in effective debugging.

4. **Display Implementation for Id**:

```rust
impl std::fmt::Display for Id {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Id: {}", self.id.map_or_else(|| "None".to_string(), |id| id.to_string()))
    }
}
```

By implementing the `Display` trait for the `Id` struct, we enable its string formatting, which is invaluable for logging or presenting the `Id` in a user-friendly format. The implementation elegantly handles the presence or absence of `id`.

These data structures, along with their modular organization, form the backbone of a streamlined and scalable codebase, essential for a robust web service. Explore each struct in detail [here](https://github.com/HarrisonHemstreet/webservice_tutorial/tree/main/src/data_types/structs). The `Auth`, `Blog`, and `Tag` structs are pivotal for managing user input and output.

#### Connecting to the Database

Code found [here](https://github.com/HarrisonHemstreet/webservice_tutorial/blob/main/src/db.rs)

1. **Environment Variable**:

- We leverage the `DATABASE_URL` environment variable to obtain the database connection string, a key element for PostgreSQL database connectivity.

2. **Connection Process**:

- The `connect` function endeavors to set up a connection pool to the database via `PgPool::connect`.
- It yields a `Result` type, encapsulating either a `PgPool` object upon successful connection or an `ErrorMessage` struct in case of failure.

3. **Error Handling**:

- The function incorporates comprehensive error handling to adeptly manage various database connection errors, including `Configuration`, `Database`, and other unforeseen errors.

This methodology ensures a reliable and maintainable database connection strategy, centralizing the connection logic and error management.

#### Auth Routes

[This part of the code](https://github.com/HarrisonHemstreet/webservice_tutorial/blob/main/src/routes/auth.rs) focuses on user authentication processes, including user creation and login. The implementation harnesses various Rust crates and our custom modules for secure and efficient functionality.

1. **Environment and Dependencies**:

- The code utilizes environment variables and external crates like `jsonwebtoken`, `argon2`, and `sqlx` for JWT token generation, password hashing, and database interactions, respectively.

2. **Structs for JWT Claims and Login Messages**:

- We define `Claims` and `Claims2` structs for JWT claims management, containing user data and token expiration information.
- The `LoginMessage` struct structures the response message post successful login.

3. **Create User Route (`/auth/create_user`)**:

- This endpoint facilitates user registration, involving database connectivity, password hashing via Argon2, and new user insertion.
- A JWT token is generated and returned in the response header, authenticating the new user.

4. **Login Route (`/auth/login`)**:

- This endpoint authenticates users by retrieving and verifying user data from the database.
- Successful authentication leads to JWT token generation with user claims, returned in the response header.

5. **Error Handling**:

- Comprehensive error handling is incorporated in both routes to address database connectivity and runtime authentication issues.

This robust implementation ensures secure and efficient user authentication in our Rust web service, leveraging Actix-Web and Rust's strong type system.

#### Blog Routes

[This part of the code](https://github.com/HarrisonHemstreet/webservice_tutorial/blob/main/src/routes/blog.rs) offers a suite of endpoints for blog data management, including creation, retrieval, updating, and deletion of blog entries. The Tag routes adhere to similar conventions. Here's an overview:

1. **Create Blog (`/blog`)**:

- Users can create new blog entries via this POST route. It accepts a `Blog` struct in JSON format, inserts it into the database, and returns the new blog entry.

2. **Get Featured Blogs (`/blog/featured`)**:

- This GET route retrieves featured blog entries (up to 2), querying the database for blogs marked as `featured`.

3. **Get Blog by ID or All Blogs (`/blog`)**:

- Depending on the presence of an `id` query parameter, this GET route fetches either a specific blog entry or all entries, dynamically adjusting the SQL query accordingly.

4. **Update Blog (`/blog`)**:

- The PUT route updates an existing blog entry, employing the `ON CONFLICT` SQL clause to handle updates or creation as needed.

5. **Delete Blog (`/blog`)**:

- Users can delete blog entries based on `id` via this DELETE route, which removes the entry from the database and confirms with a `204 No Content` status.

Each route includes robust error handling for database and runtime issues, providing a comprehensive blog management functionality within the web service.

#### The HTTPServiceFactory

[In this part of the code](https://github.com/HarrisonHemstreet/webservice_tutorial/blob/main/src/routes/mod.rs), we focus on creating and organizing HTTP service factories for modules like `auth`, `tag`, and `blog`. Each module corresponds to specific functionalities within the web service, and the code leverages Actix Web's `HttpServiceFactory` for grouping related request handlers.

1. **Function Definitions**:

- Functions like `auth`, `tag`, and `blog` return `HttpServiceFactory` implementations, crucial for constructing HTTP services in Actix Web.

2. **Module Integration**:

- These functions integrate route handlers from their respective modules, such as `auth()` combining `auth::login` and `auth::create_user`.

3. **Purpose**:

- They offer a streamlined approach to grouping related routes and presenting them as services, enhancing the modularity and readability of the web service code.

Utilizing `HttpServiceFactory`, the code effectively organizes different functionalities into distinct services, augmenting the application's maintainability and scalability.

#### JWT Middleware

[This part of the code](https://github.com/HarrisonHemstreet/webservice_tutorial/blob/main/src/middleware/jwt_auth.rs) introduces middleware for JSON Web Token (JWT) authentication. This middleware is pivotal in securing routes by verifying JWTs in incoming requests.

1. **Middleware Setup**:

- Defined as `JWTAuth` and `AuthMiddleware`, `JWTAuth` acts as a factory for `AuthMiddleware` instances.

2. **Claims Structure**:

- A `Claims` struct is crafted to deserialize JWT fields, encompassing user information and token expiration.

3. **Middleware Logic**:

- The middleware extracts the `Authorization` header from requests and validates the JWT using the `jsonwebtoken` crate.
- It assesses the token's validity based on the secret key and algorithm (HS256), allowing valid requests to proceed and rejecting invalid ones.

4. **Environment Variables and Configuration**:

- Environment variables like `JWT_SECRET` configure key aspects of the middleware, such as the JWT decoding key.
- An optional `SKIP_AUTH` variable enables authentication bypass for certain routes, beneficial during development or testing.

This JWT middleware is crucial for route security, ensuring access is restricted to authenticated users.

#### CORS Middleware

[This part of the code](https://github.com/HarrisonHemstreet/webservice_tutorial/blob/main/src/middleware/handle_cors.rs) handles Cross-Origin Resource Sharing (CORS) settings, a key aspect for enabling interactions between different domain web applications and the service. Implemented using the `actix_cors` crate, it offers:

1. **Environment Variables**:

- Environment variables dynamically set allowed origins, with `FRONTEND_URL` for production and `DEV_FRONTEND_URL` for development.

2. **Configuration**:

- `Cors::permissive()` creates a CORS middleware instance.
- It's configured to permit requests from specified origins, accepting any HTTP method and header, based on the build environment.

This setup ensures flexible CORS policy management, facilitating frontend-backend interactions across various environments.

### Using webservice_tutorial as a Template

With this comprehensive guide, you're now equipped to leverage the [webservice_tutorial project](https://github.com/HarrisonHemstreet/webservice_tutorial/tree/main) as a foundation for your web service endeavors! To start, visit the project page on [GitHub](https://github.com/HarrisonHemstreet/webservice_tutorial/tree/main), click the `Use this template` green button, and `Create a new repository` from your account. This will set you on the path to building your custom web service with ease.

## Next Steps for You

Here are some of the things you should add to make `webservice_tutorial` your own!

### 1. Testing and Deployment

- **Testing**: Implement unit and integration tests in the `tests` directory. Test individual components and their integration, ensuring the application behaves as expected.
- **Deployment**: Consider deploying the application using Docker or a cloud service like AWS, GCP, or Azure. Ensure environment variables and secrets are securely managed.

### 2. Continuous Integration/Continuous Deployment (CI/CD)

- **CI/CD Setup**: Set up CI/CD pipelines using tools like GitHub Actions, GitLab CI, or Jenkins. Automate testing, building, and deployment processes to ensure code quality and streamline deployment.

### 3. Monitoring and Logging

- **Monitoring Tools**: Implement monitoring and logging tools like Prometheus, Grafana, or ELK Stack to track application performance and troubleshoot issues.

### 4. Security Considerations

- **Security Practices**: Implement security best practices, such as HTTPS, secure handling of JWTs, SQL injection prevention, and regular dependency updates.

### 5. Documentation and API Specification

- **Documentation**: Create comprehensive documentation for the API, possibly using tools like Swagger or Redoc to generate interactive API documentation.

### 6. Client-Side Development

- **Frontend Integration**: If a frontend is part of the project, integrate it with the backend API, ensuring seamless interaction between the two.

### 7. Feedback and Iteration

- **Iterative Development**: Continuously gather feedback and iterate on the application, adding features, fixing bugs, and improving performance based on user needs and technological advancements.

## Conclusion

The `webservice_tutorial` project stands as a testament to the power and versatility of Rust in web service development. This comprehensive guide skillfully navigates through the intricacies of using Rust, Actix-Web, SQLx, and Docker to construct a robust and efficient web application. From the initial setup of the environment and database to the implementation of advanced features like JWT authentication and CORS middleware, this tutorial encapsulates the essence of modern web development practices.

What sets this project apart is its emphasis on Rust's safety and performance capabilities, which are crucial for developing scalable web services. The tutorial's modular design and thorough explanations of each component render it an invaluable resource for both novice and experienced developers venturing into Rust-based web development.

The project's architecture is meticulously crafted for extensibility, allowing developers to seamlessly integrate their unique requirements and expand upon the core functionalities. The strategic use of environment variables, middleware, and well-organized routes not only fortifies the application's security but also enhances its maintainability.

For developers poised to embark on their web service projects, the `webservice_tutorial` available on [GitHub](https://github.com/HarrisonHemstreet/webservice_tutorial/tree/main) is a treasure trove of resources. By utilizing the "Use this template" feature on GitHub, one can effortlessly create a new repository, inheriting a robust framework to tailor and evolve. This approach not only accelerates the development journey but also allows developers to concentrate on crafting the unique features and functionalities of their web service.

In essence, the `webservice_tutorial` is more than just a guide; it's a springboard into the realm of high-performance web services, empowering developers to harness the full potential of Rust in creating cutting-edge web solutions.
