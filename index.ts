import * as fs from "fs";
import * as path from "path";
import pdf from "pdf-parse";

interface Abbreviation {
  term: string;
  definition: string;
}

interface ProcessedDocument {
  filename: string;
  abbreviations: Abbreviation[];
}

/**
 * Extracts abbreviation sections from multiple PDF files
 */
async function extractAbbreviationsFromPDFs(
  inputDir: string,
  outputFile: string
): Promise<void> {
  try {
    console.log("Starting abbreviation extraction process...");

    // Read all PDF files from the directory
    const files = fs
      .readdirSync(inputDir)
      .filter((file) => file.toLowerCase().endsWith(".pdf"));

    if (files.length === 0) {
      console.log("No PDF files found in the specified directory.");
      return;
    }

    console.log(`Found ${files.length} PDF files.`);

    // Process each PDF file
    const processedDocuments: ProcessedDocument[] = [];

    for (const file of files) {
      const filePath = path.join(inputDir, file);
      console.log(`Processing ${file}...`);

      try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);

        const abbreviations = extractAbbreviationSection(data.text);

        if (abbreviations.length > 0) {
          processedDocuments.push({
            filename: file,
            abbreviations,
          });
          console.log(
            `Extracted ${abbreviations.length} abbreviations from ${file}`
          );
        } else {
          console.log(`No abbreviation section found in ${file}`);
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }

    // Generate output
    generateOutput(processedDocuments, outputFile);
    console.log(`Extraction complete. Results saved to ${outputFile}`);
  } catch (error) {
    console.error("Error in extraction process:", error);
  }
}

/**
 * Extracts the abbreviation section from PDF text content
 */
function extractAbbreviationSection(text: string): Abbreviation[] {
  // Common section headers for abbreviations
  const sectionHeaders = [
    "list of abbreviations",
    "abbreviations",
    "acronyms",
    "glossary of terms",
    "list of acronyms",
    "symbols and abbreviations",
  ];

  // Find where the abbreviation section starts
  let startIndex = -1;
  let endIndex = text.length;
  let headerFound = "";

  for (const header of sectionHeaders) {
    const headerIndex = text.toLowerCase().indexOf(header);
    if (headerIndex !== -1 && (startIndex === -1 || headerIndex < startIndex)) {
      startIndex = headerIndex;
      headerFound = header;
    }
  }

  if (startIndex === -1) {
    return []; // No abbreviation section found
  }

  // Look for the next section header to find where abbreviation section ends
  const commonNextSections = [
    "table of contents",
    "introduction",
    "chapter 1",
    "abstract",
    "acknowledgments",
    "references",
  ];

  for (const nextSection of commonNextSections) {
    // Only look after the abbreviation section start
    const nextSectionText = text.slice(startIndex + headerFound.length);
    const nextSectionIndex = nextSectionText.toLowerCase().indexOf(nextSection);

    if (nextSectionIndex !== -1) {
      // Adjust index relative to the full text
      const adjustedIndex = startIndex + headerFound.length + nextSectionIndex;
      if (adjustedIndex < endIndex) {
        endIndex = adjustedIndex;
      }
    }
  }

  // Extract the abbreviation section content
  const sectionContent = text.slice(startIndex, endIndex).trim();

  // Parse the abbreviations
  return parseAbbreviations(sectionContent);
}

/**
 * Parses the abbreviation section content into structured data
 */
function parseAbbreviations(content: string): Abbreviation[] {
  const abbreviations: Abbreviation[] = [];

  // Skip the header line
  const lines = content.split("\n").slice(1);

  // Common patterns for abbreviation sections
  // 1. "ABC - Definition"
  // 2. "ABC: Definition"
  // 3. "ABC ... Definition" (with spaces or dots between)

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Try different patterns to match abbreviations
    let match = trimmedLine.match(/^([A-Z0-9\-\.]+)\s*[\-–:]\s*(.+)$/);
    if (!match) {
      match = trimmedLine.match(/^([A-Z0-9\-\.]+)\s{2,}(.+)$/);
    }
    if (!match) {
      match = trimmedLine.match(/^([A-Z0-9\-\.]{2,})\s+([\w\s\-\.,;()]+)$/);
    }

    if (match && match[1] && match[2]) {
      abbreviations.push({
        term: match[1].trim(),
        definition: match[2].trim(),
      });
    }
  }

  return abbreviations;
}

/**
 * Generates the output document with all extracted abbreviations
 */
function generateOutput(
  documents: ProcessedDocument[],
  outputFile: string
): void {
  let output = "# Compiled Abbreviations\n\n";

  // Create a unified list or keep them separate by source document
  const keepSeparate = true; // Set to false if you want a unified list

  if (keepSeparate) {
    // Group by source document
    for (const doc of documents) {
      if (doc.abbreviations.length === 0) continue;

      output += `## From: ${doc.filename}\n\n`;

      for (const abbr of doc.abbreviations) {
        output += `- **${abbr.term}**: ${abbr.definition}\n`;
      }

      output += "\n";
    }
  } else {
    // Create a unified, sorted list with sources
    const allAbbreviations: {
      term: string;
      definition: string;
      sources: string[];
    }[] = [];

    for (const doc of documents) {
      for (const abbr of doc.abbreviations) {
        const existing = allAbbreviations.find((a) => a.term === abbr.term);

        if (existing) {
          if (!existing.sources.includes(doc.filename)) {
            existing.sources.push(doc.filename);
          }
          // If definitions differ, we could handle that here
        } else {
          allAbbreviations.push({
            term: abbr.term,
            definition: abbr.definition,
            sources: [doc.filename],
          });
        }
      }
    }

    // Sort alphabetically
    allAbbreviations.sort((a, b) => a.term.localeCompare(b.term));

    output += "## Unified Abbreviation List\n\n";
    for (const abbr of allAbbreviations) {
      output += `- **${abbr.term}**: ${
        abbr.definition
      } (Source: ${abbr.sources.join(", ")})\n`;
    }
  }

  // Write to file
  fs.writeFileSync(outputFile, output);
}

// Example usage
const inputDirectory = "./pdfs"; // Directory containing PDF files
const outputFilePath = "./abbreviations.md"; // Output file path (Markdown format)

// Create input directory if it doesn't exist
if (!fs.existsSync(inputDirectory)) {
  fs.mkdirSync(inputDirectory);
  console.log(`Created directory: ${inputDirectory}`);
  console.log(
    "Please place your PDF files in this directory before running the script."
  );
}

// Run the extraction process
extractAbbreviationsFromPDFs(inputDirectory, outputFilePath).catch((error) =>
  console.error("Error in extraction process:", error)
);
