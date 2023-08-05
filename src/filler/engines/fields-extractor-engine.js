import QType from "../../utils/question-types";

export class FieldsExtractorEngine {
  // Extracts the questions and description from the DOM object and returns it
  // It might also extract the options in case of MCQs or other types, where answers do
  // play a  critical role

  constructor() { }

  getFields(element, fieldType) {
    let fields = {
      title: this.getTitle(element),
      description: this.getDescription(element),
    };

    // Dynamic values like options can be appended based on field type
    // Get options based on the field type and append them to the 'fields' object

    // this sets the required fields itself, the conditional checking is done in the function itself
    // the function is is highly abstracted

    // TODO : the getOptions() can be broken down into further functions if needed, just ensure that the return type is consistent so that the below line still works
    let optionFields = this.getOptions(fieldType, element);
    fields = { ...fields, ...optionFields };

    return fields;
  }

  getOptions(questionType, element) {
    // Function for Extracting Options
    // Input Type: DOM Object
    // Extracts the options of the question
    // ! Return Type : An object containing the options field and its required value
    // ! the return object may contain field other than options, as returned by the corresponding QuestionType

    switch (questionType) {

      // Extracting the options if the field type is MultiCorrect
      case QType.MULTI_CORRECT:
        return this.getOptions_MULTI_CORRECT(element);

      // Extracting the options if the field type is MultiCorrect_WITH_OTHER

      case QType.MULTI_CORRECT_WITH_OTHER:
        // We get options in the form of an OBJECT which has two properties
        //1. options - which contain options array
        //2. other - which contain `other:` which need to deal in separate way to ask Chatbot

        return this.getOptions_MULTI_CORRECT_WITH_OTHER(element);

      // Extracting the options if the field type is 'Multiple Choice'

      case QType.MULTIPLE_CHOICE:
        return this.getOptions_MULTIPLE_CHOICE(element);

      // Extracting the options if the field type is 'Multiple Choice With Other'.

      case QType.MULTIPLE_CHOICE_WITH_OTHER:
        // We get options in the form of an OBJECT which has two properties
        //1. options - which contain options array
        //2. other - which contain `other:` which need to deal in separate way to ask Chatbot

        return this.getOptions_MULTIPLE_CHOICE_WITH_OTHER(element);

      // Extracting the options if the field type is 'Linear Scale'

      case QType.LINEAR_SCALE:
        //We get options in an object {filteredOptions,filterLowerUpper}
        //In Linear_Scale Left and Right Bounds are given and options are distributed uniformly between these bounds.
        //These elements which we are saying Upper_bound and Lower_bound may be strings or characters.

        /*
        Note
        We added one more attribute to fields `lowerUpperBounds` whose value will have an array containing LowerBound,UpperBound.
        */
        return this.getOptions_LINEAR_SCALE(element);

      // Extracting the options if the field type is `Checkbox Grid` or `Multiple Choice Grid`
      case QType.CHECKBOX_GRID:
        return this.getOptions_CHECKBOXGRID(element);

      case QType.MULTIPLE_CHOICE_GRID:
        //We get options in form of an object
        //This object will contain 2 arrays 'rowsArray' and `columnsArray` which contains `row values` and `column values` respectively
        return this.getOptions_MULTIPLECHOICEGRID(element);

      // Extracting the options if the field type is Dropdown
      case QType.DROPDOWN:
        return this.getOptions_Dropdown(element);

      // Extracting the options if the field type is 'Text'.
      case QType.TEXT:
        //
        return this.getDom_TEXT(element);

      // Extracting the options if the field type is 'Paragraph'.
      case QType.PARAGRAPH:
        return this.getDom_paragraph(element);

      // Extracting the options if the field type is 'Email'.
      case QType.TEXT_EMAIL:
        return this.getDom_email(element);

      // Extracting the options if the field type is 'Text Numeric'.
      case QType.TEXT_NUMERIC:
        return this.getDom_TEXT(element);

      // Extracting the options if the field type is 'Text Telephonic'.
      case QType.TEXT_TEL:
        return this.getDom_texttel(element);

      // Extracting the options if the field type is 'Text URL'.
      case QType.TEXT_URL:
        return this.getDom_texturl(element);

      // Extracting the options if the field type is 'Date'.
      case QType.DATE:
        return this.getDom_date(element);

      // Extracting the options if the field type is 'Date And Time'.
      case QType.DATE_AND_TIME:
        return this.getDom_dateandtime(element);

      // Extracting the options if the field type is 'Time'.
      case QType.TIME:
        return this.getDom_time(element);

      // Extracting the options if the field type is 'Duration'.
      case QType.DURATION:
        return this.getDom_duration(element);

      // Extracting the options if the field type is 'Date without Year'.
      case QType.DATE_WITHOUT_YEAR:
        return this.getDom_date_without_year(element);

      // Extracting the options if the field type is 'Date without Year with Time'.
      case QType.DATE_TIME_WITHOUT_YEAR:
        return this.getDom_date_time_without_year(element);

      // Extracting the options if the field type is 'Date with Time and Meridiem'.
      case QType.DATE_TIME_WITH_MERIDIEM:
        return this.getDom_date_time_with_meridiem(element);

      // Extracting the options if the field type is 'Time and Meridiem'.
      case QType.TIME_WITH_MERIDIEM:
        return this.getDom_time_with_meridiem(element);

      // Extracting the options if the field type is 'Date without Year with Time and Meridiem'.
      case QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR:
        return this.getDom_date_time_with_meridiem_withoutyear(element);
    }
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
    Array.from(required.childNodes).forEach((element) => {
      if (element.nodeName === "#text") {
        content += element.textContent + "\n";
      } else {
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
    Array.from(required.childNodes).forEach((element) => {
      if (element.nodeName === "#text") {
        content += element.textContent + "\n";
      } else {
        content += element.textContent + "\n";
      }
    });
    // console.log("checkpoint1");
    // Remove trailing whitespace at the end
    return content.trimEnd();
  }

  // Functions for Extracting Options
  //Extracting the options for field type = MultiCorrect With Other or MultiCorrect
  getOptions_MULTI_CORRECT(element) {
    // Input Type: DOM Object
    // Extracts the options of the question
    // Tweak : - The extraction is based on the DOM tree
    //         - The required node is obtained by selecting the span as options were inside them , also these span has dir="auto"
    // Return Type : Array (containing option's data) =>null if no options are present

    const optionLabels = element.querySelectorAll('span[dir="auto"]');
    if (!optionLabels || optionLabels.length === 0) {
      // If no option labels are found, return an empty array
      return { options: [] };
    }

    //Extracting divs which has radio buttons.
    const super_Divs = element.querySelectorAll('div[role="checkbox"]');
    const clickElements = [];
    //For each option child of 2nd child of super_Divs' div will contain a div whose 1st child is responsible on selecting an option.
    //By using click() method on clickDiv.firstElementChild which we pushed in array 'ClickElements' will mark that particular option
    super_Divs.forEach((optionDiv) => {
      const thirdDiv = optionDiv.children[2];
      const clickDiv = thirdDiv.firstElementChild;
      clickElements.push(clickDiv.firstElementChild);
    });
    const options = [];
    const optiondata = [];
    //we will go through all spans and extract its text content and store in our answer array as optiondata.
    optionLabels.forEach((label) => {
      optiondata.push(label.textContent.trim());
    });

    if (clickElements.length > 0 && clickElements.length === optiondata.length) {
      for (let i = 0; i < clickElements.length; i++) {
        options.push({ option_data: optiondata[i], option_dom: clickElements[i] });
      }
    }

    return { options: options };
  }


  getOptions_MULTI_CORRECT_WITH_OTHER(element) {
    // Input Type: DOM Object
    // Extracts the options of the question
    // Tweak : - The extraction is based on the DOM tree
    //         - The required node is obtained by selecting the span as options were inside them , also these span has dir="auto"
    // Return Type : OBJECT which has two properties
    //1. options - which contain options array
    //2. other - which contain `other:` which need to deal in separate way to ask Chatbot 
    //it will contain an input field and in case no option match , we need to write our answer there

    const optionLabels = element.querySelectorAll('span[dir="auto"]');
    if (!optionLabels || optionLabels.length === 0) {
      // If no option labels are found, return an empty array
      return { options: [] };
    }

    //Extracting divs which has role=checkbox.
    const super_Divs = element.querySelectorAll('div[role="checkbox"]');
    const clickElements = [];
    //For each option child of 2nd child of super_Divs' div will contain a div which is responsible on selecting an option.
    //By using click() method on clickDiv which we pushed in array 'ClickOption' will mark that particular option
    super_Divs.forEach((optionDiv) => {
      const thirdDiv = optionDiv.children[2];
      const clickDiv = thirdDiv.firstElementChild;
      clickElements.push(clickDiv.firstElementChild);
    });

    const options = [];
    const optiondata = [];
    //we will go through all spans and extract its text content and store in an array.
    optionLabels.forEach((label) => {
      optiondata.push(label.textContent.trim());
    });
    // Remove the last option and add 'other_option' field in the object, `other_option` is itself an object containing option_data, option_dom,inputBoxdom
    const lastOptionIndex = optiondata.length - 1;
    const otherOption = optiondata.splice(lastOptionIndex, 1)[0];
    console.log(otherOption)
    const other_option = []
    if (clickElements.length > 0 && clickElements.length === optiondata.length + 1) {
      for (let i = 0; i < clickElements.length - 1; i++) {
        options.push({ data: optiondata[i], dom: clickElements[i], });
      }
      const input_in_mcwo = element.querySelector('input[dir="auto"]');
      other_option.push({ data: otherOption, dom: clickElements[clickElements.length - 1], inputBoxDom: input_in_mcwo });
    }

    return { options: options, other: other_option };

  }


  //Extracting the options for field type = MultipleChoice With Other or MultipleChoice
  getOptions_MULTIPLE_CHOICE(element) {
    // Input Type: DOM Object
    // Extracts the options of the question
    // Tweak : - The extraction is based on the DOM tree
    //         - The required node is obtained by selecting the span as options were inside them , also these span has dir="auto"
    // Return Type : Array (containing option's data) =>null if no options are present

    const optionLabels = element.querySelectorAll('span[dir="auto"]');
    if (!optionLabels || optionLabels.length === 0) {
      // If no option labels are found, return an empty array
      return { options: [] };
    }

    //Extracting divs which has radio buttons.
    const super_Divs = element.querySelectorAll('div[role="radio"]');
    const clickElements = [];
    //For each option child of 2nd child of super_Divs' div will contain a div which is responsible on selecting an option.
    //By using click() method on clickDiv which we pushed in array 'ClickOption' will mark that particular option
    super_Divs.forEach((optionDiv) => {
      const thirdDiv = optionDiv.children[2];
      const clickDiv = thirdDiv.firstElementChild;
      clickElements.push(clickDiv);
    });

    const options = [];
    const optiondata = [];
    //we will go through all spans and extract its text content and store in option_data array.
    optionLabels.forEach((label) => {
      optiondata.push(label.textContent.trim());
    });

    if (clickElements.length > 0 && clickElements.length === optiondata.length) {
      for (let i = 0; i < clickElements.length; i++) {
        options.push({ option_data: optiondata[i], option_dom: clickElements[i] });
      }
    }

    return { options: options };
  }


  getOptions_MULTIPLE_CHOICE_WITH_OTHER(element) {
    // Input Type: DOM Object
    // Extracts the options of the question
    // Tweak : - The extraction is based on the DOM tree
    //         - The required node is obtained by selecting the span as options were inside them , also these span has dir="auto"
    // Return Type : OBJECT which has two properties
    //1. options - which contain options array
    //2. other - which contain `other:` which need to deal in separate way to ask Chatbot 
    //it will contain an input field and in case no option match , we need to write our answer there

    const optionLabels = element.querySelectorAll('span[dir="auto"]');
    if (!optionLabels || optionLabels.length === 0) {
      // If no option labels are found, return an empty array
      return { options: [] };
    }

    //Extracting divs which has radio buttons.
    const super_Divs = element.querySelectorAll('div[role="radio"]');
    const clickElements = [];
    //For each option child of 2nd child of super_Divs' div will contain a div which is responsible on selecting an option.
    //By using click() method on clickDiv which we pushed in array 'ClickOption' will mark that particular option
    super_Divs.forEach((optionDiv) => {
      const thirdDiv = optionDiv.children[2];
      const clickDiv = thirdDiv.firstElementChild;
      clickElements.push(clickDiv.firstElementChild);
    });

    const options = [];
    const optiondata = [];
    //we will go through all spans and extract its text content and store in our answer array.
    optionLabels.forEach((label) => {
      optiondata.push(label.textContent.trim());
    });

    // console.log(optiondata)
    // Remove the last option and add 'Other' field in the object
    const lastOptionIndex = optiondata.length - 1;
    const otherOption = optiondata.splice(lastOptionIndex, 1)[0];
    console.log(otherOption)
    const other_dom = []
    if (clickElements.length > 0 && clickElements.length === optiondata.length + 1) {
      for (let i = 0; i < clickElements.length - 1; i++) {
        options.push({ data: optiondata[i], dom: clickElements[i] });
      }
      const input_in_mcwo = element.querySelector('input[dir="auto"]');

      other_dom.push({ other_data: otherOption, other_dom: clickElements[clickElements.length - 1], inputBoxDom: input_in_mcwo });
    }

    return { options: options, other: other_dom };

  }


  //Extracting the options for field type = LinearScale
  getOptions_LINEAR_SCALE(element) {
    // Input Type: DOM Object
    // Extracts the options of the question
    // Tweak : - The extraction is based on the DOM tree
    //         - The required node for Lower and Upper bound is obtained by selecting the span whose role="presentation" and then need to traverse more 
    //since no attribute can be found which can help
    //         -Option are present in in divs inside elements which has dir="auto".
    // Return Type : Object containing two arrays - {filterLowerUpper,filteredOptions}
    //filterLowerUpper- ArraySize=2 , contain lowerBound , upperBound
    //filteredOptions- It will contain options.

    let elementsWithHierarchy = element
      .querySelector('span[role="presentation"]')
      .querySelectorAll("div > div:last-child > div:last-child");
    let lowerBound = null;
    let upperBound = null;

    const super_Divs = element.querySelectorAll('div[role="radio"]');
    const domsArray = [];

    super_Divs.forEach((optionDiv) => {
      const thirdDiv = optionDiv.children[2];
      const clickDiv = thirdDiv.firstElementChild;
      const targetDom = clickDiv.firstElementChild;
      domsArray.push(targetDom);
    });

    //In elementWithHierarchy many nodes are present but we are sure 1st node is Lower bound and last node is Upper bound.
    elementsWithHierarchy.forEach((el) => {
      const textContent = el.textContent.trim();
      if (lowerBound === null && textContent !== '') {
        lowerBound = textContent;  //Assigning lowerBound with 1st node
      }

      else if (lowerBound !== null && textContent !== '') {
        upperBound = textContent;  //Assigning upperBound with each node we are at during traversal so last node will be assigned to upperBound. 
      }

    });
    // Extracting the options from element
    const optionElements = element.querySelectorAll('div[dir="auto"]');
    const options = Array.from(optionElements).map((optionElement) => optionElement.textContent.trim());

    // Iterate over domsArray and create object and store in optionsArray
    const optionsArray = [];
    if (domsArray.length > 0) {
      let j = 0;
      for (let i = 0; i < options.length; i++) {
        if (options[i] != "")
          optionsArray.push({ data: options[i], dom: domsArray[j++], });
      }
    }

    // Storing LowerBound and UpperBound data
    const lowerUpperBound = { lowerBound, upperBound };

    // Filter out any null or empty string elements from the array.
    // const filterLowerUpper = lowerUpperBound.filter(item => item !== null && item !== '');

    return { bounds: lowerUpperBound, options: optionsArray };
  }


  //Extracting the options for field type = Multiple Choice Grid.
  getOptions_MULTIPLECHOICEGRID(element) {
    // Input Type: DOM Object
    // Extracts the options of the question
    // Tweak : - The extraction is based on the DOM tree
    //         - The required node is founded by Brute-force traversing no attribute can be found to be helpful.
    //         
    // Return Type : Object containing 2 array 
    //               - 1st array will denote contents of row1,row2,row3...
    //               - 2nd array will denote contents of column1,column2,column3

    //No property can be found so need to traverse this way only!
    let path =
      "div:first-child > div:first-child > div:nth-child(2) > div:first-child > div:nth-child(2) > div";

    //After getting to this path,
    //its first child contains a div which contains all columns.
    // and rest divs were for rows
    //But between each row there was an empty div so we need to extract 2nd,4th,6th.. i.e even numbered divs**
    const rows = element.querySelectorAll(`${path}:nth-child(2n)`);
    const columns = element.querySelectorAll(`${path}:first-child > div`);

    const gridArray = [];
    //In these columns if we think in term of matrix then (0,0) place is left vacant so we sliced form 1 and take out content of each column.
    const columnsArray = Array.from(columns)
      .slice(1)
      .map((column) => column.textContent.trim());
    const rowsArray = Array.from(rows).map((row) => row.textContent.trim());

    //Returning an Object containing 2 array
    //      - 1st array will denote contents of row1,row2,row3...
    //      -2nd array will denote contents of column1,column2,column3
    let optionsArray = []
    rows.forEach((row) => {
      const columns = row.querySelectorAll('div[role="radio"]');
      const rowColumns = [];

      columns.forEach((column) => {
        const targetDom = column;

        rowColumns.push(targetDom);
      });

      optionsArray.push(rowColumns);  //option array will contain those buttons which we mark.

    });

    let option_dom = []
    for (let i = 0; i < rowsArray.length; i++) {
      for (let j = 0; j < columnsArray.length; j++) {
        //lets consider 2X3 multiple choice grid then option dom will be [{option:column1 dom:dom1} , {option:column2 dom:dom2} , {option:column3 dom:dom3} , {option:column1 dom:dom4} , {option:column2 dom:dom5} ,{option:column3 dom:dom6}]
        option_dom.push({ option: columnsArray[j], dom: optionsArray[i][j] })
      }
    }
    let row_col_dom = []
    let q = 0;
    let arr = []
    for (let i = 0; i < rowsArray.length; i++) {
      arr = [];
      for (let p = q; p < columnsArray.length * (i + 1); p++, q++) {
        arr.push(option_dom[p]);
      }
      row_col_dom.push({ row: rowsArray[i], cols: arr })
    }

    return {
      options: row_col_dom,
    };
  }

  //Extracting the options for field type = Checkbox Grid.
  getOptions_CHECKBOXGRID(element) {
    // Input Type: DOM Object
    // Extracts the options of the question
    // Tweak : - The extraction is based on the DOM tree
    //         - The required node is founded by Brute-force traversing no attribute can be found to be helpful.
    //         
    // Return Type : Returns an array of objects {row:rowsArray[i] , option_n_dom:arr} , arr is itself an array of objects containing columns and dom of (row,column)


    //No property can be found so need to traverse in this Brute force way only!
    const path = "div:first-child > div:first-child > div:nth-child(2) > div:first-child > div:nth-child(2) > div";

    //After getting to this path,
    //its first child contains a div which contains all columns.
    // and rest divs were for rows
    //But between each row there was an empty div so we need to extract 2nd,4th,6th.. i.e even numbered divs**
    const rows = element.querySelectorAll(`${path}:nth-child(2n)`);
    const columns = element.querySelectorAll(`${path}:first-child > div`);

    const gridArray = [];
    //In these columns if we think in term of matrix then (0,0) place is left vacant so we sliced form 1 and take out content of each column.
    const columnsArray = Array.from(columns).slice(1).map((column) => column.textContent.trim());
    const rowsArray = Array.from(rows).map((row) => row.textContent.trim());

    let optionsArray = []
    rows.forEach((row) => {
      const columns = row.querySelectorAll('div[role="checkbox"]');
      const rowColumns = [];

      columns.forEach((column) => {
        const targetDom = column.children[2];
        rowColumns.push(targetDom);
      });

      optionsArray.push(rowColumns);
    });

    let option_dom = []
    for (let i = 0; i < rowsArray.length; i++) {
      for (let j = 0; j < columnsArray.length; j++) {

        option_dom.push({ option: columnsArray[j], dom: optionsArray[i][j] })
      }
    }
    let row_col_dom = []
    let checkbox_number = 0;
    let arr = []
    for (let row_index = 0; row_index < rowsArray.length; row_index++) {
      arr = [];
      for (let p = checkbox_number; p < columnsArray.length * ((row_index) + 1); p++, checkbox_number++) {
        arr.push(option_dom[p]);
      }
      row_col_dom.push({ row: rowsArray[row_index], cols: arr })
    }
    return {
      options: row_col_dom
    };
  }


  //Extracting the options for field type = Dropdown.
  getOptions_Dropdown(element) {
    // Input Type: DOM Object
    // Extracts the options of the question
    // Tweak : - The extraction is based on the DOM tree
    //         - The required node is found by selecting all divs having role="option" , inside this there are spans which contain options.
    // Return Type : Array containing options.

    const optionDivs = element.querySelectorAll('div[role="option"]');
    if (!optionDivs || optionDivs.length === 0) {
      return { options: [] };
    }

    let options = [];
    //starting loop from one as option at 0th index is `Choose` so removed that.
    for (let i = 1; i < optionDivs.length; i++) {
      const optionDiv = optionDivs[i];
      const span = optionDiv.querySelector("span");

      if (span) {
        options.push({ option_data: span.textContent.trim(), option_dom: optionDiv });
      }
    }
    return { options: options };
  }

  getDom_TEXT(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="TEXT"
    // Return Type :Returns the input field.
    let inputField = element.querySelectorAll('input[type=text]')
    return { dom: inputField };
  }

  getDom_email(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="TEXT_EMAIL"
    // Return Type :Returns the input field.

    let inputField = element.querySelectorAll('input[type=text], input[type=email]')
    return { dom: inputField };
  }
  getDom_paragraph(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="PARAGRAPH"
    // Return Type :Returns the input field.

    let inputField = element.querySelectorAll('textarea')
    return { dom: inputField };
  }
  getDom_date(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="DATE"
    // Return Type :Returns the input field.Its returns input field as a Nodelist
    //Its 0th index give Month_field , 1st index give Day_field , 2nd index has Year_field
    let inputField = element.querySelectorAll('input[type=text], input[type=date]')
    return { dom: inputField };
  }
  getDom_dateandtime(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="DATE_AND_TIME"
    // Return Type :Returns the input field.Its return in form of a Nodelist
    //Its 0th index give Month_field , 1st index give Day_field , 2nd index has Year_field , 3rd index give Hour_field , 4th index give Minute_field

    let inputField = element.querySelectorAll('input[type=text], input[type=date]')
    return { dom: inputField };
  }
  getDom_duration(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="DURATION"
    // Return Type :Returns the input field.Its return in form of Nodelist 
    //Its 0th index give Hour_field , 1st index give Minute_field , 2nd index has Seconds field
    let inputField = element.querySelectorAll('input[type=text]')
    return { dom: inputField };
  }
  getDom_date_without_year(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="DATE_WITHOUT_YEAR"
    // Return Type :Returns the input field.Its return in form of Nodelist 
    //Its 0th index give month_field , 1st index give Day_field
    let inputField = element.querySelectorAll('input[type=text], input[type=date]')
    return { dom: inputField };
  }
  getDom_date_time_without_year(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="DATE_WITHOUT_YEAR"
    // Return Type :Returns the input field.Its return in form of Nodelist 
    //Its 0th index give Month_field , 1st index give Day_field , 2nd index give Hour_field , 3rd index give Minute_field
    let inputField = element.querySelectorAll('input[type=text], input[type=date]')
    return { dom: inputField };
  }
  getDom_textNumeric(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="TEXT_NUMERI"
    // Return Type :Returns the input field.
    let inputField = element.querySelectorAll('input[type=text]')
    return { dom: inputField };
  }
  getDom_texttel(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="TEXT_TEL"
    // Return Type :Returns the input field.
    let inputField = element.querySelectorAll('input[type=text]')
    return { dom: inputField };
  }
  getDom_texturl(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="TEXT_URL"
    // Return Type :Returns the input field.
    let inputField = element.querySelectorAll('input[type=url]')
    return { dom: inputField };
  }
  getDom_date_time_with_meridiem(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="DATE_TIME_WITH_MERIDIEM"
    // Return Type :Returns the input field as an array which contain two nodelists
    //- First nodelist- 0th index will has dom of Month , 1st index will contain Day, 2nd index-dom of year , 3rd index-dom of hour , 4th index-dom of minutes
    //- Second nodelist - 0th index will contain dom of `AM` and 1st index will contain dom of `PM` option
    let inputField_datetime = element.querySelectorAll('input[type=text]')
    let meridiem = element.querySelectorAll('div[role=option]')
    let inputField = [inputField_datetime, meridiem]
    return { dom: inputField };
  }
  getDom_time_with_meridiem(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="TIME_WITH_MERIDIEM"
    // Return Type :Returns the input field as an array of 2 NodeLists 
    //- First nodelist- 0th index will has dom of hour , 1st index will contain minutes , 3rd index-dom of seconds
    //- Second nodelist - 0th index will contain dom of `AM` and 1st index will contain dom of `PM` option
    let inputField_time = element.querySelectorAll('input[type=text]')
    let meridiem = element.querySelectorAll('div[role=option]')
    let inputField = [inputField_time, meridiem]
    return { dom: inputField };
  }
  getDom_date_time_with_meridiem_withoutyear(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR"
    //- First nodelist- 0th index will has dom of Month , 1st index will contain Day, 3rd index-dom of hour , 4th index-dom of minutes
    //- Second nodelist - 0th index will contain dom of `AM` and 1st index will contain dom of `PM` option
    let inputField_datetime = element.querySelectorAll('input[type=text]')
    let meridiem = element.querySelectorAll('div[role=option]')
    let inputField = [inputField_datetime, meridiem]
    return { dom: inputField };
  }
  getDom_time(element) {
    // Input Type: DOM Object
    // Extracts the Dom object from Question type ="DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR"
    // Return Type :Returns the input field.
    let inputField = element.querySelectorAll('input[type=text]')
    return { dom: inputField };
  }
}
