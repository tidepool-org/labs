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
#include <stdio.h>
#include <time.h>
#include <stdlib.h>

#include "HovorkaModel.h"


int main()
{
	printf("========================================================\n");
	printf("                  Test Hovorka Model                    \n");
	printf("========================================================\n");
	printf("\n\n");

	double BW = 70.0;
	HovorkaModelParameters_t par;

	HovorkaModelDefaultParameters(BW,&par);
	printHovorkaModelParameters(&par);
	
	// Define steady state (for BW 70 kg)
	int nx = 10;
	double uss = 6.68;
	double dss = 0.00;
	double xss[10];
	double fss[10];
	double t=0;

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

	HovorkaModel(t,xss,&uss,&dss,&par,fss);

	for(int i=0; i<nx; i++)
		printf("%10.6f %10.6f \n", xss[i], fss[i]);

	
	// Simulation Step
	double t0 = 0.0;
	double t1 = 5.0;
	double dT = t1-t0;
	int Nsamples = 10;

	int Nsim = 12*30;

	double* pU;
	double* pD;
	pU = (double*) malloc((Nsim)*sizeof(double));
	pD = (double*) malloc((Nsim)*sizeof(double));
	

	double x0[10];
	double x1[10];
	double u;
	double d;
	double G;
	double I;
	double work[10];
	
	for(int i=0; i<nx; i++)
		x0[i] = xss[i];

	u = uss;
	d = dss;

	for(int i=0; i<Nsim; i++)
		pU[i] = uss;
	for(int i=0; i<Nsim; i++)
		pD[i] = dss;
	

	double ubolus,dmeal;
	ubolus = 3000.0/dT;
	dmeal  = 100.0/dT;

	pU[72] = uss+ubolus;
	pD[72] = dss+dmeal;
	

	pU[144] = uss+ubolus;
	pD[144] = dss+dmeal;

	pU[216] = uss+ubolus;
	pD[216] = dss+dmeal;


	G = x0[4]/(par.VG);
	I = x0[6];


	FILE *fpG = fopen("DataDiabetes_G.txt","w");
	FILE *fpu = fopen("DataDiabetes_u.txt","w");
	FILE *fpd = fopen("DataDiabetes_d.txt","w");

	printf("========================================================\n");
	printf("   Simulation of the Hovorka Model                      \n");
	printf("========================================================\n");

	printf("  t          u          d          G\n");
	for(int i=0; i<Nsim; i++){
		u = pU[i];
		d = pD[i];

		//printf("%10.6f %10.6f %10.6f %10.6f\n",t0/60.0,u,d,G);
		fprintf(fpG,"%10.6f %10.6f \n",t0/60.0,G);
		fprintf(fpu,"%10.6f %10.6f \n",t0/60.0,u);
		fprintf(fpd,"%10.6f %10.6f \n",t0/60.0,d);

		HovorkaModelSimulationStep(
				t0, t1, Nsamples,
				x0, x1,
				&u, &d, &par,
				&G, &I,
				work);
		
	printf("G %10.6f \n", G);
	printf("I %10.6f \n", I);
	printf("u %10.6f \n", u);
	printf("d %10.6f \n", d);
	printf("work %10.6f \n", d);
	printf("t0: %10.6f t1: %10.6f \n", t0, t1);
	printf("x0: \n");
	for(int j=0; j<nx; j++)
		printf("%10.6f \n", x0[j]);
	printf("x1: \n");
	for(int j=0; j<nx; j++)
		printf("%10.6f \n", x1[j]);	
	
		t0 = t1;
		t1 = t1 + dT;
		for(int j=0; j<nx; j++)
			x0[j] = x1[j];
		fprintf(fpu,"%10.6f %10.6f \n",t0/60.0,u);
		fprintf(fpd,"%10.6f %10.6f \n",t0/60.0,d);
	}
	//printf("%10.6f %10.6f %10.6f %10.6f\n",t0/60.0,u,d,G);
	fprintf(fpG,"%10.6f %10.6f \n",t0/60.0,G);

	fclose(fpG);
	fclose(fpu);
	fclose(fpd);

	free(pU);
	free(pD);
}