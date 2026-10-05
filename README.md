# Database Viewer

Needed a database viewer when I was working on my Master thesis, so I built this.

A minimalist database explorer for the browser. Open and explore SQLite, CSV, TSV, JSON, JSONL, and Excel files with a clean, modern interface.

**GitHub**: https://github.com/LakshmiNarayanan2003/database-viewer

## Features

- **Multiple Format Support**: SQLite, CSV, TSV, JSON, JSONL, and Excel files
- **Privacy-First**: All data processing happens locally in your browser
- **Clean UI/UX**: Minimalist design inspired by Notion and Linear
- **Data Exploration**: Paginated tables, search, sorting, and filtering
- **Schema Inspection**: View table structure, column types, and constraints
- **SQL Query Editor**: Execute SQL queries on SQLite files with query history
- **Data Model View**: Visualize database tables and their relationships (Power BI-style)
- **Export Options**: Export data to CSV or JSON formats
- **Light & Dark Themes**: Switch between themes with a single click
- **Drag & Drop**: Easily import files by dragging them into the application
- **Upload Modal**: Upload additional files even after the initial import
- **Sample Datasets**: Built-in sample CSV, JSON, JSONL, and SQLite databases for testing

## Supported Formats

### Phase 1 (Currently Supported)
- **SQLite**: `.db`, `.sqlite`, `.sqlite3`
- **CSV**: `.csv`
- **TSV**: `.tsv`
- **Excel**: `.xlsx`, `.xls`
- **JSON**: `.json`
- **JSON Lines**: `.jsonl`, `.ndjson`

### Phase 2 (Currently Supported)
- **SQL Query Editor**: Execute SQL queries on SQLite files
- **Query History**: Track and reuse previous queries
- **Data Model View**: Visualize database tables and relationships (Power BI-style)
- **Foreign Key Detection**: Automatically detect and display foreign key relationships
- **Enhanced Sample Data**: Multiple sample datasets for testing

### Phase 3 (Planned)
- DuckDB: `.duckdb`
- Parquet: `.parquet`
- Apache Arrow: `.arrow`, `.feather`
- Advanced filtering options

## Installation

### Prerequisites
- Node.js 18.18.0 or higher
- npm or yarn

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd database-viewer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Production Build

1. Build the application:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

The built files will be in the `dist/` directory and can be deployed to any static hosting service (GitHub Pages, Vercel, Netlify, etc.).

## Sample Data

Sample data files are included in the `sample-data/` directory for testing:

- `sample.db` - SQLite database with users and orders tables (includes foreign key relationships)
- `products.csv` - Product catalog in CSV format
- `employees.json` - Employee data in JSON format
- `sales.jsonl` - Sales transaction data in JSON Lines format

Generate the SQLite sample database by running:
```bash
python3 sample-data/create_sample_db.py
```

## Usage

### Opening Files

1. **Drag & Drop**: Drag your database or data file onto the welcome screen
2. **File Picker**: Click "Browse files" to select files from your computer
3. **Sample Data**: Click any sample dataset button to explore with demo data
4. **Upload Button**: After files are loaded, click the "Upload" button in the header to add more files via a modal

### Exploring Data

1. **Sidebar**: Browse open files and their tables/sheets
2. **Data Tab**: View table data with pagination, search, and sorting
3. **Structure Tab**: Inspect table schema, column types, and constraints
4. **SQL Tab**: Execute SQL queries on SQLite files (SQLite only)
5. **Model Tab**: Visualize database tables and their relationships (Power BI-style)

### SQL Query Editor (SQLite)

- **Query Execution**: Write and execute SQL queries using Ctrl/Cmd + Enter
- **Query History**: View and reuse previous queries (up to 20)
- **Results Display**: View query results with row count and execution time
- **Quick Reference**: Common SQL query examples provided

### Data Model View

- **Table Visualization**: View all tables in the database as cards
- **Column Details**: See column names, types, and constraints
- **Primary Keys**: Marked with a key icon
- **Foreign Keys**: Marked with a link icon and shows target table
- **Relationships**: Display foreign key relationships between tables

### Search & Filter

