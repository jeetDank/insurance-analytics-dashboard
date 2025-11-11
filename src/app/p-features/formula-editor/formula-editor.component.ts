import { Component, ViewChild, ElementRef, signal, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Variable {
  name: string;
  value: number;
}

interface ApiFinancialData {
  [key: string]: {
    name: string;
    value: number;
    variable_name: string;
    description: string | null;
    format_type: string;
    children?: any;
  };
}


@Component({
  selector: 'app-formula-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formula-editor.component.html',
  styleUrls: ['./formula-editor.component.scss']
})
export class FormulaEditorComponent implements OnInit {
  @ViewChild('formulaInput', { static: false }) formulaInput!: ElementRef<HTMLInputElement>;


  @Input() metricsFromAPIResponse:any;

  // Using signals for reactive state management (Angular v19)
  variables = signal<Variable[]>([
    { name: 'revenue', value: 1000000 },
    { name: 'net_income', value: 250000 },
    { name: 'expenses', value: 750000 },
    { name: 'profit_margin', value: 0.25 },
    { name: 'tax_rate', value: 0.21 },
    { name: 'gross_profit', value: 400000 },
    { name: 'operating_income', value: 300000 },
    { name: 'total_assets', value: 5000000 },
    { name: 'total_liabilities', value: 2000000 },
    { name: 'equity', value: 3000000 }
  ]);

  formula = signal<string>('');
  result = signal<number | null>(null);
  error = signal<string>('');
  suggestions = signal<string[]>([]);
  showSuggestions = signal<boolean>(false);
  selectedSuggestionIndex = signal<number>(0);
  cursorPosition = signal<number>(0);

  // Get the current word being typed at cursor position
  getCurrentWord(text: string, position: number): string {
    const beforeCursor = text.slice(0, position);
    const match = beforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
    return match ? match[0] : '';
  }

  ngOnInit(): void {
      this.loadVariablesFromApi(this.metricsFromAPIResponse);
  }

  // Handle input change and show suggestions
  onFormulaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.formula.set(input.value);
    this.cursorPosition.set(input.selectionStart || 0);
    this.error.set('');
    this.result.set(null);

    const currentWord = this.getCurrentWord(this.formula(), this.cursorPosition());

    if (currentWord.length > 0) {
      // Filter variables that match the current word
      const filtered = this.variables()
        .map(v => v.name)
        .filter(varName => 
          varName.toLowerCase().startsWith(currentWord.toLowerCase())
        );

      if (filtered.length > 0) {
        this.suggestions.set(filtered);
        this.showSuggestions.set(true);
        this.selectedSuggestionIndex.set(0);
      } else {
        this.showSuggestions.set(false);
      }
    } else {
      this.showSuggestions.set(false);
    }
  }

  // Handle keyboard navigation
  onKeyDown(event: KeyboardEvent): void {
    if (!this.showSuggestions()) {
      if (event.key === 'Enter') {
        this.calculateFormula();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedSuggestionIndex.update(index => 
          index < this.suggestions().length - 1 ? index + 1 : 0
        );
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedSuggestionIndex.update(index => 
          index > 0 ? index - 1 : this.suggestions().length - 1
        );
        break;

      case 'Enter':
      case 'Tab':
        if (this.suggestions().length > 0) {
          event.preventDefault();
          this.insertSuggestion(this.suggestions()[this.selectedSuggestionIndex()]);
        }
        break;

      case 'Escape':
        this.showSuggestions.set(false);
        break;
    }
  }

  // Insert selected suggestion
  insertSuggestion(suggestion: string): void {
    const currentFormula = this.formula();
    const currentPosition = this.cursorPosition();
    
    const beforeCursor = currentFormula.slice(0, currentPosition);
    const afterCursor = currentFormula.slice(currentPosition);
    
    const currentWord = this.getCurrentWord(currentFormula, currentPosition);
    const newBefore = beforeCursor.slice(0, -currentWord.length);
    
    this.formula.set(newBefore + suggestion + afterCursor);
    this.showSuggestions.set(false);
    
    // Set cursor position after the inserted suggestion
    setTimeout(() => {
      const newPosition = newBefore.length + suggestion.length;
      this.formulaInput.nativeElement.setSelectionRange(newPosition, newPosition);
      this.formulaInput.nativeElement.focus();
    }, 0);
  }

  // Select suggestion on click
  selectSuggestion(suggestion: string): void {
    this.insertSuggestion(suggestion);
  }

  // Calculate the formula
  calculateFormula(): void {
    try {
      const currentFormula = this.formula();
      
      if (!currentFormula.trim()) {
        this.error.set('Please enter a formula');
        return;
      }

      let processedFormula = currentFormula;
      
      // Create a map for quick lookup
      const variableMap: { [key: string]: number } = {};
      this.variables().forEach(v => {
        variableMap[v.name] = v.value;
      });

      // Sort variables by length (descending) to avoid partial replacements
      const sortedVarNames = this.variables()
        .map(v => v.name)
        .sort((a, b) => b.length - a.length);
      
      // Replace variables with their values
      for (const varName of sortedVarNames) {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        processedFormula = processedFormula.replace(regex, variableMap[varName].toString());
      }

      // Validate that only mathematical operations are present
      const allowedChars = /^[0-9+\-*/().\s]+$/;
      if (!allowedChars.test(processedFormula)) {
        throw new Error('Invalid characters in formula');
      }

      // Evaluate the expression using Function constructor (safer than eval)
      const calculatedResult = new Function(`'use strict'; return (${processedFormula})`)();
      
      if (isNaN(calculatedResult) || !isFinite(calculatedResult)) {
        throw new Error('Invalid calculation result');
      }

      this.result.set(calculatedResult);
      this.error.set('');
    } catch (err: any) {
      this.error.set('Invalid formula: ' + (err.message || 'Unknown error'));
      this.result.set(null);
    }
  }

  // Clear the formula
  clearFormula(): void {
    this.formula.set('');
    this.result.set(null);
    this.error.set('');
    this.showSuggestions.set(false);
  }

  // Helper method to get variable value for display
  getVariableValue(name: string): number | undefined {
    return this.variables().find(v => v.name === name)?.value;
  }


  extractVariablesFromApi(
    apiData: ApiFinancialData, 
    includeChildren: boolean = false
  ): Variable[] {
    const variables: Variable[] = [];

    // Iterate through each top-level financial metric
    Object.entries(apiData).forEach(([key, data]) => {
      // Add the main variable
      variables.push({
        name: data.variable_name,
        value: data.value
      });

      // Optionally include child variables
      if (includeChildren && data.children) {
        const childVars = this.extractChildVariables(data.children);
        variables.push(...childVars);
      }
    });

    return variables;
  }

  /**
   * Extract child variables recursively from nested children object
   * @param children - Children object from API data
   * @returns Array of child variables
   */
  private extractChildVariables(children: any): Variable[] {
    const childVariables: Variable[] = [];

    // Iterate through categories (e.g., "Business Segments", "Consolidation Items")
    Object.values(children).forEach((categoryData: any) => {
      // Iterate through items in each category
      Object.values(categoryData).forEach((childData: any) => {
        if (childData.variable_name && childData.value !== undefined) {
          childVariables.push({
            name: childData.variable_name,
            value: childData.value
          });
        }
      });
    });

    return childVariables;
  }


  loadVariablesFromApi(apiData: ApiFinancialData, includeChildren: boolean = false): void {
    const extractedVariables = this.extractVariablesFromApi(apiData, includeChildren);
    this.variables.set(extractedVariables);
  }
}