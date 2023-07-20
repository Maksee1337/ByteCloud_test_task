import { PersonInterface } from '../interfaces/person.interface';
import { validator } from '../validators/validators';

export class PersonDto implements PersonInterface {
  id?: number;
  hours?: number[];
  dob?: string;
  name?: string;
  constructor(person: string) {
    const fields = person.split(',').map((item) => item.trim());
    if (fields.length < 2 || fields.length > 4) throw new Error('Wrong format');

    if (validator.id(fields[0]) && validator.hours(fields[1])) {
      this.id = parseInt(fields[0]);
      const [start, end] = fields[1].split('-').map((h) => parseInt(h));
      this.hours = Array.from({ length: end - start }, (_, index) => index + start);
    } else {
      throw new Error('Wrong format');
    }
    if (fields.length === 4 && validator.name(fields[2]) && validator.date(fields[3])) {
      this.name = fields[2];
      this.dob = fields[3];
    } else if (fields.length === 3) {
      const [name, dob] = [validator.name(fields[2]), validator.date(fields[2])];
      if (name) {
        this.name = fields[2];
      } else if (dob) {
        this.dob = fields[2];
      } else {
        throw new Error('Wrong format');
      }
    } else if (fields.length === 4) {
      throw new Error('Wrong format');
    }
  }
}
