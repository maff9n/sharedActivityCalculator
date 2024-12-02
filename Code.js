function overview_header() {
  // Get the spreadsheet and the specific sheet named "Evaluation"
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Evaluation");
  
  // Check if the sheet exists
  if (!sheet) {
    Logger.log("Log 0003");
    Logger.log("Sheet 'Evaluation' not found.");
    return;  // Exit if the sheet doesn't exist
  }
  
  var cell = sheet.getRange("A1");

  // Check if A1 is empty

    // Merge cells A1, B1, C1, D1
    sheet.getRange("A1:D1").merge();

    // Insert the text "hi"
    cell.setValue("The overview below is solely based on the contents of sheet \"Events\" and \"Participants\".");
    cell.setBackground("#B7B7B7");  // Grey color in hex

    // Automatically resize the row height to fit the content
    sheet.autoResizeRows(1, 1);
  
}

function getMatrix(){
  const participantsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Participants");
  const range = participantsSheet.getRange(2, 1, participantsSheet.getLastRow() - 1, 1); // From A2 to the last row
  
  // Get the values in that range
  const values = range.getValues();
  
  // Flatten the 2D array into a 1D array
  let array = values.map(row => row[0]);
  array = array.map(payer => {
    let body = { name: payer };
    const others = array.filter(other => other !== payer);
    
    others.forEach( other => {
      body[other] = 0;
    })
    return body;
    });
   
  
  // Log the array to the console (for debugging purposes)
  Logger.log("Log 0007")
  Logger.log(array);
  return array;
}

function getEvents(){
  const eventsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Events");
  const lastRow = eventsSheet.getLastRow();
  
  // Erstelle eine Range ab der zweiten Zeile, die die ersten drei Spalten umfasst
  const range = eventsSheet.getRange(2, 2, lastRow - 1, 3);  // Startet in Zeile 2, Spalte 1 (A), geht bis zur letzten Zeile und umfasst 3 Spalten
  // const range = eventsSheet.getRange(2, 2, 10, 3);  // Startet in Zeile 2, Spalte 1 (A), geht bis zur letzten Zeile und umfasst 3 Spalten
  
  // Beispiel: Logge den Wert der Range (kann auch in anderen Operationen verwendet werden)
  const values = range.getValues();
  Logger.log("Log 0002");
  Logger.log(values);
  return values;

}

function run(matrix, payer, amount, people){
  Logger.log("start run\npayer is " + payer + "\namount is " + amount + "\npeople are " + people);
  // app := amount per person
  people = people.split(', ').map(item => item.trim());
  let app = amount/people.length;
  app = Math.round(app * 100)/100;
  Logger.log("Calculation for app is " + app);

  let app2 = amount/people.length; 
  app2 = Math.round(app * 100)/100;
  Logger.log("Calculation for app2 is " + app2);

  const others = people.filter(other => other !== payer);

  return matrix.map( obj => {
    if( obj.name == payer ){
      others.forEach(beneficiarie => {
        obj[beneficiarie] = obj[beneficiarie] + app;
        obj[beneficiarie] = Math.round(obj[beneficiarie] * 100) / 100;
      })
    }

    if( others.includes(obj.name) ){
      obj[payer] = obj[payer] - app;
      obj[payer] = Math.round(obj[payer] * 100) / 100;
    }
    return obj;
  });
}

function startCalculation() { 
  var eventsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Events");
  var monitoredColumns = [2, 3, 4];

  overview_header();
  let matrix = getMatrix();
  const events = getEvents();
  
  let n = 0
  events.forEach( event => {
    Logger.log("Start Run #" + n);
    Logger.log(matrix);
    matrix = run(matrix, event[1], event[0], event[2]);
    Logger.log("End Run #" + n);
    n++;
    Logger.log(matrix);
  })

  const output = [];
  
  matrix.forEach( obj => {
    const name = obj.name;
    delete obj.name;

    for (const relation in obj) {
      if ( obj[relation] > 0){
        output.push([name, "is getting from", relation, obj[relation]]);
      } else if ( obj[relation] < 0) {
        output.push([name, "owes", relation, Math.abs(obj[relation])]);
      } else {
        output.push([name, "and", relation, "are on equal terms"]);
      }    
    }; 
  });

  Logger.log("Output would be the following...");
  Logger.log(output);

  var evaluationSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Evaluation");
  evaluationSheet.getRange(2, 1, output.length, output[0].length).setValues(output);

}