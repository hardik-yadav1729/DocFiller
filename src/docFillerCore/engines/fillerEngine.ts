import { QType } from '@utils/questionTypes.ts';
import { SLEEP_DURATION } from '@utils/constant';

// Sleep utility function
function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export class FillerEngine {
  public async fill(
    fieldType: QType,
    fieldValue: ExtractedValue,
    value: any
  ): Promise<boolean> {
    if (fieldType === null) return false;

    switch (fieldType) {
      case QType.TEXT:
        return this.fillText(fieldValue, value);

      case QType.TEXT_EMAIL:
        return this.fillEmail(fieldValue, value);

      case QType.TEXT_URL:
        return this.fillTextURL(fieldValue, value);

      case QType.PARAGRAPH:
        return this.fillParagraph(fieldValue, value);

      case QType.LINEAR_SCALE:
        return await this.fillLinearScale(fieldValue, value);

      case QType.DROPDOWN:
        return await this.fillDropDown(fieldValue, value);

      case QType.CHECKBOX_GRID:
        return await this.fillCheckboxGrid(fieldValue, value);

      case QType.MULTIPLE_CHOICE_GRID:
        return await this.fillMultipleChoiceGrid(fieldValue, value);

      case QType.DATE:
        return this.fillDate(fieldValue, value);

      case QType.DATE_AND_TIME:
        return await this.fillDateAndTime(fieldValue, value);

      case QType.DATE_TIME_WITH_MERIDIEM:
        return await this.fillDateAndTimeWithMeridiem(fieldValue, value);

      case QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR:
        return await this.fillDateTimeWithMeridiemWithoutYear(
          fieldValue,
          value
        );

      case QType.TIME_WITH_MERIDIEM:
        return await this.fillTimeWithMeridiem(fieldValue, value);

      case QType.TIME:
        return this.fillTime(fieldValue, value);

      case QType.DURATION:
        return this.fillDuration(fieldValue, value);

      case QType.DATE_WITHOUT_YEAR:
        return this.fillDateWithoutYear(fieldValue, value);

      case QType.DATE_TIME_WITHOUT_YEAR:
        return await this.fillDateTimeWithoutYear(fieldValue, value);

      case QType.MULTI_CORRECT_WITH_OTHER:
      case QType.MULTI_CORRECT:
        return await this.fillMultiCorrectWithOther(fieldValue, value);

      case QType.MULTIPLE_CHOICE_WITH_OTHER:
      case QType.MULTIPLE_CHOICE:
        return await this.fillMultipleChoiceWithOther(fieldValue, value);
    }
  }

  private fillText(fieldValue: ExtractedValue, value: string): boolean {
    const inputField = fieldValue.dom as HTMLInputElement;
    if (inputField) {
      inputField.value = value;
      inputField.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    return false;
  }

  private fillEmail(
    fieldValue: ExtractedValue,
    value: GenericLLMResponse
  ): boolean {
    return this.fillText(fieldValue, value?.answer);
  }

  private fillTextURL(
    fieldValue: ExtractedValue,
    value: GenericLLMResponse
  ): boolean {
    return this.fillText(fieldValue, value?.answer);
  }

  private fillParagraph(fieldValue: ExtractedValue, value: string): boolean {
    return this.fillText(fieldValue, value);
  }

  private fillDate(fieldValue: ExtractedValue, value: Date): boolean {
    if (!(value instanceof Date)) return false;

    const date = value;

    if (isNaN(date.valueOf())) return false;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    const inputEvent = new Event('input', { bubbles: true });

    if (fieldValue.date) {
      fieldValue.date.value = day;
      fieldValue.date.dispatchEvent(inputEvent);
    }

    if (fieldValue.month) {
      fieldValue.month.value = month;
      fieldValue.month.dispatchEvent(inputEvent);
    }

    if (fieldValue.year) {
      fieldValue.year.value = year;
      fieldValue.year.dispatchEvent(inputEvent);
    }

    return true;
  }

  private async fillDateAndTime(
    fieldValue: ExtractedValue,
    value: Date
  ): Promise<boolean> {
    await sleep(SLEEP_DURATION);
    if (!(value instanceof Date)) return false;

    const date = value;

    if (isNaN(date.valueOf())) return false;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const inputEvent = new Event('input', { bubbles: true });

    if (fieldValue.date) {
      fieldValue.date.value = day;
      fieldValue.date.dispatchEvent(inputEvent);
    }

    if (fieldValue.month) {
      fieldValue.month.value = month;
      fieldValue.month.dispatchEvent(inputEvent);
    }

    if (fieldValue.year) {
      fieldValue.year.value = year;
      fieldValue.year.dispatchEvent(inputEvent);
    }

    if (fieldValue.hour) {
      fieldValue.hour.value = hours;
      fieldValue.hour.dispatchEvent(inputEvent);
    }

    if (fieldValue.minute) {
      fieldValue.minute.value = minutes;
      fieldValue.minute.dispatchEvent(inputEvent);
    }

    return true;
  }

  private async fillDateTimeWithMeridiemWithoutYear(
    fieldValue: ExtractedValue,
    value: Date
  ): Promise<boolean> {
    await sleep(SLEEP_DURATION);

    if (!(value instanceof Date)) return false;

    const date = value;

    if (isNaN(date.valueOf())) return false;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours24 = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const meridiem = hours24 >= 12 ? 'PM' : 'AM';
    const hours = (hours24 % 12 || 12).toString().padStart(2, '0');

    const inputEvent = new Event('input', { bubbles: true });

    if (fieldValue.date) {
      fieldValue.date.value = day;
      fieldValue.date.dispatchEvent(inputEvent);
    }

    if (fieldValue.month) {
      fieldValue.month.value = month;
      fieldValue.month.dispatchEvent(inputEvent);
    }

    if (fieldValue.hour) {
      fieldValue.hour.value = hours;
      fieldValue.hour.dispatchEvent(inputEvent);
    }

    if (fieldValue.minute) {
      fieldValue.minute.value = minutes;
      fieldValue.minute.dispatchEvent(inputEvent);
    }

    if (fieldValue.meridiem) {
      const meridiemDropdown = fieldValue.meridiem;

      if (
        meridiemDropdown &&
        meridiemDropdown.getAttribute('aria-expanded') !== 'true'
      ) {
        meridiemDropdown.dispatchEvent(new Event('click', { bubbles: true }));
        await sleep(SLEEP_DURATION);
      }

      const optionElements = Array.from(
        meridiemDropdown.parentElement?.childNodes || []
      ).find(
        (child) =>
          !(child as HTMLElement).querySelector('div[role=presentation]')
      )?.childNodes;

      if (optionElements) {
        for (const option of Array.from(optionElements)) {
          const span = (option as HTMLElement).querySelector('span');
          const optionText = span?.textContent?.trim();
          if (optionText?.toLowerCase() === meridiem.toLowerCase()) {
            if (span) {
              span.dispatchEvent(new Event('click', { bubbles: true }));
            }
            return true;
          }
        }
      }
    }

    return false;
  }

  private async fillTimeWithMeridiem(
    fieldValue: ExtractedValue,
    value: Date
  ): Promise<boolean> {
    await sleep(SLEEP_DURATION);

    if (!(value instanceof Date)) return false;

    const date = value;

    if (isNaN(date.valueOf())) return false;

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const meridiem = hours >= 12 ? 'PM' : 'AM';
    const hours12 = (hours % 12 || 12).toString().padStart(2, '0');

    const inputEvent = new Event('input', { bubbles: true });

    if (fieldValue.hour) {
      fieldValue.hour.value = hours12;
      fieldValue.hour.dispatchEvent(inputEvent);
    }
    if (fieldValue.minute) {
      fieldValue.minute.value = minutes;
      fieldValue.minute.dispatchEvent(inputEvent);
    }

    if (fieldValue.meridiem) {
      const meridiemDropdown = fieldValue.meridiem;

      if (
        meridiemDropdown &&
        meridiemDropdown.getAttribute('aria-expanded') !== 'true'
      ) {
        meridiemDropdown.dispatchEvent(new Event('click', { bubbles: true }));
        await sleep(SLEEP_DURATION);
      }

      const optionElements = Array.from(
        meridiemDropdown.parentElement?.childNodes || []
      ).find(
        (child) =>
          !(child as HTMLElement).querySelector('div[role=presentation]')
      )?.childNodes;

      if (optionElements) {
        for (const option of Array.from(optionElements)) {
          const span = (option as HTMLElement).querySelector('span');
          const optionText = span?.textContent?.trim();
          if (optionText?.toLowerCase() === meridiem.toLowerCase()) {
            span?.dispatchEvent(new Event('click', { bubbles: true }));
            return true;
          }
        }
      }
    }

    return false;
  }

  private async fillDateAndTimeWithMeridiem(
    fieldValue: ExtractedValue,
    value: Date
  ): Promise<boolean> {
    await sleep(SLEEP_DURATION);

    if (!(value instanceof Date)) return false;

    const date = value;

    if (isNaN(date.valueOf())) return false;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const meridiem = hours >= 12 ? 'PM' : 'AM';
    const hours12 = (hours % 12 || 12).toString().padStart(2, '0');

    const inputEvent = new Event('input', { bubbles: true });

    if (fieldValue.date) {
      fieldValue.date.value = day;
      fieldValue.date.dispatchEvent(inputEvent);
    }
    if (fieldValue.month) {
      fieldValue.month.value = month;
      fieldValue.month.dispatchEvent(inputEvent);
    }
    if (fieldValue.year) {
      fieldValue.year.value = year;
      fieldValue.year.dispatchEvent(inputEvent);
    }

    if (fieldValue.hour) {
      fieldValue.hour.value = hours12;
      fieldValue.hour.dispatchEvent(inputEvent);
    }
    if (fieldValue.minute) {
      fieldValue.minute.value = minutes;
      fieldValue.minute.dispatchEvent(inputEvent);
    }

    if (fieldValue.meridiem) {
      const meridiemDropdown = fieldValue.meridiem;

      if (
        meridiemDropdown &&
        meridiemDropdown.getAttribute('aria-expanded') !== 'true'
      ) {
        meridiemDropdown.dispatchEvent(new Event('click', { bubbles: true }));
        await sleep(SLEEP_DURATION);
      }

      const optionElements = Array.from(
        meridiemDropdown.parentElement?.childNodes || []
      ).find(
        (child) =>
          !(child as HTMLElement).querySelector('div[role=presentation]')
      )?.childNodes;

      if (optionElements) {
        for (const option of Array.from(optionElements)) {
          const span = (option as HTMLElement).querySelector('span');
          const optionText = span?.textContent?.trim();
          if (optionText?.toLowerCase() === meridiem.toLowerCase()) {
            span?.dispatchEvent(new Event('click', { bubbles: true }));
            return true;
          }
        }
      }
    }

    return false;
  }

  private fillTime(fieldValue: ExtractedValue, value: Date): boolean {
    if (!(value instanceof Date)) return false;

    const date = value;

    if (isNaN(date.valueOf())) return false;

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const inputEvent = new Event('input', { bubbles: true });

    if (fieldValue.hour) {
      fieldValue.hour.value = hours;
      fieldValue.hour.dispatchEvent(inputEvent);
    }

    if (fieldValue.minute) {
      fieldValue.minute.value = minutes;
      fieldValue.minute.dispatchEvent(inputEvent);
    }

    return true;
  }

  private fillDuration(fieldValue: ExtractedValue, value: Date): boolean {
    if (!(value instanceof Date)) return false;
    const hours = value.getUTCHours().toString();
    const minutes = value.getUTCMinutes().toString();
    const seconds = value.getUTCSeconds().toString();

    const inputEvent = new Event('input', { bubbles: true });

    if (fieldValue.hour) {
      fieldValue.hour.value = hours;
      fieldValue.hour.dispatchEvent(inputEvent);
    }
    if (fieldValue.minute) {
      fieldValue.minute.value = minutes;
      fieldValue.minute.dispatchEvent(inputEvent);
    }
    if (fieldValue.second) {
      fieldValue.second.value = seconds;
      fieldValue.second.dispatchEvent(inputEvent);
    }

    return true;
  }

  private fillDateWithoutYear(
    fieldValue: ExtractedValue,
    value: Date
  ): boolean {
    if (!(value instanceof Date)) return false;

    const date = value;

    if (isNaN(date.valueOf())) return false;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    const inputEvent = new Event('input', { bubbles: true });

    if (fieldValue.date) {
      fieldValue.date.value = day;
      fieldValue.date.dispatchEvent(inputEvent);
    }

    if (fieldValue.month) {
      fieldValue.month.value = month;
      fieldValue.month.dispatchEvent(inputEvent);
    }

    return true;
  }

  private async fillDateTimeWithoutYear(
    fieldValue: ExtractedValue,
    value: Date
  ): Promise<boolean> {
    await sleep(SLEEP_DURATION);

    if (!(value instanceof Date)) return false;

    const date = value;

    if (isNaN(date.valueOf())) return false;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const inputEvent = new Event('input', { bubbles: true });

    if (fieldValue.date) {
      fieldValue.date.value = day;
      fieldValue.date.dispatchEvent(inputEvent);
    }

    if (fieldValue.month) {
      fieldValue.month.value = month;
      fieldValue.month.dispatchEvent(inputEvent);
    }

    if (fieldValue.hour) {
      fieldValue.hour.value = hours;
      fieldValue.hour.dispatchEvent(inputEvent);
    }

    if (fieldValue.minute) {
      fieldValue.minute.value = minutes;
      fieldValue.minute.dispatchEvent(inputEvent);
    }

    return true;
  }

  private async fillMultiCorrectWithOther(
    fieldValue: ExtractedValue,
    value: MultiCorrectOrMultipleOption[]
  ): Promise<boolean> {
    await sleep(SLEEP_DURATION);

    for (const element of fieldValue.options || []) {
      for (const option of value) {
        // For checkbox
        if (option.optionText && !option.isOther) {
          if (element.data.toLowerCase() === option.optionText.toLowerCase()) {
            if (element.dom?.getAttribute('aria-checked') !== 'true') {
              element.dom?.dispatchEvent(new Event('click', { bubbles: true }));
            }
          }
        }
        // For Other option
        if (option.isOther && option.otherOptionValue) {
          if (fieldValue.other?.dom?.getAttribute('aria-checked') !== 'true') {
            fieldValue.other?.dom?.dispatchEvent(
              new Event('click', { bubbles: true })
            );
          }

          fieldValue.other?.inputBoxDom.setAttribute(
            'value',
            option.otherOptionValue
          );
          fieldValue.other?.inputBoxDom.dispatchEvent(
            new Event('input', { bubbles: true })
          );
        }
      }
    }
    return true;
  }

  private async fillMultipleChoiceWithOther(
    fieldValue: ExtractedValue,
    value: MultiCorrectOrMultipleOption
  ): Promise<boolean> {
    await sleep(SLEEP_DURATION);

    for (const element of fieldValue.options || []) {
      // For checkbox
      if (value.optionText && !value.isOther) {
        if (element.data.toLowerCase() === value.optionText.toLowerCase()) {
          if (element.dom?.getAttribute('aria-checked') !== 'true') {
            element.dom?.dispatchEvent(new Event('click', { bubbles: true }));
          }
        }
      }
      // For Other option
      else if (value.isOther && value.otherOptionValue) {
        if (fieldValue.other?.dom?.getAttribute('aria-checked') !== 'true') {
          fieldValue.other?.dom?.dispatchEvent(
            new Event('click', { bubbles: true })
          );
        }

        fieldValue.other?.inputBoxDom.setAttribute(
          'value',
          value.otherOptionValue
        );
        fieldValue.other?.inputBoxDom.dispatchEvent(
          new Event('input', { bubbles: true })
        );
      }
    }
    return true;
  }

  private async fillLinearScale(
    fieldValue: ExtractedValue,
    value: LinearScaleResponse
  ): Promise<boolean> {
    await sleep(SLEEP_DURATION);
    for (const index in fieldValue.options) {
      if (fieldValue.options?.hasOwnProperty(index)) {
        const scale = fieldValue.options[Number(index)];

        if (scale.data.toString() === value?.answer?.toString()) {
          if (scale.dom?.getAttribute('aria-checked') !== 'true') {
            (scale.dom as HTMLInputElement)?.dispatchEvent(
              new Event('click', { bubbles: true })
            );
          }
          return true;
        }
      }
    }
    return false;
  }

  private async fillCheckboxGrid(
    fieldValue: ExtractedValue,
    options: RowColumnOption[]
  ): Promise<boolean> {
    await sleep(SLEEP_DURATION);

    fieldValue.rowColumnOption?.forEach((row) => {
      const matchingOptionRow = options.find(
        (option) => option.row === row.row
      );
      if (matchingOptionRow) {
        matchingOptionRow.cols.forEach((optionValue) => {
          const checkboxObj = row.cols.find(
            (col) => col.data === optionValue.data
          );
          if (checkboxObj) {
            // Check if already marked
            if (
              !checkboxObj.dom?.querySelector(
                'div[role=checkbox][aria-checked=true]'
              )
            ) {
              checkboxObj.dom?.dispatchEvent(
                new Event('click', { bubbles: true })
              );
            }
          }
        });
      }
    });
    return true;
  }

  private async fillMultipleChoiceGrid(
    fieldValue: ExtractedValue,
    options: RowColumn[]
  ): Promise<boolean> {
    await sleep(SLEEP_DURATION);

    fieldValue.rowColumnOption?.forEach((row) => {
      const matchingOptionRow = options.find(
        (option) => option.row === row.row
      );
      if (matchingOptionRow) {
        const matchingOptionRowCol = row.cols.find(
          (box) => box.data === matchingOptionRow.selectedColumn
        );
        if (matchingOptionRowCol) {
          if (
            matchingOptionRowCol.dom?.getAttribute('aria-checked') !== 'true'
          ) {
            matchingOptionRowCol.dom?.dispatchEvent(
              new Event('click', { bubbles: true })
            );
          }
        }
      }
    });

    return true;
  }

  private async fillDropDown(
    fieldValue: ExtractedValue,
    value: GenericLLMResponse
  ): Promise<boolean> {
    await sleep(SLEEP_DURATION);

    for (const option of fieldValue.options || []) {
      if (option.data === value?.answer) {
        const dropdown = option.dom;
        if (fieldValue.dom) {
          if (fieldValue.dom?.getAttribute('aria-expanded') !== 'true') {
            fieldValue.dom
              ?.querySelector('div[role=presentation]')
              ?.dispatchEvent(new Event('click', { bubbles: true }));
            await sleep(SLEEP_DURATION);
          }

          const allOptions =
            fieldValue.dom.querySelectorAll(`div[role=option]`);
          allOptions.forEach((possibleOption) => {
            if (
              possibleOption.querySelector('span')?.textContent === value.answer
            ) {
              possibleOption.dispatchEvent(
                new Event('click', { bubbles: true })
              );
              return;
            }
          });

          return true;
        }
      }
    }
    return false;
  }
}
