/**
 * Created by Donna.Ryan on 7/18/2016.
 */
$(document).ready(function() {

    // The event listener for the file upload
    document.getElementById('txtFileUpload').addEventListener('change', upload, false);

    // Method that checks that the browser supports the HTML5 File API
    function browserSupportFileUpload() {
        var isCompatible = false;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            isCompatible = true;
        }
        return isCompatible;
    }

    // Method that reads and processes the selected file
    function upload(evt) {
        if (!browserSupportFileUpload()) {
            alert('The File APIs are not fully supported in this browser!');
        } else {
            var data = null;
            var file = evt.target.files[0];
            var currCampaign = [];

            xmlfile = evt.target.files[0]['name'];
            var fn = xmlfile.split("."); // we know the file name is going to be a .xml, so take that off
            //console.log(fn[0]);
            $('#xmlfilename').val( fn[0]  );

            var reader = new FileReader();
            reader.readAsText(file);

            reader.onload = function(event) {
                data = $(reader.result);
                if (data && data.length > 0) {
                    //alert('Imported -' + data.length + '- rows successfully!');
                    // ---- custom stuff ---------------------------------------
                    var htrw     = [];
                    var clss     = '';
                    var fade     = '';
                    // ---- Colors ---------------------------------------------
                    var headerfnt   = '#1F4E78';
                    var o1headerbg  = '#E7E6E6';
                    var colheaderbg = '#DDEBF7';
                    var lineitembg  = '#DDEBF7';
                    var sectionbg   = '#D6DCE4';
                    var rdystyle = "background-color: #ffffe0; ";

                    $(data).find('OrderLineItemID').each(function( index ) {
                        var $lineitem = $(this);
                        //var itera = index;
                        //var oid = $lineitem.attr("Order_ID");
                        //var section = $lineitem.attr("Section_Name");
                        //var slid = $lineitem.attr("Sales_Line_Item_ID");
                        //var pid = $lineitem.attr("Parent_Line_Item_ID");
                        //var slname = $lineitem.attr("Sales_Line_Item_Name");
                        //var dates = $lineitem.attr("Start_Date");
                        //var datee = $lineitem.attr("End_Date");
                        //var pkg = $lineitem.attr("Package");
                        //var ci = ';'
                        var checkme = '';

                        // first round only
                        if( index == 0 )
                        {
                          currCampaign[0] = new Campaigninfo( $lineitem.attr( "Order_Name" ), $lineitem.attr( "Order_Status" ) );
                        }

                        if( !$lineitem.attr("Parent_Line_Item_ID") )
                        { // if we don't have a parent ID, than we are a section header (folder in Operative)
                          // create a new Parentlineitem( oid, section, slid, slname, dates, datee )
                          currParentlineitem = new Parentlineitem( $lineitem.attr("Order_ID"), $lineitem.attr("Section_Name"), $lineitem.attr("Sales_Line_Item_ID"), $lineitem.attr("Sales_Line_Item_Name"), $lineitem.attr("Start_Date"), $lineitem.attr("End_Date"), $lineitem.attr("Package")  );

                          var childArr = [];
                          // re-parse the file looking for any Parent_Line_Item_ID's that match the current Sales_Line_Item_ID
                          $(data).find('OrderLineItemID').each(function( index ) {
                            var $slineitem = $(this);
                            if( $slineitem.attr("Parent_Line_Item_ID") == $lineitem.attr("Sales_Line_Item_ID") )
                            {
                              childArr[childArr.length] = new Childlineitem( $slineitem.attr("Order_ID"), $slineitem.attr("Section_Name"), $slineitem.attr("Sales_Line_Item_ID"), $slineitem.attr("Parent_Line_Item_ID"), $slineitem.attr("Sales_Line_Item_Name"), $slineitem.attr("Start_Date"), $slineitem.attr("End_Date") );
                            }
                          });
                          currParentlineitem.children = childArr;
                          currCampaign[currCampaign.length] = currParentlineitem;
                        }
                    });

                    // ---- Display The Data! ----------------------------------
                    // Show the campaign info right under the file input
                    var ci = '';
                    ci  = '<div><strong>Campaign Name: </strong>' + currCampaign[0].cname + '</div>';
                    ci += '<dsk_opone_to_excel.jsiv><strong>Campaign Status: </strong>' + currCampaign[0].cstatus + '</dsk_opone_to_excel.jsiv>'
                    $('#dvCampaignInfo').append($(ci));


                    // start our table
                    htrw.push( tableHeader( o1headerbg, headerfnt, colheaderbg, lineitembg, rdystyle ) );

                    // table body

                    if( currCampaign.length > 0 )
                    {
                      for( i = 1; i < currCampaign.length; i++ )
                      {
                        current = currCampaign[i];
                        // parent rows
                        htrw.push( parentRow( current, sectionbg, rdystyle ) );

                        if( Array.isArray(current.children) )
                        {
                          alert( 'we have '+ current.children.length +' children' );
                          chtrw = [];
                          for( j = 0; j < current.children.length; j++ )
                          { // child rows
                            alert(j);
                            tmpchild = childRow( current.children[j], rdystyle);
                            chtrw.push( tmpchild );
                          }
                          htrw.push(chtrw.join('\n'));
                        }
                      }
                    }

                    // end our table
                    htrw.push( tableFooter() );
                    var test = htrw.join('\n');
                    $('#dvImportRows').append($(test));
                    //console.log(data[1] + "\n");
                    // ---- end custom stuff -----------------------------------

                } else {
                    alert('No data to import!');
                }
            };
            reader.onerror = function() {
                alert('Unable to read ' + file.fileName);
            };
        }
    }

});

