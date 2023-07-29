import QType from "../../utils/question-types";

export class FieldsExtractorEngine {
	// Extracts the questions and description from the DOM object and returns it
	// It might also extract the options in case of MCQs or other types, where answers do
	// play a  critical role

	constructor() { }

	getFields(element, fieldType) {

		let fields = { 
						"title": this.getTitle(element),
						"description": this.getDescription(element)
					}; 

		// Dynamic values like options can be appended based on field type
          // Get options based on the field type and append them to the 'fields' object
    

     // Extracting the options if the field type is MultiCorrect With Other or MultiCorrect
    if (fieldType === QType.MULTI_CORRECT_WITH_OTHER || fieldType === QType.MULTI_CORRECT) {
      //Handles both cases - `MultiCorrect With Other` and `MultiCorrect`
      //We get Options in an array
      fields.options = this.getOptions_MULTI_CORRECT(element);
  }

     // Extracting the options if the field type is Dropdown
  else if (fieldType === QType.DROPDOWN) {
      // We get options in the form of an array
      fields.options = this.getOptions_Dropdown(element);
  }

  // Extracting the options if the field type is 'Multiple Choice With Other' or 'Multiple Choice'
  if (fieldType === QType.MULTIPLE_CHOICE_WITH_OTHER || fieldType === QType.MULTIPLE_CHOICE) {
      // We get options in the form of an array
      fields.options = this.getOptions_MULTIPLE_CHOICE(element);
  }

  // Extracting the options if the field type is 'Linear Scale'
  if (fieldType === QType.LINEAR_SCALE) {
      //We get options in an array
      //In Linear_Scale Left and Right Bounds are given and options are distributed uniformally between these bounds.
      //These elements which we are saying Upper_bound and Lower_bound may be strings or characters.
      
      /*
      Note
      1.ReturnedArray[0] is lower bound
      2.Last index value i.e ReturnedArray[ReturnedArray.size()-1] is upper bound
      3.In between will be options whick need to be tick.
      */
      fields.options = this.getOptions_LINEAR_SCALE(element);
  }

  // Extracting the options if the field type is `Checkbox Grid` or `Multiple Choice Grid`
  if (fieldType === QType.CHECKBOX_GRID || fieldType === QType.MULTIPLE_CHOICE_GRID) {
      //We get options in form of an object
      //This object will contain 2 arrays 'rowsArray' and `columnsArray` which contains `row values` and `column values` respectively
      fields.options = this.getOptions_GRID(element);
  }
  //Returning the object fields.It contains title , description , options (if that question has) keys .
		return fields;
	}

	// Testing on Different Forms required
	getTitle(element) {
		// Input Type: DOM Object
		// Extracts the title of the question
		// Tweak : - The extraction is based on the DOM tree
		//         - The required node is obtained by selecting the first child element of div with role=heading
		// Return Type : String
		let required = element.querySelector('div[role="heading"]');
		required = required.children[0];

		let content = "";

		// Every new line is either inside a div or independent, hence has nodeName #text
		Array.from(required.childNodes).forEach(element => {
			if (element.nodeName === '#text') {
				content += element.textContent + "\n";
			}
			else {
				content += element.textContent + "\n";
			}
		});

		// Remove trailing whitespace at the end
		return content.trimEnd();
	}

	// Testing on Different Forms required

	getDescription(element) {
		// Input Type: DOM Object
		// Extracts the description of the question
		// Tweak : - The extraction is based on the DOM tree
		//         - The required node is obtained by selecting the second child element of the parent element of div with role=heading
		// Return Type : String (Returns null if no description is found!)
		let required = element.querySelector('div[role="heading"]');
		required = required.parentElement.children[1];
		if (required === undefined || required.textContent === "") {
			// console.log("There is no description for this box!");
			return null;
		}

		let content = "";

		// Every new line is either inside a div or independent, hence has nodeName #text
		Array.from(required.childNodes).forEach(element => {
			if (element.nodeName === '#text') {
				content += element.textContent + "\n";
			}
			else {
				content += element.textContent + "\n";
			}
		});
		console.log("checkpoint1");
		// Remove trailing whitespace at the end
		return content.trimEnd();
	}




	// Functions for Extracting Options

    //Extracting the options for field type = MultiCorrect With Other or MultiCorrect
    getOptions_MULTI_CORRECT(element)
    {
      // Input Type: DOM Object
        // Extracts the options of the question
        // Tweak : - The extraction is based on the DOM tree
        //         - The required node is obtained by selecting the span as options were inside them , also these span has dir="auto"
        // Return Type : Array (containing option's data) =>null if no options are present

      const optionLabels = element.querySelectorAll('span[dir="auto"]');
      if (!optionLabels || optionLabels.length === 0) {
        // If no option labels are found, return an empty array
        return [];
      }
      
          const options = [];
          //we will go through all spans and extract its text content and store in our answer array.
        optionLabels.forEach((label) => {
         options.push(label.textContent.trim());
         });
      
          return options;
        }


