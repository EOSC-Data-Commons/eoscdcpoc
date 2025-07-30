# EOSC Data Commons - Proof of Concept

A modern web application for searching scientific datasets using natural language queries. Built with React, TypeScript, and Vite, this application provides an intuitive interface to discover millions of high-quality scientific datasets through AI-powered search capabilities.

## 🚀 Features

- **Natural Language Search**: Search through scientific datasets using plain English queries
- **AI-Powered Results**: Backend integration with Mistral AI for intelligent dataset discovery
- **Interactive UI**: Modern, responsive design with Tailwind CSS
- **Search History**: Keep track of your previous searches
- **Dataset Filtering**: Advanced filtering options for refining search results
- **Pagination**: Efficient browsing through large result sets
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠 Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4 with custom EOSC design system
- **Routing**: React Router DOM 7
- **State Management**: TanStack React Query 5
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Linting**: ESLint 9 with TypeScript support

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher) or **yarn** (version 1.22 or higher)
- **Git** (for cloning the repository)

You can check your versions by running:
```bash
node --version
npm --version
git --version
```

## 🚀 Setup from Scratch

### 1. Clone the Repository

```bash
git clone <repository-url>
cd eoscdcpoc
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Environment Setup

The application is configured to work with a backend API. Make sure you have:

- Backend API running (the app expects it at `/api` endpoint)
- Backend should support POST requests to `/api/search` with the following structure:
  ```json
  {
    "messages": [{"role": "user", "content": "search query"}],
    "model": "mistral-medium-latest"
  }
  ```

### 4. Development Server

Start the development server:

```bash
npm run dev
```

Or with yarn:
```bash
yarn dev
```

The application will be available at `http://localhost:5173`

### 5. Building for Production

To build the application for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## 📖 How to Use the Application

### Landing Page

1. **Access the Application**: Open your browser and navigate to the application URL
2. **Main Search**: Use the central search bar to enter your query in natural language
   - Example: "Glucose level changes in the liver of individuals with type 1 diabetes from 1980 to 2020"
   - Example: "Data about CO2 levels in europe between 1960 and 2020"
3. **Quick Discovery**: Click on pre-defined example cards to quickly search for common datasets
4. **Feature Overview**: Review the application capabilities (10M+ Datasets, 100+ Tools, etc.)

### Search Results Page

1. **View Results**: After submitting a search, you'll see:
   - AI-generated summary of your search
   - List of relevant datasets with metadata
   - Dataset scores indicating relevance
2. **Dataset Information**: Each result includes:
   - Title and description
   - Authors/creators
   - Publication date
   - DOI and Zenodo URL
   - Keywords (when available)
3. **Refine Search**: Use the search bar at the top to modify your query
4. **Navigate Results**: Use pagination to browse through multiple pages of results

### Search Features

- **Natural Language Queries**: Type your search as you would ask a colleague
- **Search History**: Your previous searches are automatically saved
- **Filtering**: Use the filter panel to narrow down results by various criteria
- **Sorting**: Results are automatically ranked by relevance score

## 🏗 Project Structure

```
eoscdcpoc/
├── public/                     # Static assets
│   ├── data-commons-icon-blue.svg
│   └── vite.svg
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── FilterPanel.tsx
│   │   ├── FilterSection.tsx
│   │   ├── HistoryPanel.tsx
│   │   ├── Pagination.tsx
│   │   ├── SearchInput.tsx
│   │   └── SearchResultItem.tsx
│   ├── lib/                   # Utility functions and API calls
│   │   ├── api.ts
│   │   ├── history.ts
│   │   └── utils.ts
│   ├── pages/                 # Page components
│   │   ├── LandingPage.tsx
│   │   ├── NotFound.tsx
│   │   └── SearchPage.tsx
│   ├── types/                 # TypeScript type definitions
│   │   └── zenodo.ts
│   ├── assets/               # Static assets
│   ├── App.tsx               # Main app component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── package.json             # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── eslint.config.js        # ESLint configuration
```

## 🎨 Styling and Design

The application uses a custom design system based on EOSC branding:

- **Primary Colors**:
  - EOSC Gray: `#646363`
  - EOSC Light Blue: `#009FE3`
  - EOSC Dark Blue: `#002337`
  - EOSC Black: `#040204`

- **Layout Colors**:
  - Background: `#FAFAFA`
  - Card Background: `#FFFFFF`
  - Border: `#E0E0E0`
  - Text: `#1A1A1A`

## 🔧 Configuration

### Vite Configuration

The application uses Vite with React SWC plugin for fast builds and hot module replacement.

### TypeScript Configuration

- Strict type checking enabled
- Modern ES modules support
- Path mapping for clean imports

### ESLint Configuration

- TypeScript-aware linting
- React-specific rules
- Modern JavaScript standards

## 🧪 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔌 API Integration

The application integrates with a backend API that should provide:

### Search Endpoint
- **URL**: `POST /api/search`
- **Request Body**:
  ```json
  {
    "messages": [{"role": "user", "content": "search query"}],
    "model": "mistral-medium-latest"
  }
  ```
- **Response Format**:
  ```json
  {
    "datasets": [
      {
        "creators": ["Author Name"],
        "description": "Dataset description",
        "doi": "10.1234/example",
        "keywords": ["keyword1", "keyword2"],
        "publication_date": "2023-01-01",
        "score": 0.95,
        "title": "Dataset Title",
        "zenodo_url": "https://zenodo.org/record/123456"
      }
    ],
    "summary": "AI-generated search summary"
  }
  ```

## 🚀 Deployment

### Production Build

1. Build the application:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains the production-ready files

3. Deploy the contents of `dist/` to your web server

### Environment Considerations

- Ensure your backend API is accessible from the production domain
- Configure proper CORS settings if the backend is on a different domain
- Set up proper routing for single-page application (SPA) behavior

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is part of the EOSC Data Commons proof of concept initiative.

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Make sure you're using Node.js 18+
2. **API Connection Issues**: Verify your backend is running and accessible
3. **Styling Issues**: Clear your browser cache and rebuild
4. **TypeScript Errors**: Run `npm run lint` to check for issues

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify all dependencies are installed correctly
3. Ensure your backend API is responding correctly
4. Check the network tab for failed API requests

---

Built with ❤️ for the scientific research community
