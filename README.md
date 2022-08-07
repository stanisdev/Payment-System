A REST API of a standard payment system.

## Installation
1. Clone the repository
```sh
$ git clone https://github.com/stanisdev/PerfectMoney-Analogue
```

2. Download the dependencies
```sh
$ yarn
```

3. Create user and database in the PostgreSQL

4. Create a ".env" file depending on the environment you want to use (ex: ".development.env")

5. Copy the content of the ".env.example" file to the created file.

6. Replace connection parameters of the "Database" and "Redis" with your own.

7. Execute the migrations
```sh
$ yarn run migration:up
```

8. Build the application
```sh
$ yarn run build
```

9. Run
```sh
$ yarn run start
```