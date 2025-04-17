# PDF Abbreviation Extractor

A TypeScript tool that extracts abbreviation sections from multiple PDF documents and compiles them into a single Markdown file.

## Overview

This tool scans through PDF documents, locates sections containing abbreviations (often labeled as "List of Abbreviations", "Acronyms", "Glossary", etc.), extracts the terms and their definitions, and compiles them into a well-formatted Markdown document.

## Features

- Process multiple PDF files at once
- Automatically detect abbreviation sections
- Extract abbreviation terms and their definitions
- Organize results by source document or as a unified list
- Output to a clean, readable Markdown format

## Requirements

- Node.js (v12.0.0 or later)
- npm or yarn

## Installation

1. Clone this repository or download the source code
2. Navigate to the project directory and install dependencies:

```bash
npm install
```

3. Create a directory named `pdfs` in the project root to store your PDF files
4. Place all PDF files you want to process in the `pdfs` directory

## Usage

Run the script using ts-node:

```bash
npx ts-node index.ts
```

The script will process all PDF files in the `pdfs` directory and generate a Markdown file called `abbreviations.md` containing all extracted abbreviations.

## Abbreviation Section Detection

The script searches for the following common section headers to identify abbreviation sections:

- "list of abbreviations"
- "abbreviations"
- "acronyms"
- "glossary of terms"
- "list of acronyms"
- "symbols and abbreviations"

If your documents use different headers, you can modify the `sectionHeaders` array in the code.

## How It Works

The script performs the following operations:

1. Reads all PDF files from the `pdfs` directory
2. For each PDF file:
   - Extracts the text content
   - Searches for common abbreviation section headers
   - Identifies where the section ends (looks for sections like "table of contents", "introduction", etc.)
   - Parses abbreviations and their definitions using pattern matching
3. Compiles all extracted abbreviations into a Markdown file
4. Organizes the results by source document

## Customization

### Output Format

By default, the script organizes abbreviations by their source documents. To create a unified, alphabetically sorted list instead, find this line in the code:

```typescript
const keepSeparate = true; // Set to false if you want a unified list
```

Change it to:

```typescript
const keepSeparate = false;
```

### Input and Output Paths

You can modify these variables in the script to change the input directory and output file paths:

```typescript
const inputDirectory = "./pdfs"; // Directory containing PDF files
const outputFilePath = "./abbreviations.md"; // Output file path
```

## Limitations

- The script relies on common section naming patterns to identify abbreviation sections. If your documents use unconventional section titles, you may need to add them to the `sectionHeaders` array.
- PDF files with complex layouts or scanned PDFs (images) may not extract correctly.
- The script uses pattern matching to identify abbreviations, which may miss some entries depending on formatting.

## Troubleshooting

- If no abbreviations are found, check that your PDF contains a clearly marked abbreviation section.
- If the script is missing some abbreviations, you might need to modify the regular expressions in the `parseAbbreviations` function.
- Make sure your PDF files are text-based and not scanned images.
