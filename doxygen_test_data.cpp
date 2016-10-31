/*
Copyright 2016 Colin Girling

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

//Test data for the Doxygen generator macro.
#if 0


void func(/**/);


    void func(/**/);


int func(/**/);


int  func  (/**/);


	int func(/**/);


void func (/**/);


void  func  (/**/);


int func(/*int a, int b*/);


void func(int a/**/);


void func (int a/**/);


void func ( int a/**/);


int func ( int a/**/);


void func(/**/int a);


void func(/**/int a);//int b,


void func(int ab/**/);


void func (int abc/**/);


void func ( int abcd/**/);


int func ( int a_b/**/);


void func(/**/int a_b_c);


void func(/**/int a_b_c) const;


void func(/**/int _a_b_c);//int b,


void func(int a/**/, bool b);


void func (int a/**/, bool b);


void func ( int a/**/, bool b);


int func ( int a/**/, bool b);


void func(/**/int a, bool b);


void func(/**/int a, bool b);//int b,


void func(/**/int a, bool b) const;//int b,


int func(/**/int a, bool b) const;//int b,


int func(/* // */);


int func(/* ; */);


int func(int a, int b/* ; */,
         int c,
         long d);


    int func(int a, int b/* ; */,
             int c,
             long d);


#endif
