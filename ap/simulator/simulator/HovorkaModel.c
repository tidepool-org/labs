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

void HovorkaModel(
	const double t, const double* x, 
	const double* u, const double* d, const void* param, 
	double* f)
{		
	static const double MwG = 180.16; // Molecular weight of glucose (g/mol)
	HovorkaModelParameters_t* par;
	par = (HovorkaModelParameters_t*) param;

	// =========================================================================	
	// Gastro-Intestinal Tract, CHO absorption
	// =========================================================================
	double D = (1000.0/MwG)*d[0];    // CHO input rate in glucose equivalents [mmol/min]
	double UG1 = x[0]/(par->tauD); // Glucose flux from compartment 1 to 2 [mmol/min]
	double UG = x[1]/(par->tauD);  // Glucose flux from stomach/gut to blood [mmol/min] 
	
	f[0] = (par->AG)*D-UG1;        // Stomach/gut compartment 1 balance [mmol/min], d/dt D1
	f[1] = UG1-UG;      	       // Stomach/gut compartment 2 balance [mmol/min], d/dt D2

	// =========================================================================
	// Insulin absorption
	// =========================================================================
	double UI1 = x[2]/(par->tauS);     // Insulin flux from SC compartment 1 to 2 [mU/min]
	double UI  = x[3]/(par->tauS);     // Insulin flux from SC compartment 2 to plasma [mU/min]
	
	f[2] = u[0] - UI1; // SC insulin compartment 1 balance [mU/min]
	f[3] = UI1 - UI;   // SC insulin compartment 2 balance [mU/min]

	// =========================================================================
	//  Glucose subsystem
	// =========================================================================
	double G = x[4]/(par->VG); // Plasma glucose concentration [mmol/L]

	// Non-insulin dependent glucose consumption [mmol/min]
	double F01c;
	if(G >= 4.5){
	    F01c = (par->F01);
	} 
	else {
	    F01c = (par->F01)*G/4.5;
	}

	// Renal glucose excretion [mmol/min]
	double FR;
	if(G >= 9.0){
	    FR = 0.003*(G-9.0)*(par->VG);
	} 
	else {
	    FR = 0.0;
	}

	// Mass balances for the two glucose compartments
	double Q12 = x[7]*x[4];         		// Glucose transport/distrubtion [mmol/min] 
	double Q21 = (par->k12)*x[5];          	// Glucose transport distribution [mmol/min]
	double Q2out = x[8]*x[5];       		// Glucose disposal in adipose tissue [mmol/min]
	double EGP = (par->EGP0)*(1.0-x[9]);	// Endogenous Glucose Production [mmol/min]

	f[4] = UG - F01c - FR - Q12 + Q21 + EGP; // Compartment 1 [mmol/min], d/dt Q1
	f[5] = Q12 - Q21 - Q2out;                // Compartment 2 [mmol/min], d/dt Q2

	
	// =========================================================================
	// Insulin subsystem
	// =========================================================================
	
	// Plasma insulin
	f[6] = UI/(par->VI) - (par->ke)*x[6];     // Plasma insulin koncentration [(mU/L)/min], d/dt I

	// Insulin action
	f[7] = (par->kb1)*x[6]-(par->ka1)*x[7];   // Insulin influence on transport/distubtion, d/dt x1 
	f[8] = (par->kb2)*x[6]-(par->ka2)*x[8];   // Insulin influence on disposal in adipose tissue, d/dt x2
	f[9] = (par->kb3)*x[6]-(par->ka3)*x[9];   // Insulin influence on EGP in liver, d/dt x3
}

