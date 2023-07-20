import PatientModel from '../models/patient.model';
import DoctorModel from '../models/doctor.model';
import AppointmentModel from '../models/appointment.model';
import { AppointmentInterface } from '../interfaces/appointment.interface';
import { urlencoded } from 'express';

function deepCopy(obj: any) {
  if (typeof obj !== 'object' || obj === null) {
    return obj; // Return primitives directly
  }
  let copy: any;
  if (Array.isArray(obj)) {
    copy = obj.map(deepCopy); // Deep copy for arrays
  } else {
    copy = {};
    for (const key in obj) {
      copy[key] = deepCopy(obj[key]); // Deep copy for objects
    }
  }
  return copy;
}
export class TablesService {
  public async getTablesData() {
    const patients = (await PatientModel.find())
      .map((el) => el.toJSON())
      .reduce((obj: any, el: any) => {
        obj[el.id] = el;
        obj[el.id].appointments = {};
        return obj;
      }, {});
    const doctors = (await DoctorModel.find())
      .map((el) => el.toJSON())
      .reduce((obj: any, el: any) => {
        obj[el.id] = el;
        obj[el.id].appointments = {};
        return obj;
      }, {});
    const appointments = (await AppointmentModel.find()).map((el) => {
      const json: any = el.toJSON();
      return {
        ...json,
        // patient: patients[json.patientId],
        // doctor: doctors[json.doctorId],
        commonHours: this.getCommonElements(patients[json.patientId].hours, doctors[json.doctorId].hours),
      };
    });
    const leftTable = this.getLeftTable(patients, doctors, appointments);

    let rightTable: any; //this.getRightTable(patients, doctors, appointments);
    let max = { greens: 0, blues: 0 };
    let betterResult = {};
    for (let i = 0; i < 2000; i++) {
      const a = Math.floor(Math.random() * appointments.length);
      this.changeAppointmentTime(
        appointments[a],
        appointments[a].commonHours[Math.floor(Math.random() * appointments[a].commonHours.length)],
      );
      rightTable = this.compareTables(leftTable, this.getRightTable(patients, doctors, appointments));
      const { greens, blues } = rightTable.reduce(
        (sum: any, item: any) => {
          if (item.color === 'green') sum.greens++;
          if (item.color === 'blue') sum.blues++;

          return sum;
        },
        { greens: 0, blues: 0 },
      );
      // console.log(rightTable, sum);
      if (
        greens + blues > max.greens + max.blues ||
        (greens + blues === max.greens + max.blues && greens > max.greens)
      ) {
        max.greens = greens;
        max.blues = blues;
        betterResult = [...rightTable];
      }
    }

    return { leftTable, rightTable: betterResult };
  }
  private compareTables(original: any[], newTable: any[]) {
    return newTable.map((element, index) => {
      let color = 'red';
      if (element.color !== 'red') {
        color = element.time === original[index].time ? element.color : 'blue';
      }
      // console.log([element.color, original[index].color]);
      return color === 'red' ? { ...original[index], color } : { ...element, color };
    });
  }
  private getRightTable(_patients: any, _doctors: any, _appointments: any) {
    const patients = deepCopy(_patients);
    const doctors = deepCopy(_doctors);
    const appointments = _appointments.map((e: any) => ({ ...e, color: undefined }));
    appointments.map((appointment: any) => {
      appointment.color = 'red';
      if (doctors[appointment.doctorId] && patients[appointment.patientId] && appointment.commonHours.length) {
        appointment.color = 'green';
        if (!doctors[appointment.doctorId].appointments[appointment.time]) {
          doctors[appointment.doctorId].appointments[appointment.time] = [appointment];
        } else {
          doctors[appointment.doctorId].appointments[appointment.time].forEach((app: any) => {
            app.color = 'red';
          });
          appointment.color = 'green';
          doctors[appointment.doctorId].appointments[appointment.time].push(appointment);
        }
      }
    });

    return appointments.map((appointment: any) => {
      return {
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        time: appointment.time,
        color: appointment.color,
      };
    });
  }
  private getLeftTable(_patients: any, _doctors: any, _appointments: any) {
    const patients = deepCopy(_patients);
    const doctors = deepCopy(_doctors);
    const appointments = _appointments.map((e: any) => ({ ...e, color: undefined }));
    appointments.map((appointment: any) => {
      appointment.color = 'red';
      if (doctors[appointment.doctorId] && patients[appointment.patientId] && appointment.commonHours.length) {
        appointment.color = 'green';
        if (!doctors[appointment.doctorId].appointments[appointment.time]) {
          doctors[appointment.doctorId].appointments[appointment.time] = [appointment];
        } else {
          doctors[appointment.doctorId].appointments[appointment.time].forEach((app: any) => {
            app.color = 'yellow';
          });
          doctors[appointment.doctorId].appointments[appointment.time].push(appointment);
          appointment.color = 'yellow';
        }
      }
    });

    return appointments.map((appointment: any) => {
      return {
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        time: appointment.time,
        color: appointment.color,
      };
    });
  }
  private changeAppointmentTime(appointment: any, newTime: number) {
    appointment.time = newTime;
  }
  private getCommonElements(array1: number[], array2: number[]) {
    return array1.filter((value) => array2.includes(value));
  }
}
