# PostgreSQL Setup for Windows with WSL

Since you're using WSL (Windows Subsystem for Linux) and PostgreSQL is installed on Windows, you need to configure the connection properly.

## Option 1: Use Windows Host IP (Recommended)

1. Open PowerShell on Windows and run:
```powershell
ipconfig
```

2. Look for "Ethernet adapter vEthernet (WSL)" and note the IPv4 Address (usually something like 172.x.x.1)

3. Update your `.env.local` file:
```
DATABASE_URL="postgresql://postgres:admin@[WINDOWS_IP]:5432/onlytwins_db"
```
Replace [WINDOWS_IP] with the IP from step 2.

## Option 2: Use WSL Integration

1. In your `.env.local`, try using the WSL gateway:
```
DATABASE_URL="postgresql://postgres:admin@host.wsl.internal:5432/onlytwins_db"
```

## Option 3: Direct Windows Connection

Since you created the database from Windows (C:\Users\jakeb\VSCODE\reccc), run the Next.js app from Windows PowerShell instead of WSL:

1. Open PowerShell in Windows
2. Navigate to: `cd C:\Users\jakeb\VSCODE\only\Only`
3. Run the commands:
```powershell
npx prisma generate
npx prisma migrate dev --name add_chatbot_schema
npm run dev
```

## Verify PostgreSQL is Running

1. Open pgAdmin 4
2. Check that PostgreSQL service is running
3. Verify you can connect to `onlytwins_db`
4. Check the password is `admin` for the `postgres` user

## Quick Fix for Now

Since the database was created successfully, let's proceed with the Windows PowerShell approach (Option 3) to avoid WSL networking issues.