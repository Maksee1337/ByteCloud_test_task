import validatorJs from 'validator';

export const validator = {
  id: (id: string) => /^\d+$/.test(id),
  hours: (hours: string) => {
    if (/^\d+-\d+$/.test(hours)) {
      const [start, end] = hours.split('-').map((h) => parseInt(h));
      if (start < end && start >= 0 && start <= 24 && end >= 0 && end <= 24) return true;
    }
    return false;
  },
  time: (time: string) => {
    if (/^\d+$/.test(time)) {
      const t = parseInt(time);
      if (t >= 0 && t <= 23) return true;
    }
    return false;
  },
  name: (name: string) => /^[A-Za-z]+(?: [A-Za-z]+)?$/.test(name),
  date: (date: string) => validatorJs.isDate(date, { format: 'DD.MM.YYYY', strictMode: true, delimiters: ['.'] }),
};
