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
import numpy as np
import matplotlib.pyplot as plt

dataG = np.loadtxt('DataDiabetes_G.txt');
dataU = np.loadtxt('DataDiabetes_u.txt');
dataD = np.loadtxt('DataDiabetes_d.txt');

tG = dataG[:,0]
G  = dataG[:,1]

tU = dataU[:,0]
U = dataU[:,1]

tD = dataD[:,0]
D = dataD[:,1]

plt.subplot(3,1,1)
plt.plot(tG,G,lw=2)

plt.subplot(3,1,2)
plt.plot(tU,U,lw=2)

plt.subplot(3,1,3)
plt.plot(tD,D,lw=2)

plt.show()
