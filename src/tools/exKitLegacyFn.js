const size_check = /[^0-9.,кбмгтkmgtb]/g;
const size_kb = /кб|kb/;
const size_mb = /мб|mb/;
const size_gb = /гб|gb/;
const size_tb = /тб|tb/;
const today_now = /сейчас|now/;
const today_today = /сегодня|today/;
const today_yest = /вчера|yesterday/;
const ex_num = /[^0-9]/g;
const spaces = /\s+/g;
const timeFormat4 = /([0-9]{1,2}d)?[^0-9]*([0-9]{1,2}h)?[^0-9]*([0-9]{1,2}m)?[^0-9]*([0-9]{1,2}s)?/;

const sizeFormat = function (s) {
  const size = s.toLowerCase().replace(size_check, '').replace(',', '.');
  let t = size.replace(size_kb, '');
  const size_len = size.length;
  if (t.length !== size_len) {
    t = parseFloat(t);
    return Math.round(t * 1024);
  }
  t = size.replace(size_mb, '');
  if (t.length !== size_len) {
    t = parseFloat(t);
    return Math.round(t * 1024 * 1024);
  }
  t = size.replace(size_gb, '');
  if (t.length !== size_len) {
    t = parseFloat(t);
    return Math.round(t * 1024 * 1024 * 1024);
  }
  t = size.replace(size_tb, '');
  if (t.length !== size_len) {
    t = parseFloat(t);
    return Math.round(t * 1024 * 1024 * 1024 * 1024);
  }
  return 0;
};

const monthReplace = function (t) {
  return t.toLowerCase().replace('янв', '1').replace('фев', '2').replace('мар', '3')
    .replace('апр', '4').replace('мая', '5').replace('май', '5').replace('июн', '6')
    .replace('июл', '7').replace('авг', '8').replace('сен', '9')
    .replace('окт', '10').replace('ноя', '11').replace('дек', '12')
    .replace('jan', '1').replace('feb', '2').replace('mar', '3')
    .replace('apr', '4').replace('may', '5').replace('jun', '6')
    .replace('jul', '7').replace('aug', '8').replace('sep', '9')
    .replace('oct', '10').replace('nov', '11').replace('dec', '12');
};

const todayReplace = function (t, f) {
  f = parseInt(f);
  t = t.toLowerCase();
  const tt = new Date();
  if ((today_now).test(t)) {
    t = 'today ' + tt.getHours() + ':' + tt.getMinutes();
  }
  const tty = new Date((Math.round(tt.getTime() / 1000) - 24 * 60 * 60) * 1000);
  let today;
  let yesterday;
  if (f === 0) {
    today = tt.getFullYear() + ' ' + (tt.getMonth() + 1) + ' ' + tt.getDate() + ' ';
    yesterday = tty.getFullYear() + ' ' + (tty.getMonth() + 1) + ' ' + tty.getDate() + ' ';
  } else if (f === 3) {
    today = (tt.getMonth() + 1) + ' ' + tt.getDate() + ' ' + tt.getFullYear() + ' ';
    yesterday = (tty.getMonth() + 1) + ' ' + tty.getDate() + ' ' + tty.getFullYear() + ' ';
  } else {
    today = tt.getDate() + ' ' + (tt.getMonth() + 1) + ' ' + tt.getFullYear() + ' ';
    yesterday = tty.getDate() + ' ' + (tty.getMonth() + 1) + ' ' + tty.getFullYear() + ' ';
  }
  t = t.replace(today_today, today).replace(today_yest, yesterday);
  return t;
};

const dateFormat = function (f, t) {
  if (f === undefined) {
    return ['2013-04-31[[[ 07]:03]:27]', '31-04-2013[[[ 07]:03]:27]', 'n day ago', '04-31-2013[[[ 07]:03]:27]', '2d 1h 0m 0s ago'];
  }
  f = parseInt(f);
  if (f === 0) { // || f === '2013-04-31[[[ 07]:03]:27]') {
    const dd = t.replace(ex_num, ' ').replace(spaces, ' ').trim().split(' ');
    for (let i = 0; i < 6; i++) {
      if (dd[i] === undefined) {
        dd[i] = 0;
      } else {
        dd[i] = parseInt(dd[i]);
        if (isNaN(dd[i])) {
          if (i < 3) {
            return 0;
          } else {
            dd[i] = 0;
          }
        }
      }
    }
    if (dd[0] < 10) {
      dd[0] = '200' + dd[0];
    } else if (dd[0] < 100) {
      dd[0] = '20' + dd[0];
    }
    return Math.round((new Date(dd[0], dd[1] - 1, dd[2], dd[3], dd[4], dd[5])).getTime() / 1000);
  }
  if (f === 1) { //  || f === '31-04-2013[[[ 07]:03]:27]') {
    const dd = t.replace(ex_num, ' ').replace(spaces, ' ').trim().split(' ');
    for (let i = 0; i < 6; i++) {
      if (dd[i] === undefined) {
        dd[i] = 0;
      } else {
        dd[i] = parseInt(dd[i]);
        if (isNaN(dd[i])) {
          if (i < 3) {
            return 0;
          } else {
            dd[i] = 0;
          }
        }
      }
    }
    if (dd[2] < 10) {
      dd[2] = '200' + dd[2];
    } else if (dd[2] < 100) {
      dd[2] = '20' + dd[2];
    }
    return Math.round((new Date(dd[2], dd[1] - 1, dd[0], dd[3], dd[4], dd[5])).getTime() / 1000);
  }
  if (f === 2) { //  || f === 'n day ago') {
    const old = parseFloat(t.replace(ex_num, '')) * 24 * 60 * 60;
    return Math.round(Date.now() / 1000) - old;
  }
  if (f === 3) { //  || f === '04-31-2013[[[ 07]:03]:27]') {
    const dd = t.replace(ex_num, ' ').replace(spaces, ' ').trim().split(' ');
    for (let i = 0; i < 6; i++) {
      if (dd[i] === undefined) {
        dd[i] = 0;
      } else {
        dd[i] = parseInt(dd[i]);
        if (isNaN(dd[i])) {
          if (i < 3) {
            return 0;
          } else {
            dd[i] = 0;
          }
        }
      }
    }
    if (dd[2] < 10) {
      dd[2] = '200' + dd[2];
    } else if (dd[2] < 100) {
      dd[2] = '20' + dd[2];
    }
    return Math.round((new Date(dd[2], dd[0] - 1, dd[1], dd[3], dd[4], dd[5])).getTime() / 1000);
  }
  if (f === 4) { //  || f === '2d 1h 0m 0s ago') {
    const match = t.match(timeFormat4);
    if (match) {
      const d = parseInt(match[1]) || 0;
      const h = parseInt(match[2]) || 0;
      const m = parseInt(match[3]) || 0;
      const s = parseInt(match[4]) || 0;
      const time = d * 24 * 60 * 60 + h * 60 * 60 + m * 60 + s;
      if (time === 0) {
        return 0;
      }
      return parseInt(Date.now() / 1000) - time;
    }
    return 0;
  }
};

export {
  sizeFormat,
  monthReplace,
  todayReplace,
  dateFormat
};