import PatientModel from '../models/patient.model';
import DoctorModel from '../models/doctor.model';
import AppointmentModel from '../models/appointment.model';
export class ClearDBService {
  public async clearDB() {
    const [patients, doctors, appointments] = await Promise.all([
      PatientModel.deleteMany(),
      DoctorModel.deleteMany(),
      AppointmentModel.deleteMany(),
    ]);
    return { patients, doctors, appointments };
  }
}