- **Global Search**: Type in the search box to filter across all columns
- **Column-Specific**: Select a specific column to narrow your search
- **Sort**: Click column headers to sort ascending or descending

### Export Data

1. Select a table from the sidebar
2. Choose your preferred export format (CSV or JSON)
3. Click the "Export" button to download the file

## Architecture

### Modular Adapter System

The application uses a modular adapter-based architecture where each file format has its own adapter:

```
src/adapters/
├── base.ts           # Base adapter interface
├── index.ts          # Adapter registry
├── sqliteAdapter.ts  # SQLite implementation
├── csvAdapter.ts     # CSV/TSV implementation
├── jsonAdapter.ts    # JSON/JSONL implementation
└── excelAdapter.ts   # Excel implementation
```

Each adapter implements the `DataAdapter` interface:
- `loadFile()`: Parse and load the file
- `getTableData()`: Retrieve paginated data
- `getTableCount()`: Get total row count
- `exportTable()`: Export data to CSV or JSON
- `executeQuery()`: Execute SQL queries (SQLite only)

### State Management

Application state is managed using Zustand (`src/stores/useAppStore.ts`):
- Open files and active selections
- Theme preferences
- Pagination, sorting, and filtering state
- Sidebar visibility

### Component Structure

```
src/components/
├── App.tsx           # Main application layout
├── Sidebar.tsx       # File and table explorer
├── DataTable.tsx     # Data viewer with pagination
├── SchemaViewer.tsx  # Schema inspection
├── SqlEditor.tsx     # SQL query editor
├── DataModel.tsx     # Data model visualization
├── StatusBar.tsx     # Status information
└── FileDropZone.tsx  # Drag-and-drop import
```

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Zustand**: State management
- **sql.js**: SQLite database engine
- **Papa Parse**: CSV/TSV parsing
- **SheetJS (xlsx)**: Excel file parsing
- **Lucide React**: Icons

## Privacy & Security

- **Local Processing**: All file processing happens in your browser
- **No Server Uploads**: Your data never leaves your device
- **No Telemetry**: No analytics or tracking
- **Read-Only**: SQLite queries are executed in read-only mode

## Performance Considerations

- **Pagination**: Large datasets are loaded in pages (default: 50 rows)
- **Memory Management**: Database connections are closed when files are removed
- **Lazy Loading**: Data is loaded on-demand when switching tables

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ⚠️ Limited support (desktop optimized)

## Development

### Project Structure

```
database-viewer/
├── src/
│   ├── adapters/       # File format adapters
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── stores/        # Zustand state stores
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   ├── main.tsx       # Application entry point
│   └── index.css      # Global styles
├── public/            # Static assets
├── index.html         # HTML template
├── package.json       # Dependencies
├── tailwind.config.js # Tailwind configuration
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

### Adding a New Format Adapter

1. Create a new adapter in `src/adapters/` implementing the `DataAdapter` interface
2. Register the adapter in `src/adapters/index.ts`
3. Add format detection logic in `src/lib/formatDetection.ts`
4. Update the file picker accept list in `src/components/FileDropZone.tsx`

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Keep components focused and modular
- Use Tailwind CSS for styling
- Maintain the minimalist design aesthetic

## Limitations

- **File Size**: Very large files (>100MB) may cause browser memory issues
- **SQL Support**: Only SQLite supports SQL queries in Phase 1
- **Write Operations**: The application is read-only (no data modification)
- **Complex Queries**: SQL queries are limited to read operations

## Roadmap

### Phase 2
- [ ] DuckDB-Wasm integration
- [ ] Parquet file support
- [ ] SQL query editor with syntax highlighting
- [ ] Query history and saved queries
- [ ] Advanced filtering options

### Phase 3
- [ ] Apache Arrow and Feather support
- [ ] Additional spreadsheet formats (ODS)
- [ ] Command palette (Cmd+K)
- [ ] Keyboard shortcuts
- [ ] Resizable panels
- [ ] Performance optimizations for large datasets

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by [SQLite Viewer](https://inloop.github.io/sqlite-viewer/)
- Built with [sql.js](https://sql.js.org/)
- Icons by [Lucide](https://lucide.dev/)

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
