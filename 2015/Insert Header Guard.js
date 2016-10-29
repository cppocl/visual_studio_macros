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

function InsertLine(str)
{
    doc.Selection.Insert(str, 1);
    doc.Selection.NewLine();
}

function ReplaceSlash(path_and_name, starting_word, include_starting_word)
{
    var guard = "";
    var last_word = "";
    var store_characters = false;
    for (i = 0; i < path_and_name.length; i++)
    {
        var ch = path_and_name.charAt(i);
        if (ch == "\\" || ch == '.')
        {
            if (store_characters)
                guard += "_"; // Replace back slash or full stop with underscore.
            else if (last_word == starting_word)
            {
                store_characters = true; // Won't record last words any more.
                if (include_starting_word)
                    guard += starting_word.toUpperCase() + "_";
            }
            else
                last_word = ""; // Clear last word ready for building next word.
        }
        else if (store_characters)
            guard += ch.toUpperCase(); // starting word found, so store everything to end.
        else
            last_word += ch; // Build last word until starting word is found.
    }

    return guard;
}

function PathToGuard(path_and_name, starting_word, include_starting_word)
{
    var guard = "";

    // Ignore drive letter and initial back slash.
    if (path_and_name.charAt(1) == ':')
        guard = path_and_name.substr(3);
    else
        guard = path_and_name;

    return ReplaceSlash(guard, starting_word, include_starting_word);
}

// Customize your guard periods here.
var guard_prepend = "OCL_GUARD_";
var guard_start_word = "cppocl";

if (dte.UndoContext.IsOpen)
    dte.UndoContext.Close();

dte.UndoContext.Open("Insert Header Guard");

// Convert path to header guard.
// Looks for first word split by back slash,
// then converts to series of words separated by underscore.
var path = dte.ActiveDocument.FullName;
var guard = guard_prepend + PathToGuard(path, guard_start_word, false);

// Insert header guard
InsertLine("#ifndef " + guard);
InsertLine("#define " + guard);

dte.UndoContext.Close();
