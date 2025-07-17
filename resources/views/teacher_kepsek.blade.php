<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{$name}}</title>
    <style>
        /* body {
            padding: 0cm 0.5cm 0cm 0.5;
            color: black;
            background-color: white;
        }

        ul,
        ol {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .header-table {
            width: 100%;
            table-layout: fixed;
            text-align: center;
        }

        .header-table img {
            width: 5cm;
            height: auto;
        }

        .separator {
            border: none;
            border-top: 1px solid black;
        }

        .separator.thick {
            border-top: 2px solid black;
        }

        .content-table {
            font-size: 14px;
            width: 100%;
        }

        .signature {
            text-align: right;
            position: relative;
        }

        .signature img {
            width: 4cm;
            position: absolute;
            right: 0;
            top: 4px;
        }

        .centered-table {
            border-collapse: collapse;
            border: 1px solid gray;
            font-size: 14px;
            margin: 16px auto;
            text-align: center;
        }

        .centered-table th,
        .centered-table td {
            border: 1px solid gray;
            padding: 8px;
            font-weight: 400;
        } */
        html {
            margin: 0px
        }

        #template {
            width: 862.01;
            height: 620.51;
        }
        #container1{
            position: relative;
            width: fit-content;
            height: fit-content;
        }
        #nama{
            position: absolute;
            top: 45%;
            font-family: sans-serif;
            bottom: 50%;
            text-align: center;
            width: 100%;
            font-size: 20px;
            font-weight: bold;
            /* left: 50%; */
            /* color: white; */
        }
    </style>
</head>

<body>
    <div>
        <div id="container1">
            <p id="nama">{{$name}}</p>
            <img id="template" src="images/certificate/TemplateKepsek.jpg" />
        </div>
    </div>
</body>

</html>