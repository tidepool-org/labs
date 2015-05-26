/*
The MIT License (MIT)

Copyright (c) 2013 Diacon Group

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
//#define DEBUG 0

#include <stdio.h>
#include <time.h>
#include <stdlib.h>

#include "HovorkaModel.h"

int main(int argc, char *argv[])
{
	// Parse parameters -u [y] -d [y] -x [10] where [] is a space sepereated list of numbers
	int dIndex;
	int samples;

	for(int i = 1; i < argc; i++) {
		if(argv[i][1] == 'd') {
			dIndex = i;
			samples = dIndex - 2;
			break;
		}
	}

	double u[samples];// = atof(argv[2]);
	double d[samples];// = atof(argv[4]);
	double x0[10];

	// get u and d from argv
	for(int i = 0; i < samples; i++) {
		u[i] = atof(argv[2 + i]);
		d[i] = atof(argv[dIndex + 1 + i]);
		#ifdef DEBUG
		printf("its a u at index %i : %10.6f\n", i, u[i]);
		printf("its a d at index %i : %10.6f\n", i, d[i]);
		#endif
	}
	
	// get x from argv
	for(int i = 0; i < 10; i++) {
		x0[i] = atof(argv[dIndex + samples + 2 + i]);
		#ifdef DEBUG
		printf("its a x0 at index %i : %10.6f\n", i, x0[i]);
		#endif
	}

	// Build default parameters for BW 70 kg
	double BW = 70.0;
	HovorkaModelParameters_t par;

	HovorkaModelDefaultParameters(BW, &par);
	
	// Define steady state (for BW 70 kg)
	int nx = 10;
	double t=0;
	double uss = 6.68;
	double dss = 0.00;
	double xss[nx];
	double fss[nx];
	
	xss[0] = 0.0;
	xss[1] = 0.0;
	xss[2] = 367.4;
	xss[3] = 367.4;
	xss[4] = 55.9483;
	xss[5] = 23.3399;
	xss[6] = 5.7626;
	xss[7] = 0.0295;
	xss[8] = 0.0047;
	xss[9] = 0.2997;

	HovorkaModel(t, xss, &uss, &dss, &par, fss);

	// Simulation Step
	double t0 = 0.0;
	double t1 = 5.0;
	double dT = t1-t0;
	int Nsamples = 10;
	double G;
	double I;
	double x1[10];
	double work[10];
	double GG[samples];
	double II[samples];
	double uu;
	double dd;

	//Simulation of the Hovorka Model

	for(int i=0; i<samples; i++){
		uu = u[i];
		dd = d[i];
		HovorkaModelSimulationStep(
			t0, t1, Nsamples,
			x0, x1,
			&uu, &dd, &par,
			&G, &I,
			work);	

		t0 = t1;
		t1 = t1 + dT;
		for(int j=0; j<10; j++)
			x0[j] = x1[j];


		GG[i] = G;
		II[i] = I;
	}
	
	// print G
	printf("-G\n");
	for(int i=0; i<samples; i++){
		printf("%10.6f\n", GG[i]);	
	}

	// print I
	printf("-I\n");
	for(int i=0; i<samples; i++){
		printf("%10.6f\n", II[i]);	
	}

	printf("-X\n %10.6f\n %10.6f\n %10.6f\n %10.6f\n %10.6f\n %10.6f\n %10.6f\n %10.6f\n %10.6f\n %10.6f\n", x1[0], x1[1], x1[2], x1[3], x1[4], x1[5], x1[6], x1[7], x1[8], x1[9]);
}