// ---- Static HTML Functions --------------------------------------------------
function tableHeader( o1headerbg, headerfnt, colheaderbg, lineitembg, rdystyle )
{
    //alert( "tableheader" );
    var hrow = '';
    hrow  = '<table style="border: solid 1px black; font-family: Calibri, sans-serif; font-size: 13px;" id="excelData" name="excelData">';
    hrow += '<thead>';
    // Operative | | Client
    hrow += '<tr><th colspan="7" style="background-color: '+ o1headerbg + '; color: '+ headerfnt +';" id="operativeheader">Operative Lines</th>';
    hrow += '<th></th>';
    hrow += '<th colspan="4" style="color: '+ headerfnt +';">Client Tags</th><th></th></tr>';
    // Column Names - Operative
    hrow += '<th style="background-color: '+ colheaderbg +';">Section</th>' +
            '<th style="background-color: '+ colheaderbg +';">Line ID</th>' +
            '<th style="background-color: '+ colheaderbg +'">Parent LID</th>' +
            '<th style="background-color: '+ colheaderbg +';">Line Name</th>' +
            '<th style="background-color: '+ colheaderbg +';">Start</th>' +
            '<th style="background-color: '+ colheaderbg +';">End</th>';
    // Column Names - Ready
    hrow += '<th style="' + rdystyle +'">Ready</th>';
    // Column Names - Client
    hrow += '<th style="background-color: ' + lineitembg +';">Tag Size</th>' +
            '<th style="background-color: ' + lineitembg +';">Tag ID</th>' +
            '<th style="background-color: ' + lineitembg +';">Tag Name</th>' +
            '<th style="background-color: ' + lineitembg +';">Tag Start</th>' +
            '<th style="background-color: ' + lineitembg +';">Tag End</th>';
    hrow += '<th style="background-color: ' + lineitembg +';">Notes</th></tr>';
    hrow += '</thead><tbody>';
    //alert( hrow );
    return hrow;
}
function tableFooter()
{
    //alert( 'tablefooter' );
    var frow = '';
    frow  = '<tr><th colspan="13" style="background-color:#ff0000; color:#ffffff;"><b>Not Listed In Operative</b></th></tr>';
    frow += '</tbody></table>';
    return frow;
}
function addEmptyRow( size, rdystyle )
{
    if( size == 'Reskin' )  { size = '1x1'; }
    if( size == '180x50')   { size = '1x1'; }
    newrow  = '<tr>';
    //newrow += '<td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td>'; // operative cells
    newrow += '<td></td> <td></td> <td></td> <td></td> <td></td> <td></td>'; // operative cells
    newrow += '<td style="' + rdystyle + '"></td>'; // ready cell
    newrow += '<td>'+ size+'</td> <td></td> <td></td> <td></td> <td></td>'; // client tag cells
    newrow += '<td></td>'; // notes cell
    newrow += '</tr>';

    return newrow;
}
function parentRow( lineObj, sectionbg, rdystyle )
{
  var clss = 'font-weight: 800; background-color: ' + sectionbg;
  var row  = '<tr>';
  // Operative Columns
  row += '<td style="'+clss+'">'+ lineObj.section + '</td>';
  row += '<td style="'+clss+'">'+ lineObj.slid + '</td>';
  row += '<td style="'+clss+'"></td>'; // Parent Line Item
  row += '<td style="'+clss+'">'+ lineObj.slname + '</td>';
  row += '<td style="'+clss+'">'+ lineObj.dates + '</td>';
  row += '<td style="'+clss+'">'+ lineObj.datee + '</td>';
  // Ready column
  row += '<td style="'+clss+'"></td>';
  // Client Columns
  row += '<td style="'+clss+'" colspan="5">'+ lineObj.pkg + '</td>';
  // Notes column
  row += '<td style="'+clss+'"></td>';
  row += '</tr>'

  return row;
}