        //Extracting the options for field type = MultipleChoice With Other or MultipleChoice
    getOptions_MULTIPLE_CHOICE(element){
         // Input Type: DOM Object
        // Extracts the options of the question
        // Tweak : - The extraction is based on the DOM tree
        //         - The required node is obtained by selecting the span as options were inside them , also these span has dir="auto"
        // Return Type : Array (containing option's data) =>null if no options are present
        
        const optionLabels = element.querySelectorAll('span[dir="auto"]');
        if (!optionLabels || optionLabels.length === 0) {
          // If no option labels are found, return an empty array
          return [];
        }
          
            const options = [];
             //we will go through all spans and extract its text content and store in our answer array.
        optionLabels.forEach((label) => {
        options.push(label.textContent.trim());
        });

  return options;
          }

          //Extracting the options for field type = LinearScale
    getOptions_LINEAR_SCALE(element)
        {
             // Input Type: DOM Object
        // Extracts the options of the question
        // Tweak : - The extraction is based on the DOM tree
        //         - The required node for Lower and Upper bound is obtained by selecting the span whose role="presentation" and then need to traverse more 
                     //since no attribute can be found which can help
        //         -Option are present in in divs inside elements which has dir="auto".
        // Return Type : Array (containing option's data) =>null if no options are present
        
            const elementsWithHierarchy = element.querySelector('span[role="presentation"]').querySelectorAll('div > div:last-child > div:last-child');
            let lowerBound = null;
            let upperBound = null;
            //In elementWithHierarchy many nodes are present but we are sure 1st node is Lower bound and last node is Upper bound.
            elementsWithHierarchy.forEach((el) => {
             const textContent = el.textContent.trim();

             if (lowerBound === null && textContent !== '') {
             lowerBound = textContent;             //Assigning lowerBound with 1st node
            }

        else if (lowerBound !== null && textContent !== '') {
             upperBound = textContent;             //Assigning upperBound with each node we are at during traversal so last node will be assigned to upperBound. 
            }

           });
      
        const optionElements = element.querySelectorAll('div[dir="auto"]');
        const options = Array.from(optionElements).map((optionElement) => optionElement.textContent.trim());
      
        // Combining linear scale data into an array
        // The linearScaleData array is constructed by spreading the values of lowerBound, followed by all the options,
        // and finally, adding upperBound to the array. This results in a single array containing all the elements needed to
        // represent a linear scale, with the lower bound at the beginning, the options in the middle, and the upper bound at the end.
        const linearScaleData = [lowerBound, ...options, upperBound];
      
        // Filter out any null or empty string elements from the array
        //This was creating an unexpected problem!
        const filteredLinearScaleData = linearScaleData.filter(item => item !== null && item !== '');
      
        return filteredLinearScaleData;
}


    //Extracting the options for field type = Multiple Choice Grid or Checkbox Grid.
getOptions_GRID(element) {
     // Input Type: DOM Object
        // Extracts the options of the question
        // Tweak : - The extraction is based on the DOM tree
        //         - The required node is founded by Bruteforce traversing no attribute can be found to be helpful.
        //         
        // Return Type : Object containing 2 array 
        //              - 1st array will denote contents of row1,row2,row3...
        //              -2nd array will denote contents of column1,column2,column3
        

    //No property can be found so need to traverse this way only!
    const path = "div:first-child > div:first-child > div:nth-child(2) > div:first-child > div:nth-child(2) > div";

    //After getting to this path,
    //its first child contains a div which contains all columns.
    // and rest divs were for rows
    //But between each row there was an empty div so we need to extract 2nd,4th,6th.. i.e even numbered divs**
    const rows = element.querySelectorAll(`${path}:nth-child(2n)`);
    const columns = element.querySelectorAll(`${path}:first-child > div`);
  
    const gridArray = [];
    //In these columns if we think in term of matrix then (0,0) place is left vacent so we sliced form 1 and take out content of each column.
    const columnsArray = Array.from(columns).slice(1).map((column) => column.textContent.trim());
    const rowsArray = Array.from(rows).map((row) => row.textContent.trim());
    
    //Returning an Object containing 2 array 
    //      - 1st array will denote contents of row1,row2,row3...
    //      -2nd array will denote contents of column1,column2,column3
    return {
      rows: rowsArray,
      columns: columnsArray,
    };
  }
  
  
  
  //Extracting the options for field type = Dropdown.
  getOptions_Dropdown(element)
     {
        // Input Type: DOM Object
        // Extracts the options of the question
        // Tweak : - The extraction is based on the DOM tree
        //         - The required node is found by selecting all divs having role="option" , inside this there are spans which contain options.
        // Return Type : Array containing options.
        
        const optionDivs = element.querySelectorAll('div[role="option"]');
      
        if (!optionDivs || optionDivs.length === 0) {
          return [];
        }
      
        const optionTexts = Array.from(optionDivs).map((div) => {
          const span = div.querySelector("span");
          if (span) {
            return span.textContent.trim();
          } else {
            return null;
          }
        });
        
        //All options were extracted but 1st elemnt was choose so removing that.
        // Remove the first element ("Choose" option) from the array
        const optionsWithoutChoose = optionTexts.slice(1);
        return optionsWithoutChoose;
      }
    }
