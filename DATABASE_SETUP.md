# Database Setup Instructions

## Prerequisites
- PostgreSQL installed (you mentioned you have pgAdmin 4)
- Node.js and npm installed

## Step 1: Create Database in pgAdmin 4

1. Open pgAdmin 4
2. Connect to your PostgreSQL server (usually localhost)
3. Right-click on "Databases" and select "Create" > "Database"
4. Enter the following:
   - Database name: `onlytwins_db`
   - Owner: postgres (or your PostgreSQL user)
   - Encoding: UTF8
5. Click "Save"

## Step 2: Update Database Credentials

Edit the `.env.local` file and update the DATABASE_URL with your actual PostgreSQL credentials:

```
DATABASE_URL="postgresql://[YOUR_USERNAME]:[YOUR_PASSWORD]@localhost:5432/onlytwins_db"
```

Replace:
- `[YOUR_USERNAME]` with your PostgreSQL username (often "postgres")
- `[YOUR_PASSWORD]` with your PostgreSQL password

## Step 3: Generate Prisma Client

Run the following command in your terminal (in the project directory):

```bash
npx prisma generate
```

## Step 4: Create Database Tables

Run the migration to create all the tables:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all the tables defined in the schema
- Generate TypeScript types for your models
- Create a migration history

## Step 5: (Optional) Seed the Database

To add some test data, run:

```bash
npx prisma db seed
```

## Step 6: Verify Database

You can verify the database was created correctly by:

1. Opening pgAdmin 4
2. Navigate to: Servers > [Your Server] > Databases > onlytwins_db > Schemas > public > Tables
3. You should see all the tables created (User, Creator, ChatSession, etc.)

## Useful Commands

- View database in Prisma Studio (GUI): `npx prisma studio`
- Reset database: `npx prisma migrate reset`
- Update schema and create migration: `npx prisma migrate dev`

## Troubleshooting

If you get connection errors:
1. Make sure PostgreSQL service is running on Windows
2. Check your username/password in `.env.local`
3. Ensure the database `onlytwins_db` exists in pgAdmin
4. Try connecting with pgAdmin first to verify credentials