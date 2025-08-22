# 🌐 ACCESS FROM OTHER DEVICES ON YOUR NETWORK

## Step 1: Find Your Windows IP Address

Open Windows Command Prompt (not WSL) and run:
```cmd
ipconfig
```

Look for your WiFi adapter (usually called "Wireless LAN adapter Wi-Fi") and find the **IPv4 Address**. 
It will look something like:
- `192.168.1.xxx` 
- `10.0.0.xxx`
- `172.16.x.xxx`

## Step 2: Server is Already Running!

The development server is currently running and accessible from your network on:
```
http://[YOUR-WINDOWS-IP]:3000
```

For example, if your Windows IP is `192.168.1.100`, access it at:
```
http://192.168.1.100:3000
```

## Step 3: Windows Firewall (If Needed)

If you can't connect from other devices, you may need to allow port 3000 through Windows Firewall:

1. Open Windows Defender Firewall
2. Click "Allow an app or feature"
3. Click "Allow another app"
4. Add Node.js (usually at `C:\Program Files\nodejs\node.exe`)
5. Check both Private and Public networks

Or run this in Windows Admin Command Prompt:
```cmd
netsh advfirewall firewall add rule name="Next.js Dev Server" dir=in action=allow protocol=TCP localport=3000
```

## Step 4: Test From Another Device

From any device on your WiFi network:
1. Open a web browser
2. Go to `http://[YOUR-WINDOWS-IP]:3000`
3. You should see your AI Content Platform!

## 🔍 What You'll See in Session Tracking

When you access from other devices, you'll see:
- **Real IP addresses** (like `192.168.1.105`)
- **Different browsers** (mobile, tablet, etc.)
- **Actual device types** detected properly

## To Stop Network Access

When done testing, kill the server to stop network access.

## Alternative: Using ngrok (Optional)

If you want to access from outside your network:
```bash
# Install ngrok
npm install -g ngrok

# In another terminal, expose your local server
ngrok http 3000
```

This will give you a public URL like `https://abc123.ngrok.io` that works from anywhere!