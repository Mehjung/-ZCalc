const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:5500/-ZCalc/index.html");
  await page.waitForFunction(
    () => document.querySelector("#leistungVorjahr").value !== ""
  );

  const inputs = [
    "#verringerung",
    "#leistungVorjahr",
    "#jazIst",
    "#jazUeberzeitStand",
  ];
  const checkboxSelector = "#datumCheck";

  const testCasesWithoutCheckbox = [
    { params: ["00:00", "00:00", "-100:00"], expected: "-100:00" },
    { params: ["00:00", "-100:00", "00:00"], expected: "-100:00" },
    { params: ["-100:00", "-100:00", "00:00"], expected: "-100:00" },
    { params: ["-100:00", "-300:00", "00:00"], expected: "-109:00" },
    { params: ["-100:00", "-300:00", "-200:00"], expected: "-309:00" },
    { params: ["-209:00", "-300:00", "00:00"], expected: "0:00" },
    { params: ["-9:00", "-300:00", "-200:00"], expected: "-400:00" },
    { params: ["00:00", "00:00", "-600:00"], expected: "-600:00" },
  ];

  const testCasesWithCheckbox = [
    { params: ["00:00", "00:00", "-100:00", "100:00"], expected: "-100:00" },
    { params: ["00:00", "-50:00", "00:00", "00:00"], expected: "-50:00" },
    { params: ["00:00", "00:00", "-150:00", "350:00"], expected: "-9:00" },
    { params: ["00:00", "-100:00", "-300:00", "400:00"], expected: "-109:00" },
    { params: ["00:00", "-200:00", "-50:00", "100:00"], expected: "-159:00" },
    { params: ["00:00", "-50:00", "-10:00", "100:00"], expected: "-60:00" },
    { params: ["-209:00", "-50:00", "00:00", "00:00"], expected: "0:00" },
    { params: ["-100:00", "-50:00", "00:00", "50:00"], expected: "-50:00" },
    { params: ["-100:00", "-250:00", "00:00", "109:00"], expected: "-100:00" },
    {
      params: ["-100:00", "-250:00", "-100:00", "209:00"],
      expected: "-100:00",
    },
    { params: ["-100:00", "-250:00", "-50:00", "50:00"], expected: "-159:00" },
  ];

  async function runTestCases(testCases) {
    for (let testCase of testCases) {
      for (let sel of inputs) {
        await page.evaluate((selector) => {
          document.querySelector(selector).value = "";
        }, sel);
      }

      const isChecked = await page.$eval(
        checkboxSelector,
        (checkbox) => checkbox.checked
      );

      const count = isChecked ? inputs.length : inputs.length - 1;

      for (let i = 0; i < count; i++) {
        await page.type(inputs[i], testCase.params[i], { delay: 20 });
      }

      // Hier den Code zum Auslösen der Berechnung hinzufügen, falls erforderlich

      const resultSelector = 'span.text-blue-600[x-text="result"]';
      await page.waitForSelector(resultSelector);
      const result = await page.$eval(resultSelector, (el) =>
        el.textContent.trim()
      );

      try {
        console.assert(
          result === testCase.expected,
          `Erwartet: ${
            testCase.expected
          }, erhalten: ${result} für die Eingaben: ${testCase.params.join(
            ", "
          )}`
        );
        console.log(
          `Test erfolgreich für die Eingaben: ${testCase.params.join(", ")}`
        );
      } catch (error) {
        console.error(`Test fehlgeschlagen: ${error.message}`);
      }
    }
  }

  // Testfälle ohne Checkbox durchführen
  await runTestCases(testCasesWithoutCheckbox);

  // Checkbox aktivieren
  await page.click(checkboxSelector);

  // Testfälle mit aktivierter Checkbox durchführen
  await runTestCases(testCasesWithCheckbox);

  await browser.close();
})();
