import { PersonInterface } from '../interfaces/person.interface';
import { validator } from '../validators/validators';
import { AppointmentInterface } from '../interfaces/appointment.interface';

export class AppointmentDto implements AppointmentInterface {
  patientId?: number;
  doctorId?: number;
  time?: number;
  constructor(person: string) {
    const fields = person.split(',').map((item) => item.trim());
    if (fields.length < 2 || fields.length > 3) throw new Error('Wrong format');

    if (validator.id(fields[0]) && validator.id(fields[1])) {
      this.patientId = parseInt(fields[0]);
      this.doctorId = parseInt(fields[1]);
    } else {
      throw new Error('Wrong format');
    }

    if (fields.length === 3) {
      if (validator.time(fields[2])) {
        this.time = parseInt(fields[2]);
      } else {
        throw new Error('Wrong format');
      }
    }
  }
}
