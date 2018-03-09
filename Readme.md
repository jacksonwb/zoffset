#zoffset

The purpose of this program is to read CAM machine instructions,
and modify the Z Values of of every tool move by transposing
linearly to account for a changed Z zero location.

The program takes a part length input and subtracts that length
from every Z value, to account for moving the 'zero' of Z by the length
of the part from the left side to the right side of that part.

##Exceptions to be added

This program will not change Z positions of 20 or 30, as these are not
machining commands, but clearance commands. 

The program will also not change Z positions with T0555 specificication
on the preceding line as.

This Program will ignore words with Z if they are within () Parentheses.