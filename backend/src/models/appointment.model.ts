import { Schema, model } from 'mongoose';
import { AppointmentInterface } from '../interfaces/appointment.interface';

const AppointmentModel = new Schema<AppointmentInterface>({
  patientId: { type: Number, required: true },
  doctorId: { type: Number, required: true },
  time: { type: Number, required: false },
});

export default model<AppointmentInterface>('Appointment', AppointmentModel);
