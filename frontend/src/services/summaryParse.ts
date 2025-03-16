export interface Compartment {
  heading: string;
  content: string | SubCompartment[];
}

export interface SubCompartment {
  heading: string;
  content: string;
}

export type ParsedSummary = Compartment[];


export function parseSummary(markdownSummary: string): ParsedSummary {
  // Initialize the result object
  const result: ParsedSummary = []
  if (markdownSummary === "") {
    return result;
  }
  
  // Split the markdown by lines
  const lines = markdownSummary.split('\n').filter(line => line.trim() !== '');

  // Process the rest of the markdown
  let currentCompartment: Compartment | null = null;
  let currentSubCompartments: SubCompartment[] = [];
  let currentSubCompartment: SubCompartment | null = null;
  let collectingSubContent = false;
  let collectingMainContent = false;
  let mainCompartmentContent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for main compartment (# heading)
    if (line.startsWith('# ')) {
      // Save previous compartment if it exists
      if (currentCompartment) {
        if (currentSubCompartments.length > 0) {
          currentCompartment.content = [...currentSubCompartments];
        } else if (mainCompartmentContent.trim()) {
          currentCompartment.content = mainCompartmentContent.trim();
        }
        result.push(currentCompartment);
        currentSubCompartments = [];
        mainCompartmentContent = '';
      }

      // Create new compartment
      currentCompartment = {
        heading: line.replace('# ', '').trim(),
        content: ''
      };
      collectingMainContent = true;
      collectingSubContent = false;
    }
    // Check for subcompartment (## heading)
    else if (line.startsWith('## ')) {
      // Mark that the main compartment contains subcompartments
      if (collectingMainContent) {
        collectingMainContent = false;
      }

      // Save previous subcompartment if it exists
      if (currentSubCompartment) {
        currentSubCompartments.push(currentSubCompartment);
      }

      // Create new subcompartment
      currentSubCompartment = {
        heading: line.replace('## ', '').trim(),
        content: ''
      };
      collectingSubContent = true;
    }
    // Content for subcompartment
    else if (collectingSubContent && currentSubCompartment) {
      currentSubCompartment.content += line + '\n';
    }
    // Content for main compartment
    else if (collectingMainContent && currentCompartment) {
      mainCompartmentContent += line + '\n';
    }
  }

  // Handle the last compartment and subcompartment
  if (currentSubCompartment) {
    currentSubCompartments.push(currentSubCompartment);
  }

  if (currentCompartment) {
    if (currentSubCompartments.length > 0) {
      currentCompartment.content = [...currentSubCompartments];
    } else if (mainCompartmentContent.trim()) {
      currentCompartment.content = mainCompartmentContent.trim();
    }
    result.push(currentCompartment);
  }

  return result;
}

/**
 * Example usage of the parseSummary function
 */
export function example() {
  const sampleMarkdown = `
Title: Understanding React Hooks

# Introduction
React Hooks are a feature introduced in React 16.8 that allow you to use state and other React features without writing a class.

## Definition
Hooks are functions that let you "hook into" React state and lifecycle features from function components.

# Core Hooks
React provides several built-in Hooks.

## useState
The useState Hook lets you add React state to function components.

## useEffect
The useEffect Hook lets you perform side effects in function components.
`;

  const parsed = parseSummary(sampleMarkdown);
  console.log(parsed);
  /* Output would be:
    [
      {
        heading: "Introduction",
        content: [
          {
            heading: "Definition",
            content: "Hooks are functions that let you \"hook into\" React state and lifecycle features from function components.\n"
          }
        ]
      },
      {
        heading: "Core Hooks",
        content: [
          {
            heading: "useState",
            content: "The useState Hook lets you add React state to function components.\n"
          },
          {
            heading: "useEffect",
            content: "The useEffect Hook lets you perform side effects in function components.\n"
          }
        ]
      }
    ]
  */
}