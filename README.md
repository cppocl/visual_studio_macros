# Visual Studio Macros for C++
Macros for various Visual Studio versions to aid in productivity.

See the Microsoft Macros Extension project for details about using the macros.
These macros are written in ECMAScript (i.e. JavaScript), which is the language used by the Macro explorer.

Some useful links here:

https://blogs.msdn.microsoft.com/visualstudio/2016/05/11/macros-extension-open-sourced-in-visual-studio-2015/
https://github.com/Microsoft/VS-Macros

* Generate Doxygen comments for a function by simply having the cursor anywhere on the line of the function.
* Generate a new class by simple having a line containing a single word, which can also be preceded with //
* Header guards will be generated on the line where the cursor resides, and combines the path and filename to generate the #define guard.
