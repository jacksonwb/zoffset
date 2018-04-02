//This program runs the fs module, readline-sync, and mathjs
var fs = require('fs');
var path = require('path');
var readlineSync = require('readline-sync');
var math = require('mathjs');

//This function handles pesky input quotations and properly delineated backslashes
function pathCorrect (filepath) {
	pathArray = filepath.split(path.sep);
	var correctedPath = path.normalize(pathArray.join('\\\\'));
	correctedPath = correctedPath.replace(/\"/g,'');
	return correctedPath;
}

//User input section
var filepath = readlineSync.question('Enter full path to input file or press enter for info: ');
var correctedPath = pathCorrect(filepath);
if (filepath === '') {                                                 //Show help on blank input
	console.log('');
	console.log('zoffset');
	console.log('Written by Jackson Beall');
	console.log('The purpose of this program is to read NC code, and modify the Z Values of every tool move to effectively move the Z zero location.');
	console.log("The program takes a part length input and subtracts that length from every Z value, to account for moving the 'zero' of Z by the length of the part from the left side to the right side of that part.");
	console.log('');
	console.log('Exceptions');
	console.log('This program does not change Z positions of 20 or 30, as these are not considered machining commands, but homing commands.');
	console.log('This program ignores anything within () parentheses.');
	console.log('This program specifically ignores VPVLZ and VPVNZ');
	console.log('This program does not read the first line of the input file');
	console.log("When the program sees a T0555 tool change, it will skip the next line that has non CRLF characters (blank lines won't be counted)");
	console.log('This program will still function correctly if it sees Z value numbers followed by (), or [a-zA-Z] characters without a space in between');
	console.log('');
	readlineSync.question('Press enter to exit');
	return;
}

console.log('Input path is: ' + correctedPath);

//Request Overall Length and warn if approaching 20
var partLength = Number(readlineSync.question('Enter the part length: '));
console.log('Part length to be used: ' + partLength);
if (partLength > 18) {
	console.log('Warning: This program is assuming homing commands of 20 or 30. All Z values of 20 or 30 will be ignored. Ensure that there are no valid machining moves of 20 or 30 in the input file.')
}

//Request output path. Default value will split at '.' and append -zoffset. 
pathArray = filepath.split('.');
defaultWritePath = pathArray[0] + '-zoffset.' + pathArray[1];
var writepath = pathCorrect(readlineSync.question("Enter full path to output file, or press enter to append '-zoffset' to filename: ", {
	defaultInput: defaultWritePath
}));
console.log('Using path: ' + writepath);

//read a text file syncronously into the data variable
try {
	var data = fs.readFileSync(correctedPath, 'utf8');
	//console.log(data);
} catch(e) {
	console.log('Error:', e.stack);
}

//split large string into an Array at CR line characters
let workingArray = data.split("\r");
let newArray = workingArray;
//console.log(workingArray);

//Floating Point Math Error Handling Boilerplate
function countDecimals(num) {
    if(Math.floor(num) === num) return 0;
    return num.toString().split(".")[1].length || 0; 
}

let errorCount = 0;
let floatErrors = [];
let i;

//Processing Logic 
//Set Match String to find Parentheses expressions and Z Values
//Parentheses expressions are returned by the replacer unaltered, 
//numbers following valid Z values are captured
//Current match criteria - Match a Z that is not followed by an = sign
//up to the next space,new line, or string end

const matchString = /\(.*\)|VPVLZ|VNVLZ|Z(.*?)(?=$|\s|[A-Za-z]|\()/g;

//Replacer Function - Skips () statements, Finds Z values, converst to num, offsets, converts back to string
function zOffset (match, numberPart) {
	//console.log(match);
	//console.log('Number part is: ' + numberPart);
	if (typeof numberPart == 'undefined'){
		return match;
	} else {
		let zValue = Number(numberPart);
		//console.log(zValue);

		if (zValue === 20 || zValue === 30) {
			return match;
		}
		//Add zValue Offset - use math.format to eliminate floating point errors, then convert back to number
		zValue = zValue - partLength;
		zValue = Number(math.format(zValue, {precision: 8}));
		
		//Check for long decimal floating point errors
		if (countDecimals(zValue) > 4) {
			errorCount += 1;
			floatErrors.push((i+1));
		}

		//If the number is an integer, ensure a decimal is included in the string conversion
		if (Number.isInteger(zValue)) {
			var newString = 'Z' + zValue.toFixed(1); //Preceding space is added back into the string
		} else {
			var newString = 'Z' + zValue.toString();
		}
		
		return newString;
	}
	
}

const skipString = /T0555/g;
let skipFlag = false;

//Moves through entire document array, skipping the first line
//Note - iterator i is declared above to enable float math error handler to function correctly
for (i = 1; i <= workingArray.length - 1 ; i++) {
	console.log('Working array is: ' + workingArray[i]);
	if (skipString.test(workingArray[i])) {					//test for T0555. If present set skip flag. Advance line.
		skipFlag = true;
		console.log('Detected T0555');
	} else {
		if (skipFlag) {										//test for contents. If present remove flag.  
			if (/./.test(workingArray[i])) {				//Advance line, without correcting any Z's here.
				skipFlag = false;
				console.log('T0555 Skip Flag set. Skipping line');
			}
		} else {
			newArray[i] = workingArray[i].replace(matchString, zOffset);  //If no T0555 or skip flag, correct Z's
			console.log('New array is: ' + newArray[i]);
		}	
	}
}

//recombine the array into a new string
let newData = workingArray.join("\r"); 
//console.log(newData);

//outpute newData to a text file
//Throw errors and float error messages
fs.writeFile(writepath, newData, 'utf-8', (err) => {
	if (err) throw err;
	console.log('File has been saved!');
	if (errorCount > 0) {
		console.log('');
		console.log('Warning! - Errors detected on lines: ' + floatErrors.join(', '));
		readlineSync.question('Press enter to exit');
		return;
	}
});

