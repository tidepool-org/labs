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

void HovorkaModelDefaultParameters(double BW, HovorkaModelParameters_t* pPar){
	pPar->BW = BW;
//==============================================================================
	pPar->k12 = 0.066;    	// Transfer rate [1/min]
//==============================================================================
	pPar->ka1 = 0.006;    	// Deactivation rate [1/min]
	pPar->ka2 = 0.06;     	// Deactivation rate [1/min]
	pPar->ka3 = 0.03;     	// Deactivation rate [1/min]

	pPar->SI1 = 51.2e-4;  	// Transport insulin sensitivity [L/mU]
	pPar->SI2 = 8.2e-4;   	// Disposal insulin sensitivity [L/mU]
	pPar->SI3 = 520e-4;   	// EGP insulin sensitivity [L/mU]

	pPar->kb1 = (pPar->ka1)*(pPar->SI1);  	// Activation rate [(L/mU)/min]
	pPar->kb2 = (pPar->ka2)*(pPar->SI2);  	// Activation rate [(L/mU)/min]
	pPar->kb3 = (pPar->ka3)*(pPar->SI3);  	// Activation rate [(L/mU)/min]
//==============================================================================
	pPar->ke  = 0.138;    	// Insulin elimination rate [1/min]
//==============================================================================
	pPar->tauD = 40.0;    	// CHO absorption time constant [min]
	pPar->tauS = 55.0;    	// Insulin absorption time constant [min]
//==============================================================================
	pPar->AG   = 0.8;     	// CHO utilization [-]
//==============================================================================
	pPar->VG   = 0.16*BW;  	// Glucose distribution volume [L]
	pPar->VI   = 0.12*BW;  	// Insulin distribution volume [L]
//==============================================================================
	pPar->F01  = 0.0097*BW;	// Insulin independent glucose consumption [mmol/min]
	pPar->EGP0 = 0.0161*BW;	// Liver glucose production at zero insulin [mmol/min]
//==============================================================================

}
