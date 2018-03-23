# zoffset

The purpose of this program is to read NC code,
and modify the Z Values of of every tool move by transposing
linearly to account for a changed Z zero location.

The program takes a part length input and subtracts that length
from every Z value, to account for moving the 'zero' of Z by the length
of the part from the left side to the right side of that part.

## Requirements
Node.js
readline-sync

## Exceptions

This program does not change Z positions of 20 or 30, as these are not considered
machining commands, but homing commands. 

This program ignores anything within () parentheses.

This program specifically ignores VPVLZ and VPVNZ

This program does not read the first line of the input file

When the program sees a T0555 tool change, it will skip the next line that has non CRLF characters (Blank lines won't be counted)

This program will still function correctly if it sees Z value numbers followed by (), or [a-zA-Z] characters without a space in between
