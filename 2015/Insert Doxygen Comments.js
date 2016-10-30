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
    doc.Selection.StartOfLine();
    doc.Selection.Insert(str, 1);
    doc.Selection.NewLine();
}

function InsertArray(str_array)
{
    for (i = 0; i < str_array.length; i++)
        InsertLine(str_array[i]);
}

// Find padding before words commence.
function GetPadding(code_line)
{
    var padding = "";
    for (i = 0; i < code_line.length; i++)
    {
        ch = code_line.charAt(i);
        if (ch == " " || ch == "\t")
            padding += ch;
        else
            break;
    }
    return padding;
}

// Remove any leading or trailing white space or comments from a string
// and return the code up to the stop character.
//
// Return one of the following:
//   0 means stop_at is found.
//   1 means stop_at not found.
//   2 means stop_at not found and within comment.
function ExtractLineOfCode(code_line, stop_at, in_comment)
{
    var ret_code = 1;
    var possible_comment = false; // Can only be true for one character.
    var ch = "";
    var prev_char = "";
    var extracted_line = "";
    var skip_white_space = true;
    var padding = "";

    for (i = 0; i < code_line.length; i++)
    {
        prev_char = ch;
        ch = code_line.charAt(i);

        if (in_comment)
        {
            if (possible_comment)
            {
                if (ch == "/") // found */
                    in_comment = false;
                possible_comment = false;
            }
            else if (ch == "*") // found * and need to see if / comes next.
                possible_comment = true;
        }
        else if (possible_comment)
        {
            if (ch == "/")
                break; // everything else after "//" can be ignored.
            if (ch == "*")
            {
                in_comment = true;
                possible_comment = false;
            }
            else
            {
                // Wasn't the start of a comment, so we need to add
                // the previous character and this one.
                possible_comment = false;
                extracted_line += prev_char;
                extracted_line += ch;
            }
        }
        else if (ch == "/") // Might be the start of comment block or comment line.
            possible_comment = true;
        else if (ch == " " || ch == "\t")
        {
            if (!skip_white_space)
                extracted_line += ch;
        }
        else
        {
            extracted_line += ch;
            if (ch == stop_at)
            {
                ret_code = 0;
                break; // End of function.
            }
            if (ch == ',') // ignore white space after comma within arguments.
                skip_white_space = true;
            else
                skip_white_space = false;
        }
    }

    if (possible_comment)
        extracted_line += ch;
    else if (in_comment)
        ret_code = 2;

    return { ret_code: ret_code, extracted_line: extracted_line, padding: padding };
}

function ExtractLinesOfCode(stop_at)
{
    var curr_line = "";
    var whole_function = "";
    var TextSelection = doc.Selection;
    var in_comment = false;
    var ret_code = 0;
    var lines = 0;

    do
    {
        // Read the next lines from the document until we reach ;
        TextSelection.StartOfLine();
        TextSelection.EndOfLine(true);
        curr_line = TextSelection.Text;

        // Get the code line without any comments.
        var values = ExtractLineOfCode(curr_line, ";", in_comment);
        ret_code = values.ret_code;
        whole_function += values.extracted_line;

        if (ret_code != 0)
        {
            if (ret_code == 1) // stop_at character not found.
                in_comment = false;
            else if (ret_code == 2) // stop_at character not found and within comment block.
                in_comment = true;
            lines++;
            TextSelection.LineDown();
        }
    }
    while (ret_code != 0);

    lines++; // Always move at least one line up.

    TextSelection.StartOfLine();
    while (lines > 0)
    {
        TextSelection.LineUp();
        lines--;
    }

    return whole_function;
}

// Return an array of strings containing doxygen lines converted from a line of code (C++ function).
// Comment start would be single line comments // or block style comments /* */
// Comment type would be \ or @, e.g. \param or @param
function CodeToDoxygen(code_line, comment_start, comment_style, padding)
{
    var doxygen = [];
    var word_str = "";

    // keep track of previous word, so we can detect return type
    // when there is a space between the function name and open bracket.
    var prev_word_str = "";

    // Detected last part of return type before function name.
    var return_str = "";

    var return_doxygen_comment = "";
    var searched_args = false;
    var is_args = false;
    var after_args = false;  // Flag past args to prevent any more params being added.
    var is_template = false; // Set to true when "template" keyword detected.
    var added_param = false;

    var doxygen_comment       = ""; // Doxygen padding and style to appear before each line.
    var doxygen_comment_blank = ""; // When a separator line is required, use the blank.
    var last_doxygen_comment  = ""; // Last Doxygen padding and closing block comment.

    if (comment_start == "/**")
    {
        doxygen.push(padding + comment_start);
        doxygen_comment = padding + " * " + comment_style + " ";
        doxygen_comment_blank = padding + " *";
        last_doxygen_comment = padding + " */";
    }
    else
    {
        doxygen_comment = padding + comment_start + " " + comment_style + " ";
        doxygen_comment_blank = padding + comment_start;
    }

    doxygen.push(doxygen_comment + "brief ");
    doxygen.push(doxygen_comment_blank);

    for (i = 0; i < code_line.length; i++)
    {
        prev_char = ch;
        ch = code_line.charAt(i);
        if (ch != " " && ch != "\t")
        {
            if (ch == "(")
            {
                if (return_str != "void")
                    return_doxygen_comment = doxygen_comment + "[" + return_str + "] return ";
                word_str = "";
                is_args = true;
                searched_args = true;
            }
            else if (ch == ")")
            {
                is_args = false;
                after_args = true;
            }
            else if (ch == "<")
            {
                if (!is_template)
                    return doxygen;
            }
            else if (ch == ">")
            {
                if (!is_template)
                    return doxygen;
                is_template = false;
            }
            else if (ch == ",")
            {
                if (is_args)
                {
                    added_param = true;
                    doxygen.push(doxygen_comment + "param " + word_str);
                }
                word_str = "";
            }
            else
                word_str += ch;
        }
        else
        {
            if (word_str == "template")
                is_template = true;
            if (!searched_args) // record last word before function name.
                return_str = word_str;
            word_str = "";
        }
    }

    if (return_doxygen_comment.length > 0)
    {
        if (added_param)
            doxygen.push(doxygen_comment_blank);
        doxygen.push(return_doxygen_comment);
    }

    if (last_doxygen_comment.length > 0)
        doxygen.push(last_doxygen_comment);

    return doxygen;
}

// Prepare undo.
if (dte.UndoContext.IsOpen)
    dte.UndoContext.Close();
dte.UndoContext.Open("Insert Header Guard");

// Setup start for each Doxygen comment line.
var TextSelection = doc.Selection;
TextSelection.StartOfLine();
TextSelection.EndOfLine(true);
var padding = GetPadding(TextSelection.Text);
var comment_start = "/**"; // Can also be //
var comment_style = "@";   // Can also be \

// Extract all the code into a single line up to the semi-colon.
var whole_function = ExtractLinesOfCode(";");

// Convert the code line to Doxygen comments.
var doxygen = CodeToDoxygen(whole_function, comment_start, comment_style, padding);

// Place the Doxygen comments above the function.
InsertArray(doxygen);

dte.UndoContext.Close();
