# Boarding Finder

Boarding Finder helps university students discover rooms near campus. This
repository contains a Spring Boot API and a Next.js web app.

## Phase 1: local setup

### Prerequisites

- Java 21
- Maven 3.9+
- Node.js 20+
- PostgreSQL, with a database named `boardingfinder`

Create the database in PostgreSQL:

```sql
CREATE DATABASE boardingfinder;
```

### Start the API

From the `api/` directory, set your PostgreSQL connection values and start
Spring Boot:

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/boardingfinder"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="your-local-postgres-password"
mvn spring-boot:run
```

The API listens on `http://localhost:8080`. Database settings can also be
copied from [api/.env.example](api/.env.example); Spring Boot does not load
`.env` files automatically, so export the values in your shell before starting
the API.

### Start the web app

In another terminal, from the `web/` directory:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API URL is configured
in [web/.env.local](web/.env.local).

### Check the rooms API

List rooms:

```powershell
Invoke-RestMethod http://localhost:8080/api/rooms
```

Create a room:

```powershell
$room = @{
  title = "Bright room near campus"
  description = "A furnished room with a quiet study area."
  monthlyPrice = 45000
  address = "12 College Road"
  distanceToCampusKm = 0.8
  imageUrl = ""
  ownerName = "Room owner"
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/rooms `
  -ContentType "application/json" -Body $room
```

The API adds eight sample rooms the first time it starts with an empty
database. The home page displays rooms returned by the API and shows a loading
state, a helpful API/database connection message, or an empty state when there
are no listings.
