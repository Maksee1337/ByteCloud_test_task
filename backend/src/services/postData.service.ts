import { AddDataInterface, StringsToObjectInterface } from '../interfaces/addData.interface';
import { PersonDto } from '../dto/person.dto';
import { AppointmentDto } from '../dto/appointment.dto';
import PatientModel from '../models/patient.model';
import DoctorModel from '../models/doctor.model';
import AppointmentModel from '../models/appointment.model';
export class PostDataService {
  private stringsToObject(stringArray: string[], handler: any) {
    const result: StringsToObjectInterface = {
      successful: [],
      successfulObjects: [],
      wrongFormat: [],
    };
    if (Array.isArray(stringArray)) {
      stringArray.forEach((item: string) => {
        try {
          result.successfulObjects.push(new handler(item));
          result.successful.push(item);
        } catch (error) {
          result.wrongFormat.push(item);
        }
      });
    }
    return result;
  }

  private async addToDatabase(data: StringsToObjectInterface, model: any) {
    try {
      await model.insertMany(data.successfulObjects, { ordered: false });
      return { ...data, duplicates: [], successful: data.successful, successfulObjects: undefined };
    } catch (error: any) {
      console.log(error.writeErrors);

      const duplicates = error.writeErrors.map((err: any) => data.successful[err.index]);
      const successful = data.successful.filter((item: string) => !duplicates.includes(item));
      return { ...data, duplicates, successful, successfulObjects: undefined };
    }
    //    console.log(res);
  }
  public async addData(body: AddDataInterface) {
    const [patients, doctors, appointments] = [
      this.stringsToObject(body.patients, PersonDto),
      this.stringsToObject(body.doctors, PersonDto),
      this.stringsToObject(body.appointments, AppointmentDto),
    ];
    const [savedPatients, savedDoctors, savedAppointments] = await Promise.all([
      this.addToDatabase(patients, PatientModel),
      this.addToDatabase(doctors, DoctorModel),
      this.addToDatabase(appointments, AppointmentModel),
    ]);
    return { savedPatients, savedDoctors, savedAppointments };
  }

  public async updateAppointments(data: any) {
    const promises = [];
    for (let i = 0; i < data.length; i++) {
      promises.push(AppointmentModel.findByIdAndUpdate(data[i]._id, { time: data[i].time }));
    }
    await Promise.all(promises);
  }
}
