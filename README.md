![EOSC Data Commons](./public/data-commons-logo.png)

# EOSC Data Commons Frontend

A web application for searching scientific datasets using natural language queries. This application works with the [EOSC Data Commons MCP server](https://github.com/EOSC-Data-Commons/data-commons-mcp) to help you discover scientific datasets through AI-powered search.

> **Note**: You would currently be using the free version of Mistral LLM, so search results may take 10-15 seconds to complete. Please be patient! :)

## What You Need First

Before using this application, you need to install these programs on your computer:

1. **[Node.js](https://nodejs.org/en/download/)** (version 18 or newer)
   - Download and install from the official website
   - This includes npm (package manager) automatically

2. **[Git](https://git-scm.com/downloads)**
   - Download and install from the official website
   - Needed to download the code

3. **[EOSC Data Commons MCP server](https://github.com/EOSC-Data-Commons/data-commons-mcp)**
   - Download and set up the backend server
   - Must be running on port 8000 for this frontend to work

You can check if they're installed by opening Terminal (Mac) or Command Prompt (Windows) and running these commands one by one:

Check Node.js version:
```bash
node --version
```

Check npm version:
```bash
npm --version
```

Check Git version:
```bash
git --version
```

## How to Use

### Step 1: Download the Code

Open Terminal (Mac) or Command Prompt (Windows) and run these commands one by one:

Clone the repository:
```bash
git clone https://github.com/EOSC-Data-Commons/eoscdcpoc.git
```

Navigate to the project folder:
```bash
cd eoscdcpoc
```

Install dependencies:
```bash
npm install
```

### Step 2: Start the Backend Server

First, make sure the [EOSC Data Commons MCP server](https://github.com/EOSC-Data-Commons/data-commons-mcp) is running on port 8000. Follow the instructions in the backend repository.

### Step 3: Start the Frontend

Run this command to start the frontend:
```bash
npm run dev
```

The application will open at http://localhost:8080

## How to Search

1. Open the application in your web browser
2. Type your search in plain English, for example:
   - "data about diabetes research in Europe"
   - "climate change temperature data from 2000 to 2020"
3. Press Enter or click the search button
4. Browse through the results

## Need Help?

If something doesn't work:
1. Make sure the backend server is running first
2. Check that Node.js and Git are properly installed
3. Try closing and reopening your terminal/command prompt
