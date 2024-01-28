const JAZÜZ_MAX_DIFF = 209;
const JAZÜZ_NETTO = 2036;
const JAZÜZ_MINIMUM = 1827;

class TimeCalculator {
  constructor() {
    this.leistungVorjahr = "0:00";
    this.jazIst = "0:00";
    this.verringerung = "0:00";
    this.jazUeberzeitStand = "0:00";
    this.datumCheck = false;
    this.result = "00:00";
    this.calculate = this.calculate;
    this.convertToDecimal = this.convertToDecimal;
    this.convertToTime = this.convertToTime;
    this.calcJAZÜZDuringYear = this.calcJAZÜZDuringYear;
    this.calcJAZÜZEndYear = this.calcJAZÜZEndYear;
    this.limitNumber = this.limitNumber;
  }

  convertToDecimal(time) {
    const sign = time.startsWith("-") ? -1 : 1;
    const [hours, minutes] = time.replace("-", "").split(/[:.,]/);
    const decimalHours = parseInt(hours, 10);
    const decimalMinutes = minutes ? parseInt(minutes, 10) / 60 : 0;
    return sign * (decimalHours + decimalMinutes);
  }

  convertToTime(decimal) {
    const sign = decimal < 0 ? "-" : "";
    const absDecimal = Math.abs(decimal);
    const hours = Math.floor(absDecimal);
    const decimalPart = absDecimal - hours;
    const mins = Math.round(decimalPart * 60);

    return `${sign}${hours}:${mins < 10 ? "0" : ""}${mins}`;
  }

  calcJAZÜZDuringYear() {
    const mlVjMin = this.convertToDecimal(this.leistungVorjahr);
    const JAZISTMin = this.convertToDecimal(this.jazIst);
    const offsetMin = this.convertToDecimal(this.verringerung);
    const maxMehrleistung = -JAZÜZ_MAX_DIFF - offsetMin;
    const bereinigteMehrleistung = Math.min(
      0,
      Math.max(mlVjMin, maxMehrleistung)
    );
    return this.convertToTime(bereinigteMehrleistung + JAZISTMin);
  }

  limitNumber(x) {
    return Math.min(Math.max(x, JAZÜZ_MINIMUM), JAZÜZ_NETTO);
  }

  calcJAZÜZEndYear() {
    const ISO = -this.convertToDecimal(this.leistungVorjahr);
    const ISO_Bearbeitet = -this.convertToDecimal(this.verringerung);
    const IST = -this.convertToDecimal(this.jazIst);
    const ÜZ = this.convertToDecimal(this.jazUeberzeitStand);

    const NEW_ÜZ = JAZÜZ_NETTO - ÜZ;
    console.log("New ÜZ", NEW_ÜZ);

    const NEW_HIGH_ÜZ =
      NEW_ÜZ + IST + Math.min(ISO + ISO_Bearbeitet, JAZÜZ_MAX_DIFF);
    console.log("New High ÜZ", NEW_HIGH_ÜZ);
    const LIMIT_HIGH_ÜZ = this.limitNumber(NEW_HIGH_ÜZ);
    console.log("Limit High ÜZ", LIMIT_HIGH_ÜZ);

    const res = -Math.max(0, LIMIT_HIGH_ÜZ - Math.max(JAZÜZ_MINIMUM, NEW_ÜZ));
    return this.convertToTime(res);
  }

  calculate() {
    let result = this.datumCheck
      ? this.calcJAZÜZEndYear()
      : this.calcJAZÜZDuringYear();
    this.result = result === "NaN:NaN" ? "" : result;
  }
}

export default function calc() {
  return new TimeCalculator();
}
