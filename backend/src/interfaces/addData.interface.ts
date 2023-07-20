export interface AddDataInterface {
  patients: string[];
  doctors: string[];
  appointments: string[];
}

export interface StringsToObjectInterface {
  successful: string[];
  successfulObjects: any[];
  wrongFormat: string[];
  duplicates?: string[];
}
