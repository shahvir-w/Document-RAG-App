export interface Compartment {
  heading: string;
  content: string | SubCompartment[];
}

export interface SubCompartment {
  heading: string;
  content: string;
}

export type ParsedSummary = Compartment[];

function parseMarkdownText(text: string): string {
  // Handle bold text (both ** and __ syntax)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // Handle bullet points
  // Split into lines, process each line, and rejoin
  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    // Handle different types of bullet points
    const bulletPointRegex = /^[-*•]\s+(.+)$/;
    const match = line.trim().match(bulletPointRegex);
    if (match) {
      return `<li>${match[1]}</li>`;
    }
    return line;
  });
  
  // Wrap consecutive <li> elements in <ul>
  let inList = false;
  const wrappedLines = [];
  
  for (const line of processedLines) {
    if (line.startsWith('<li>')) {
      if (!inList) {
        wrappedLines.push('<ul>');
        inList = true;
      }
      wrappedLines.push(line);
    } else {
      if (inList) {
        wrappedLines.push('</ul>');
        inList = false;
      }
      wrappedLines.push(line);
    }
  }
  
  if (inList) {
    wrappedLines.push('</ul>');
  }
  
  return wrappedLines.join('\n');
}

export function parseSummary(markdownSummary: string): ParsedSummary {
  const result: ParsedSummary = [];
  if (markdownSummary === "") {
    return result;
  }
  
  const lines = markdownSummary.split('\n').filter(line => line.trim() !== '');
  
  let currentCompartment: Compartment | null = null;
  let currentSubCompartments: SubCompartment[] = [];
  let currentSubCompartment: SubCompartment | null = null;
  let collectingSubContent = false;
  let collectingMainContent = false;
  let mainCompartmentContent = '';

  // Function to save current subcompartment
  const saveCurrentSubCompartment = () => {
    if (currentSubCompartment) {
      currentSubCompartments.push({
        ...currentSubCompartment,
        content: parseMarkdownText(currentSubCompartment.content.trim())
      });
      currentSubCompartment = null;
    }
  };

  // Function to save current compartment
  const saveCurrentCompartment = () => {
    if (currentCompartment) {
      // Save any pending subcompartment
      saveCurrentSubCompartment();
      
      if (currentSubCompartments.length > 0) {
        currentCompartment.content = currentSubCompartments;
      } else if (mainCompartmentContent.trim()) {
        currentCompartment.content = parseMarkdownText(mainCompartmentContent.trim());
      } else {
        currentCompartment.content = "No content provided";
      }
      result.push(currentCompartment);
      
      // Reset collections
      currentSubCompartments = [];
      mainCompartmentContent = '';
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('# ')) {
      // Save previous compartment before starting new one
      saveCurrentCompartment();
      
      // Create new compartment
      currentCompartment = {
        heading: line.replace('# ', '').trim(),
        content: ''
      };
      collectingMainContent = true;
      collectingSubContent = false;
    }
    else if (line.startsWith('## ')) {
      // Save previous subcompartment if exists
      saveCurrentSubCompartment();
      
      // We found a subcompartment, stop collecting main content
      collectingMainContent = false;
      collectingSubContent = true;

      // Create new subcompartment
      currentSubCompartment = {
        heading: line.replace('## ', '').trim(),
        content: ''
      };
    }
    else if (collectingSubContent && currentSubCompartment) {
      currentSubCompartment.content += line + '\n';
    }
    else if (collectingMainContent && currentCompartment) {
      mainCompartmentContent += line + '\n';
    }
  }

  // Save final compartment and any pending subcompartments
  saveCurrentCompartment();

  // Post-processing: Ensure no empty compartments
  return result.map(compartment => ({
    ...compartment,
    content: Array.isArray(compartment.content) && compartment.content.length === 0
      ? "No content provided"
      : compartment.content
  }));
}
