# Phase 3 Sample Data

This directory contains sample files for testing Phase 3 formats.

## Available Files

### Arrow Format (`.arrow`)
- **sample.arrow** - Employee data with 10 records
- Created using apache-arrow JavaScript library
- Can be loaded directly by the Arrow adapter

### Feather Format (`.feather`)
- **sample.feather** - Employee data with 10 records
- Same content as Arrow format (Feather is essentially Arrow IPC)
- Can be loaded directly by the Feather adapter

### CSV for Conversion
- **sample_phase3.csv** - Raw CSV data
- Can be converted to Parquet or DuckDB using external tools

## How to Create Missing Formats

### Parquet File
If you have Python installed:
```bash
pip install pandas pyarrow
python -c "
import pandas as pd
df = pd.read_csv('sample_phase3.csv')
df.to_parquet('sample.parquet')
"
```

Or use online converters:
- https://convertio.co/csv-parquet/
- https://www.aconvert.com/document/csv-to-parquet/

### DuckDB File
Using DuckDB CLI (requires installation):
```bash
duckdb sample.duckdb -c "CREATE TABLE employees AS SELECT * FROM read_csv_auto('sample_phase3.csv')"
```

Using Python:
```bash
pip install duckdb
python -c "
import duckdb
con = duckdb.connect('sample.duckdb')
con.execute('CREATE TABLE employees AS SELECT * FROM read_csv_auto(\"sample_phase3.csv\")')
con.close()
"
```

Using online tools:
- Convert CSV to SQLite first, then use DuckDB to import
- Use DuckDB Web UI at https://shell.duckdb.org/

## Sample Data Schema

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Employee ID |
| name | String | Employee name |
| age | Integer | Employee age |
| city | String | Employee city |
| salary | Integer | Employee salary |
| department | String | Department name |

## Testing

To test the Phase 3 formats:
1. Start the dev server: `npm run dev`
2. Open the application in your browser
3. Drag and drop any of the sample files
4. Verify the data loads correctly and you can:
   - View the table data
   - Check the schema
   - Export to CSV/JSON
   - For DuckDB: execute SQL queries
