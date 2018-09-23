const encodeCp1251 = string => {
  let output = '', charCode, ExitValue, char;
  for (let i = 0, len = string.length; i < len; i++) {
    char = string.charAt(i);
    charCode = char.charCodeAt(0);
    let Acode = charCode;
    if (charCode > 1039 && charCode < 1104) {
      Acode -= 848;
      ExitValue = '%' + Acode.toString(16);
    }
    else if (charCode === 1025) {
      Acode = 168;
      ExitValue = '%' + Acode.toString(16);
    }
    else if (charCode === 1105) {
      Acode = 184;
      ExitValue = '%' + Acode.toString(16);
    }
    else if (charCode === 32) {
      Acode = 32;
      ExitValue = '%' + Acode.toString(16);
    }
    else if (charCode === 10) {
      ExitValue = '%0A';
    }
    else {
      ExitValue = char;
    }
    output = output + ExitValue;
  }
  return output;
};

export default encodeCp1251;