const COLORS = {
  red: "#f5c4c4",
  orange: "#fddabc",
  yellow: "#fff4cc",
  green: "#cde5d2",
  blue: "#b4d5e5",
  indigo: "#d2c4e4",
};
// Todo: use COLORS to make participants in the evaluation overview more visually distinguishable

// the sheet "Participants" and the sheet "Events" are meant to capture user input by hand
// the sheet "Evaluation" gets its content solely from calculaten based on meantioned user input
const evaluationSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Evaluation");
const participantsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Participants");
const eventsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Events");

// returns all participant names in an array with unique values
// uniqueness is enforced by spreadsheet data validation functionality
function getParticipants(){
  const participantNames = participantsSheet
    .getRange(2, 1, participantsSheet.getLastRow() - 1, 1)
    .getValues()
    .flat();
  Logger.log("Participant names from the spreadsheet:\n" + participantNames);
  return participantNames;
}

// returns all events data in a two dimensional array
// each event consists of amount, payer, beneficiaries
function getEvents(){
  const events = eventsSheet
    .getRange(2, 2, eventsSheet.getLastRow() - 1, 3)
    .getValues();
  Logger.log("Event details from the spreadsheet:\n" + events);
  return events;
}

// return a matrix which is used to cope with all the data from the events and track who owns who and which amount 
// a matrix inside this script got the following structure:
//  [
//    { name:"name1", name2:amount, name3:amount, ...},
//    { name:"name2", name1:amount, name3:amount, ...},
//    ...
//  ]
function getMatrix(participantNames){
  const matrix = participantNames.map(payer => {
    let matrixElement = { name: payer };
    
    const others = participantNames.filter(other => other !== payer);
    others.forEach( other => {
      matrixElement[other] = 0;
    });
    return matrixElement;
    });
  Logger.log("Initial participant matrix:\n" + matrix);
  return matrix;
}

// loop with run() through all the events and fill the matrix with data while calculating everything
function run(matrix, payer, amount, beneficiaries){

  if(payer == null || payer == ""){
    Logger.log("Variable payer inside run() holds no applicable value");
    return matrix;
  }
    if(amount == null || amount == ""){
    Logger.log("Variable amount inside run() holds no applicable value");
    return matrix;
  }
    if(beneficiaries.length == 0){
    Logger.log("Variable beneficiaries inside run() holds no applicable value");
    return matrix;
  }


  Logger.log("The following details of one event are now added to the participant matrix:\npayer is " + payer + "\namount is " + amount + "\nbeneficiaries are " + beneficiaries);
  
  beneficiaries = beneficiaries.split(', ').map(item => item.trim());
  let app = amount/beneficiaries.length;
  app = Math.round(app * 100)/100;
  Logger.log("Calculation for app is " + app);

  const others = beneficiaries.filter(other => other !== payer);

  return matrix.map( obj => {
    if( obj.name == payer ){
      others.forEach(beneficiary => {
        obj[beneficiary] = obj[beneficiary] + app;
        obj[beneficiary] = Math.round(obj[beneficiary] * 100) / 100;
      })
    }

    if( others.includes(obj.name) ){
      obj[payer] = obj[payer] - app;
      obj[payer] = Math.round(obj[payer] * 100) / 100;
    }
    return obj;
  });
}

// write all usefull data from the matrix to a range in the Evaluation sheet 
function writeDataToEvaluationSheet(matrix){
  let output = [];
  
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

  evaluationSheet.getRange(2, 1, output.length, output[0].length).setValues(output);
}

// main
function calcEvaluation(){
  // collect user input from the sheet "Events" and the sheet "Participants"
  const events = getEvents();
  const participants = getParticipants();

  // create initial matrix. Filled with participant names and zeroes.
  let matrix = getMatrix(participants);
  
  // step by step use all events to derive the final matrix
  // for each event there is a so called "run" which adds the events details to the matrix
  let n = 0
  events.forEach( event => {
    Logger.log("Start Run #" + n);
    Logger.log(matrix);
    matrix = run(matrix, event[1], event[0], event[2]);
    n++;
  })

  // write calculation result to the "Evaluation" sheet
  writeDataToEvaluationSheet(matrix);
}

function onEdit(e) { 
  const triggerSheet = e.source.getActiveSheet();
  const triggerRange = e.range;
  
  const isTargetSheet = triggerSheet.getName() === eventsSheet.getName();
  const isTargetColumn = triggerRange.getColumn() >= 2 && triggerRange.getColumn() <= 4;

  // Check if an edit happened in sheet 'Events' and the edit occurred in columns B, C, or D
  // If so calculate a complete evaluation
  if (isTargetSheet && isTargetColumn) {
    calcEvaluation(); 
  }  
}