import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

// Change to the correct directory where your PDF files are stored
const pdfDir = path.join(__dirname, "pdfs"); // Assuming PDFs are in a folder named 'pdfs'
const outputFile = path.join(__dirname, "abbreviations_summary.txt"); // Output file for the extracted text

// Function to extract Abbreviations section from PDF
async function extractAbbreviations(filePath: string): Promise<string | null> {
  try {
    const dataBuffer = fs.readFileSync(filePath); // Read the PDF file
    const data = await pdf(dataBuffer); // Parse the PDF
    const text = data.text;

    // Match the content of the "Abbreviations" section
    const match = text.match(
      /Abbreviations\s*\n([\s\S]*?)(?=\n[A-Z][^\n]{2,}\n)/m
    ); // Adjust the regex if needed
    if (match) {
      return match[1].trim(); // Return the extracted section without the "Abbreviations" title
    }
    return null; // Return null if no match is found
  } catch (error) {
    // @ts-expect-error
    console.error(`Error processing ${filePath}: ${error?.message}`);
    return null;
  }
}

// Function to process all PDFs in the pdfDir
async function processAllPdfs() {
  try {
    const files = fs.readdirSync(pdfDir).filter((f) => f.endsWith(".pdf")); // Get all PDFs from the directory
    let output = ""; // String to store all extracted abbreviations

    // Loop through each PDF file and extract abbreviations
    for (const file of files) {
      const filePath = path.join(pdfDir, file); // Get full path of the file
      const abbreviations = await extractAbbreviations(filePath);
      if (abbreviations) {
        output += `From ${file}:\n${abbreviations}\n\n`; // Append to output
      }
    }

    // Write the result to a summary text file
    fs.writeFileSync(outputFile, output);
    console.log(
      "Extraction complete. Summary written to abbreviations_summary.txt"
    );
  } catch (error) {
    // @ts-expect-error
    console.error("Error processing PDFs:", error?.message);
  }
}

processAllPdfs(); // Call the function to process the PDFs
