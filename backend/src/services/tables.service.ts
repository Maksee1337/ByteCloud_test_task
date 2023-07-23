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
  private tables: any = undefined;
  public async calculateAppointments() {
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

    let appointments: any[] = await AppointmentModel.find();
    if (!appointments.length) {
      this.tables = { leftTable: [], rightTable: [] };
      return;
    }
    appointments = appointments.filter((el) => {
      return doctors[el.doctorId] && patients[el.patientId];
    });
    appointments = appointments.map((el) => {
      const json: any = el.toJSON();
      const commonHours = this.getCommonElements(patients[json.patientId].hours, doctors[json.doctorId].hours);

      return {
        ...json,
        commonHours,
      };
    });
    const leftTable = this.getLeftTable(patients, doctors, appointments);

    let rightTable: any; //this.getRightTable(patients, doctors, appointments);
    let max = { greens: 0, blues: 0 };
    let betterResult: any = [];

    appointments.forEach((appointment) => {
      this.changeAppointmentTime(appointment, appointment.commonHours[0]);
    });
    const findBetterResult = () => {
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
      if (
        greens + blues > max.greens + max.blues ||
        (greens + blues === max.greens + max.blues && greens > max.greens)
      ) {
        max.greens = greens;
        max.blues = blues;
        betterResult = [...rightTable];
      }
    };
    for (let i = 0; i < 10000; i++) {
      findBetterResult();
    }

    this.tables = { leftTable, rightTable: betterResult };
  }
  public async getTablesData() {
    if (!this.tables) {
      await this.calculateAppointments();
    }
    return this.tables;
  }
  private compareTables(original: any[], newTable: any[]) {
    return newTable.map((element, index) => {
      let color = 'red';
      if (element.color !== 'red') {
        color = element.time === original[index].time ? element.color : 'blue';
      }
      return color === 'red' ? { ...original[index], color } : { ...element, color };
    });
  }
  private getRightTable(_patients: any, _doctors: any, _appointments: any) {
    return this.getLeftTable(_patients, _doctors, _appointments, ['green', 'red', 'red', 'green']);
  }

  private getLeftTable(
    _patients: any,
    _doctors: any,
    _appointments: any,
    colors: string[] = ['green', 'yellow', 'red', 'yellow'],
  ) {
    const patients = deepCopy(_patients);
    const doctors = deepCopy(_doctors);
    const appointments = _appointments.map((e: any) => ({ ...e, color: undefined }));
    appointments.forEach((appointment: any) => {
      appointment.color = colors[2];
      if (
        appointment.commonHours &&
        appointment.time &&
        appointment.commonHours.findIndex((el: any) => el === appointment.time) === -1
      ) {
        return;
      }
      if (doctors[appointment.doctorId] && patients[appointment.patientId] && appointment.commonHours.length) {
        appointment.color = colors[0];
        if (!doctors[appointment.doctorId].appointments[appointment.time]) {
          doctors[appointment.doctorId].appointments[appointment.time] = [appointment];
        } else {
          doctors[appointment.doctorId].appointments[appointment.time].forEach((app: any) => {
            app.color = colors[1];
          });
          doctors[appointment.doctorId].appointments[appointment.time].push(appointment);
          appointment.color = colors[3];
        }

        if (!patients[appointment.patientId].appointments[appointment.time]) {
          patients[appointment.patientId].appointments[appointment.time] = [appointment];
        } else {
          patients[appointment.patientId].appointments[appointment.time].forEach((app: any) => {
            app.color = colors[1];
          });
          patients[appointment.patientId].appointments[appointment.time].push(appointment);
          appointment.color = colors[3];
        }
      }
    });

    return appointments.map((appointment: any) => {
      return {
        _id: appointment._id,
        patientInfo: {
          ...patients[appointment.patientId],
          appointments: undefined,
        },
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        time: appointment.time,
        color: appointment.time ? appointment.color : 'red',
      };
    });
  }
  private changeAppointmentTime(appointment: any, newTime: number) {
    appointment.time = newTime;
  }
  private getCommonElements(array1: number[], array2: number[]) {
    return array1.filter((value) => array2.includes(value));
  }

  public async updateTables(data: any) {
    this.tables.rightTable.forEach((el: any, index: number) => {
      const rightTableElement = el;
      const leftTableElement = this.tables.leftTable[index];
      if (rightTableElement.color === 'red') {
        leftTableElement.color = 'red';
      } else {
        leftTableElement.color = 'green';
        rightTableElement.color = 'green';
        leftTableElement.time = rightTableElement.time;
      }
    });
  }
}