function childRow( lineObj, rdystyle )
{
  var row = '<tr style>';
  // Operative Columns
  row += '<td>'+lineObj.section+'</td>';
  row += '<td>'+lineObj.slid+'</td>';
  row += '<td>'+lineObj.plid+'</td>';
  row += '<td>'+lineObj.slname+'</td>';
  row += '<td>'+lineObj.dates+'</td>';
  row += '<td>'+lineObj.datee+'</td>';
  // Ready Column
  row += '<td class="'+rdystyle+'"></td>';
  // Client Columns
  row += '<td>[Ad Size]</td>';
  row += '<td></td>'; // Tag ID
  row += '<td></td>'; // Tag Name
  row += '<td></td>'; // Tag Start
  row += '<td></td>'; // Tag End
  // Note Column
  row += '<td></td>';
  row += '</tr>';

  return row;
}

// ---- General Functions Needed -----------------------------------------------
function findAdSizes( linename, rdystyle )
{
    var newrow      = '';
    var splitname   = '';

    var arLineParts = linename.split('|');
    //console.log(arLineParts.length);
    for( i = 0; i < arLineParts.length; i++ )
    {
        //console.log(splitname);
        if( !splitname )    { splitname = linename; }

        var checkAdSizes = "1034x90|970x250|970x90|970x66|300x1050|300x600|300x250|728x90|320x50|320x480|180x50|Reskin";
        var sizeRe = new RegExp( '(' + checkAdSizes + ')', "i");
        var adSize = sizeRe.exec(splitname);
        if( adSize )
        {
            newsplit = splitname.split(adSize[0]);
            splitname = newsplit[1];
            newrow += addEmptyRow( adSize[0], rdystyle );
        }
    }

    return newrow;
}

// ---- Package Specific Functions ---------------------------------------------
function sksponsorship()
{

}
// ---- Export to Excel --------------------------------------------------------
var tableToExcel = (function () {
    var uri = 'data:application/vnd.ms-excel;base64,'
        , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
        , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
        , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
    return function (table, name) {
        if (!table.nodeType) table = document.getElementById(table)
        var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }

        var xmlfilename = $("#xmlfilename").val();
        //console.log(xmlfilename);
        document.getElementById("dlink").href = uri + base64(format(template, ctx));
        document.getElementById("dlink").download = xmlfilename + ".xls";
        document.getElementById("dlink").click();

    }
})()
// ---- end Export to Excel ----------------------------------------------------

// ---- Prototypes -------------------------------------------------------------
function Campaigninfo( cname, cstatus )
{
  this.cname = cname;
  this.cstatus = cstatus;
}
function Parentlineitem(oid, section, slid, slname, dates, datee, pkg, children )
{
  this.oid      = oid;        // Order Id
  this.section  = section;    // Media Plan Section, generally Default or Default Section
  this.slid     = slid;       // Sales Line Item ID
  this.slname   = slname;     // Sales Line Item Name - How it's been named
  this.dates    = dates;      // Start date
  this.datee    = datee;      // End Date
  this.pkg      = pkg;        // Package
  this.children = children;   // Children line items
}
function Childlineitem(oid, section, slid, plid, slname, dates, datee)
{
  this.oid      = oid;        // Order Id
  this.section  = section;    // Media Plan Section, generally Default or Default Section
  this.slid     = slid;       // Sales Line Item ID
  this.plid     = plid;       // Parent Sales Line Item ID
  this.slname   = slname;     // Sales Line Item Name - How it's been named
  this.dates    = dates;      // Start date
  this.datee    = datee;      // End Date
}
