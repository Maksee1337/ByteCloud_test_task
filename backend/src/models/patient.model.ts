import { Schema, model } from 'mongoose';
import { PersonInterface } from '../interfaces/person.interface';

const PatientModel = new Schema<PersonInterface>({
  id: { type: Number, required: true, unique: true },
  hours: { type: [Number], required: true },
  name: { type: String, required: false },
  dob: { type: String, required: false },
});

export default model<PersonInterface>('Patient', PatientModel);
