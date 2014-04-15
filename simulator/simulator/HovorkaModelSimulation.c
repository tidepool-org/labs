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
#include "HovorkaModel.h"
#include "ODESolver.h"

void HovorkaModelSimulation(
			double* px, 
			const int Nsim, const int Nsamples, 
			const double* T, const double* U, const double* D,
			const HovorkaModelParameters_t* pPar,
			double *G, double *I,
			double *pWork){

	static const int nx = 10;
	int k,kk;

	ODEModel_t *pODEModel;
	pODEModel = HovorkaModel;
	
	kk=0;
	G[kk] = px[4]/(pPar->VG);
	I[kk] = px[6];

	for(k=0; k<Nsim; k++){
		kk++;
		ExplicitEulerFixedStepSizeODESolver(
				pODEModel, nx,
				T[k],T[kk],Nsamples,
				px,px,
				&U[k], &D[k], pPar,
				pWork);
		G[kk] = px[4]/(pPar->VG);
		I[kk] = px[6];
	}
}
