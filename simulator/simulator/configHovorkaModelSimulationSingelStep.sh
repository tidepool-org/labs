#
#The MIT License (MIT)
#
#Copyright (c) 2013 Diacon Group
#
#Permission is hereby granted, free of charge, to any person obtaining a copy
#of this software and associated documentation files (the "Software"), to deal
#in the Software without restriction, including without limitation the rights
#to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#copies of the Software, and to permit persons to whom the Software is
#furnished to do so, subject to the following conditions:
#
#The above copyright notice and this permission notice shall be included in
#all copies or substantial portions of the Software.
#
#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
#THE SOFTWARE.
#
# compile
gcc -std=c99 -O3 -Wall -c TestHovorkaModelSimulationSingelStep.c
gcc -std=c99 -O3 -Wall -c HovorkaModelSimulationStep.c
gcc -std=c99 -O3 -Wall -c HovorkaModelDefaultParameters.c
gcc -std=c99 -O3 -Wall -c printHovorkaModelParameters.c
gcc -std=c99 -O3 -Wall -c HovorkaModel.c
gcc -std=c99 -O3 -Wall -c HovorkaModelSimulation.c
gcc -std=c99 -O3 -Wall -c ExplicitEulerFixedStepSizeODESolver.c

# link
gcc -std=c99 -O3 -Wall -o TestHovorkaModelSimulationSingelStep \
		TestHovorkaModelSimulationSingelStep.o \
		HovorkaModelSimulationStep.o \
		HovorkaModelDefaultParameters.o \
		printHovorkaModelParameters.o \
		HovorkaModel.o \
		HovorkaModelSimulation.o \
		ExplicitEulerFixedStepSizeODESolver.o

# Run
# -u -d -x[10]
# ./TestHovorkaModelSimulationSingelStep -u 6.680000 -d 0.000000 -x 12736.839721 708.789439 367.400000 367.400000 79.530690 23.937331 5.762595 0.029504 0.004725 0.299655

#./TestHovorkaModelSimulationSingelStep -u 6.68 6.68 6.68 160.68 160.68 160.68 160.68 6.68 6.68 6.68 6.68 6.68 6.68 6.68 6.68 6.68 -d 0.1 0.1 0.1 10.2 10.2 10.2 10.2 0.1 0.1 0.1 0.1 0.1 0.1 0.1 0.1 0.1 -x 0.0 0.0 367.4 367.4 55.9483 23.3399 5.7626 0.0295 0.0047 0.2997
#u=6.68&d=0&x=12736.839721,708.789439,367.4,367.4,79.53069,23.93733,5.762595,0.029504,0.004725,0.299655