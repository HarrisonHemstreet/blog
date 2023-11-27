---
author: Harrison Hemstreet
pubDatetime: 2023-11-26T20:41:31-07:00
title: "How to Build a Web Service in Rust"
postSlug: How-to-Build-a-Web-Service-in-Rust
featured: true
draft: true
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

### 3. Rust Application Development

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

### 4. Dockerization

- **Dockerfile**: Create a `Dockerfile` to containerize your Rust application. Here's an example:
  ```Dockerfile
  FROM rust:1.67
  WORKDIR /usr/src/webservice_tutorial
  COPY . .
  RUN cargo install --path .
  CMD ["webservice_tutorial"]
  ```

### 5. Running the Project

- **Build and Run with Docker Compose**: Use Docker Compose to build and run your application along with the database.
  ```bash
  docker-compose up --build
  ```

### 6. Testing and Development

- Continuously test your application by sending requests to your API endpoints and ensure everything works as expected.

This tutorial provides a high-level overview. For specific implementation details, refer to the files in your repository. Each file contains specific logic and implementations that you should study and understand.

---

Note: You are currently on the free plan, which has limitations on the number of requests. To increase your quota, you can check available plans [here](https://c7d59216ee8ec59bda5e51ffc17a994d.auth.portal-pluginlab.ai/pricing).
