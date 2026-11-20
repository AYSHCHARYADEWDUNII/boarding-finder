# Boarding Finder

Boarding Finder helps university students discover rooms near campus. This
repository contains a Spring Boot API and a Next.js web app.

Students can search by keyword, monthly budget, distance from campus, and
boarding availability, then sort and page through matching listings. Search
filters are reflected in the URL, and favorite rooms are saved in the browser.
Room details include photos, contact options, and a map when location
coordinates are available. Owners can manage their listings through the owner
portal.

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

### Browse rooms and manage owner listings

List public rooms:

```powershell
Invoke-RestMethod http://localhost:8080/api/rooms
```

Room details are available at `GET /api/rooms/{id}`. Owners can register or
sign in at [http://localhost:3000/owner](http://localhost:3000/owner), then
create, edit, or delete their own listings from the owner portal. Owner
sessions use secure HTTP-only cookies and CSRF protection. For an HTTPS
deployment, set `APP_SESSION_COOKIE_SECURE=true`.

Every new listing must specify whether it is for boys, girls, or boys and
girls, and include at least one JPEG, PNG, or WebP photo. Owners can upload up
to 10 photos per listing, with a 5 MB limit per photo. The public search page
can filter by boarding availability, and room details provide a photo gallery
and, when coordinates are available, an interactive map. Uploaded files are
stored in `api/uploads/boarding-photos`; set `APP_UPLOAD_DIRECTORY` to use a
persistent location for deployment. Set `APP_PUBLIC_BASE_URL` to the public
API URL when it differs from `http://localhost:8080`. Older sample listings
without a saved choice or photo remain marked "Not specified" with a photo
placeholder until real owner listings are added.

Authenticated owner endpoints are:

- `GET /api/auth/me`, `POST /api/auth/register`, `POST /api/auth/login`, and
  `POST /api/auth/logout`
- `GET /api/owner/rooms`, `POST /api/owner/rooms`, and
  `PUT /api/owner/rooms/{id}`
- `DELETE /api/owner/rooms/{id}`

The API adds eight sample rooms the first time it starts with an empty
database. Sample rooms remain publicly viewable but are not attached to an
owner account. The home page displays rooms returned by the API and shows a
loading state, an API/database connection message, or an empty state when
there are no listings.
