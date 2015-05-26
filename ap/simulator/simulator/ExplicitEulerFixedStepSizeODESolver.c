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

typedef void ODEModel_t(
				const double t, const double* x, 
				const double *pu, const double *pd, const void* pdata, 
				double* pf);

void ExplicitEulerFixedStepSizeODESolver(
		ODEModel_t* pODEModel, const int nx, 
		const double t0, const double t1, const int N, 
		const double* x0, double* x1,
		const double* pu, const double *pd, const void* pData,
		double* pWork){

	int i,j;
	double h;
	double T;
	double *pf;
	
	pf = pWork;
	h = (t1-t0)/((double) N);
	T = t0;
	for(j=0; j<nx; j++)
		x1[j] = x0[j];
	
	for(i=0; i<N; i++){
		pODEModel(T,x1,pu,pd,pData,pf);
		T += h;
		for(j=0; j<nx; j++)
			x1[j] += h*pf[j];
	}
}

