//This program runs the fs module
var fs = require('fs');

//read a text file syncronously into the data variable
try {
	var data = fs.readFileSync('LU15 Z TEST.txt', 'utf8');
	//console.log(data);
} catch(e) {
	console.log('Error:', e.stack);
}

//split large string into an Array at CR line characters
let workingArray = data.split("\r");
let newArray = workingArray;
//console.log(workingArray);

//Processing Logic 
//Set Match String to find Z Values
//Current match criteria - Match a Z number that is preceded by a space, 
//up to the next space,new line, or string end

let matchString = /\sZ(.*?)(?=$|\s)/g;

//Replacer Function - Finds Z values, converst to num, offsets, converts back to string
function zOffset (match,numberPart) {
	//console.log(match);
	//console.log('Number part is: ' + numberPart);

	let zValue = Number(numberPart);
	//console.log(zValue);

	//Add zValue Offset - Multiply and divide by 10000 to eliminate floating point errors
	let zOffsetValue = 5;
	zValue = (zValue*10000 + zOffsetValue*10000)/10000;
	//console.log(zValue);

	//If the number is an integer, ensure a decimal is included in the string conversion
	if (Number.isInteger(zValue)) {
		var newString = ' Z' + zValue.toFixed(1); //Preceding space is added back into the string
	} else {
		var newString = ' Z' + zValue.toString();
	}

	//console.log(newString);
	return newString;
}

for (let i = 0; i <= workingArray.length - 1 ; i++) {
	//console.log(i);
	console.log('Working array is: ' + workingArray[i]);
	newArray[i] = workingArray[i].replace(matchString, zOffset);
	console.log('New array is: ' + newArray[i]);	
}

//recombine the array into a new string
let newData = workingArray.join("\r"); 
//console.log(newData);

//outpute newData to a text file
fs.writeFile('newtext.txt', newData, 'utf-8', (err) => {
	if (err) throw err;
	console.log('File has been saved!');
});