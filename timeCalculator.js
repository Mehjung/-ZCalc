class TimeCalculator {
  constructor() {
    this.JAZÜZ_MAX_DIFF = -209;

    this.leistungVorjahr = "0:00";
    this.jazIst = "0:00";
    this.verringerung = "0:00";
    this.jazUeberzeitStand = "0:00";
    this.datumCheck = false;
    this.result = "00:00";
    this.calculate = this.calculate;
    this.convertToDecimal = this.convertToDecimal;
    this.convertToTime = this.convertToTime;
    this.calcÜzDuringYear = this.calcÜzDuringYear;
    this.calcAtTheEndOfTheYear = this.calcAtTheEndOfTheYear;
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

  calcÜzDuringYear(ÜzOldIncreased, ÜzNewIncrease, ISTIncrease) {
    let state = "Start";
    let result = 0;

    // Zustandsobjekt mit Zuständen als Schlüssel und Aktionen als Werte
    const actions = {
      Start: () => "ConvertToDecimal",
      ConvertToDecimal: () => {
        // Konvertiere alle Eingaben zu Dezimalwerten
        ÜzOldIncreased = this.convertToDecimal(ÜzOldIncreased);
        ÜzNewIncrease = this.convertToDecimal(ÜzNewIncrease);
        ISTIncrease = this.convertToDecimal(ISTIncrease);
        return "Calc"; // Gehe zum nächsten Schritt
      },
      Calc: () => {
        result =
          Math.max(ÜzNewIncrease, this.JAZÜZ_MAX_DIFF - ÜzOldIncreased) +
          ISTIncrease;
        return "End";
      },
      End: () => {
        return "Done"; // Beende die Schleife
      },
    };

    // Schleife durch die Zustände basierend auf den Aktionen
    while (state !== "Done") {
      const action = actions[state];
      if (action) {
        state = action();
      } else {
        console.error("Undefinierter Zustand: " + state);
        break;
      }
    }

    return this.convertToTime(result);
  }

  calcAtTheEndOfTheYear(ÜzOldIncreased, ÜzNewIncrease, ISTIncrease, sum) {
    let state = "Start";
    let result = 0;

    // Zustandsobjekt mit Zuständen als Schlüssel und Aktionen als Werte
    const actions = {
      Start: () => "ConvertToDecimal",
      ConvertToDecimal: () => {
        // Konvertiere alle Eingaben zu Dezimalwerten
        ÜzOldIncreased = this.convertToDecimal(ÜzOldIncreased);
        ÜzNewIncrease = this.convertToDecimal(ÜzNewIncrease);
        ISTIncrease = this.convertToDecimal(ISTIncrease);
        sum = this.convertToDecimal(sum);
        return "Calc";
      },
      Calc: () => {
        result =
          Math.max(ÜzNewIncrease, this.JAZÜZ_MAX_DIFF - ÜzOldIncreased) +
          ISTIncrease;
        return "CheckForISTDecrease";
      },
      CheckForISTDecrease: () => {
        return sum + ISTIncrease <= 0 ? "End" : "Overflow";
      },

      Overflow: () => {
        const oldBorder = Math.max(this.JAZÜZ_MAX_DIFF, ÜzNewIncrease - sum);
        const newBorder = Math.max(this.JAZÜZ_MAX_DIFF, -sum - ISTIncrease);
        result = oldBorder - newBorder;
        return "End";
      },
      End: () => "Done",
    };

    // Schleife durch die Zustände basierend auf den Aktionen
    while (state !== "Done") {
      const action = actions[state];
      if (action) {
        state = action();
      } else {
        console.error("Undefinierter Zustand: " + state);
        break;
      }
    }

    return this.convertToTime(result);
  }

  calculate() {
    let result = this.datumCheck
      ? this.calcAtTheEndOfTheYear(
          this.verringerung,
          this.leistungVorjahr,
          this.jazIst,
          this.jazUeberzeitStand
        )
      : this.calcÜzDuringYear(
          this.verringerung,
          this.leistungVorjahr,
          this.jazIst
        );
    this.result = result === "NaN:NaN" ? "" : result;
  }
}

export default function calc() {
  return new TimeCalculator();
}
