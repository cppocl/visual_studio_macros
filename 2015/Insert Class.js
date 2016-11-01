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

var doc = dte.ActiveDocument;

function Insert(str)
{
    doc.Selection.StartOfLine();
    doc.Selection.Insert(str, 1);
}

function InsertLine(str)
{
    doc.Selection.StartOfLine();
    doc.Selection.Insert(str, 1);
    doc.Selection.NewLine();
}

function InserBlanktLine()
{
    doc.Selection.NewLine();
}

function ImplementEmptyFunction(func, add_blank)
{
    InsertLine(func);
    InsertLine("{");
    InsertLine("}");
    if (add_blank)
        InserBlanktLine();
}

function CreateClass(class_name, indent)
{
    InsertLine("class " + class_name);
    InsertLine("{");
    InsertLine("public:");
    InsertLine(indent + class_name + "();");
    InsertLine(indent + class_name + "(" + class_name + " const&);");
    InsertLine(indent + "~" + class_name + "();");
    InserBlanktLine();
    InsertLine(indent + class_name + "& operator =(" + class_name + " const&);");
    InsertLine("};");
}

function ImplementClass(class_name, indent)
{
    var class_member = class_name + "::";

    InsertLine("#include \"" + class_name + ".hpp\"");
    InserBlanktLine();
    ImplementEmptyFunction(class_member + class_name + "()", true);
    ImplementEmptyFunction(class_member + class_name + "(" + class_name + " const&)", true);
    ImplementEmptyFunction(class_member + "~" + class_name + "()", true);
    ImplementEmptyFunction(class_name + "& " + class_member + "operator =(" + class_name + " const&)", false);
}

function SanitizeClassName(class_name)
{
    // Remove single line comment characters // and any preceding spaces.
    // E.g.
    // before: " // MyClass"
    //  after: "MyClass"

    while (class_name.charAt(0) == " ")
        class_name = class_name.substr(1);
    if (class_name.length > 2 && class_name.substr(0, 2) == "//")
        class_name = class_name.substr(2);
    while (class_name.charAt(0) == " ")
        class_name = class_name.substr(1);

    return class_name;
}

function DocumentTextToClass()
{
    // Prepare undo.
    if (dte.UndoContext.IsOpen)
        dte.UndoContext.Close();
    dte.UndoContext.Open("Insert Header Guard");

    var indent = "    ";
    var TextSelection = doc.Selection;

    // Get the class name from the current line.
    // Any leading single line comment is removed from the class name.
    TextSelection.StartOfLine();
    TextSelection.EndOfLine(true);
    var class_name = SanitizeClassName(TextSelection.Text);

    dte.ItemOperations.NewFile("General\\Text File", class_name + ".hpp");
    doc = dte.ActiveDocument;

    // Create the class declaration within the new .hpp file.
    CreateClass(class_name, indent);

    dte.ItemOperations.NewFile("General\\Text File", class_name + ".cpp");
    doc = dte.ActiveDocument;

    // Create the class implementation within the new .cpp file.
    ImplementClass(class_name, indent);

    dte.UndoContext.Close();
}

// Takes the first word on the line and uses this as the class name.
// then created a new .hpp and .cpp with the class defined and implemented.
DocumentTextToClass();
