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
                    colors = new Colors();

                    $(data).find('OrderLineItemID').each(function( index ) {
                        var $lineitem = $(this);
                        var checkme = '';

                        // first round only
                        if( index == 0 )
                        {
                          currCampaign[0] = new Campaigninfo( $lineitem.attr( "Order_Name" ), $lineitem.attr( "Order_Status" ) );
                        }

                        // ---- Start the fun stuff now ------------------------

                        if( !$lineitem.attr("Parent_Line_Item_ID") )
                        { // if we don't have a parent ID, than we are a section header (folder in Operative)
                          // also, need to check to see if we need to fade this line or not
                          // create a new Parentlineitem( oid, section, slid, slname, dates, datee )
                          var fade = fadeSalesLineItemName( $lineitem.attr("Sales_Line_Item_Name") );
                          currParentlineitem = new Parentlineitem( $lineitem.attr("Order_ID"), $lineitem.attr("Section_Name"), $lineitem.attr("Sales_Line_Item_ID"), $lineitem.attr("Sales_Line_Item_Name"), fade, $lineitem.attr("Start_Date"), $lineitem.attr("End_Date"), $lineitem.attr("Package")  );

                          var childArr = [];
                          // re-parse the file looking for any Parent_Line_Item_ID's that match the current Sales_Line_Item_ID
                          $(data).find('OrderLineItemID').each(function( index ) {
                            var $slineitem = $(this);
                            if( $slineitem.attr("Parent_Line_Item_ID") == $lineitem.attr("Sales_Line_Item_ID") )
                            {
                              var cfade = fadeSalesLineItemName( $slineitem.attr("Sales_Line_Item_Name") );
                              // now we need to determine if there are any ad sizes we need to break out into sublines
                              var subAdSizes = findAdSizes( $slineitem.attr("Sales_Line_Item_Name") );
                              //alert( subAdSizes );
                              childArr[childArr.length] = new Childlineitem( $slineitem.attr("Order_ID"), $slineitem.attr("Section_Name"), $slineitem.attr("Sales_Line_Item_ID"), $slineitem.attr("Parent_Line_Item_ID"), $slineitem.attr("Sales_Line_Item_Name"), cfade, $slineitem.attr("Start_Date"), $slineitem.attr("End_Date"), subAdSizes );
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
                    htrw.push( tableHeader( colors ) );

                    // table body

                    if( currCampaign.length > 0 )
                    {
                      for( i = 1; i < currCampaign.length; i++ )
                      {
                        current = currCampaign[i];
                        // Parse and print our Parent rows
                        htrw.push( parentRow( current, colors ) );

                        if( Array.isArray(current.children) )
                        {
                          var chtrw = [];
                          for( j = 0; j < current.children.length; j++ )
                          { // child rows
                            tmpchild = childRow( current.children[j], colors);
                            chtrw.push( tmpchild );

                            if( Array.isArray( current.children[j].subs ) )
                            {
                              if(current.children[j].subs.length > 1 )
                              {
                                schtrw = [];
                                for( k = 0; k < current.children[j].subs.length; k++ )
                                {
                                  subrow = addEmptyRow( current.children[j].subs[k], colors.bgreadystyle );
                                  schtrw.push( subrow );
                                }
                                chtrw.push( schtrw.join('\n') );
                              }
                            }
                          }
                          htrw.push(chtrw.join('\n'));
                        }
                      }
                    }

                    // end our table
                    htrw.push( tableFooter( colors ) );
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
function tableHeader( colors )
{
    //alert( "tableheader" );
    var hrow = '';
    hrow  = '<table style="border: solid 1px black; font-family: Calibri, sans-serif; font-size: 13px;" id="excelData" name="excelData">';
    hrow += '<thead>';
    // Operative | | Client
    hrow += '<tr><th colspan="6" style="background-color: '+ colors.bgo1header + '; color: '+ colors.fontpageheader +';" id="operativeheader">Operative Lines</th>';
    hrow += '<th style="background-color: '+ colors.bgreadystyle +';"></th>';
    hrow += '<th colspan="4" style="color: '+ colors.fontpageheader +';">Client Tags</th><th></th></tr>';
    // Column Names - Operative
    hrow += '<th style="background-color: '+ colors.bgcolheader +';">Section</th>' +
            '<th style="background-color: '+ colors.bgcolheader +';">Line ID</th>' +
            '<th style="background-color: '+ colors.bgcolheader +'">Parent LID</th>' +
            '<th style="background-color: '+ colors.bgcolheader +';">Line Name</th>' +
            '<th style="background-color: '+ colors.bgcolheader +';">Start</th>' +
            '<th style="background-color: '+ colors.bgcolheader +';">End</th>';
    // Column Names - Ready
    hrow += '<th style="background-color: ' + colors.bgreadystyle +'">Ready</th>';
    // Column Names - Client
    hrow += '<th style="background-color: ' + colors.bgcolheader +';">Tag Size</th>' +
            '<th style="background-color: ' + colors.bgcolheader +';">Tag ID</th>' +
            '<th style="background-color: ' + colors.bgcolheader +';">Tag Name</th>' +
            '<th style="background-color: ' + colors.bgcolheader +';">Tag Start</th>' +
            '<th style="background-color: ' + colors.bgcolheader +';">Tag End</th>';
    hrow += '<th style="background-color: ' + colors.bgcolheader +';">Notes</th></tr>';
    hrow += '</thead><tbody>';
    //alert( hrow );
    return hrow;
}
function tableFooter( colors )
{
    //alert( 'tablefooter' );
    var frow = '';
    frow  = '<tr><th colspan="13" style="background-color:'+ colors.bgnotlisted +'; color:'+ colors.fontnotlisted +';"><b>Not Listed In Operative</b></th></tr>';
    frow += '</tbody></table>';
    return frow;
}
function addEmptyRow( size, rdystyle )
{
    if( size == 'Reskin' )  { size = '1x1 [Reskin]'; }
    if( size == '180x50')   { size = '1x1 [180x50]'; }
    newrow  = '<tr>';
    newrow += '<td></td> <td></td> <td></td> <td></td> <td></td> <td></td>'; // operative cells
    newrow += '<td style="background-color:' + rdystyle + ';"></td>'; // ready cell
    newrow += '<td>'+ size +'</td> <td></td> <td></td> <td></td> <td></td>'; // client tag cells
    newrow += '<td></td>'; // notes cell
    newrow += '</tr>';

    return newrow;
}
function parentRow( lineObj, colors )
{
  //if( lineObj.fade ) { alert( "fade me!" ); }
  var clss = 'font-weight: 800; background-color: ' + colors.bgsection;
  if( lineObj.fade ) { clss += '; color:' + colors.fontfade; }
  var row  = '<tr>';
  // Operative Columns
  row += '<td style="'+ clss +';">'+ lineObj.section + '</td>';
  row += '<td style="'+ clss +';">'+ lineObj.slid + '</td>';
  row += '<td style="'+ clss +';"></td>'; // Parent Line Item
  row += '<td style="'+ clss +';">'+ lineObj.slname + '</td>';
  row += '<td style="'+ clss +';">'+ lineObj.dates + '</td>';
  row += '<td style="'+ clss +';">'+ lineObj.datee + '</td>';
  // Ready column
  row += '<td style="'+ clss +';"></td>';
  // Client Columns
  row += '<td style="'+ clss +';" colspan="5">'+ lineObj.pkg + '</td>';
  // Notes column
  row += '<td style="'+ clss +';"></td>';
  row += '</tr>'

  return row;
}

function childRow( lineObj, colors )
{
// figure out if we're printing an ad size or '---'
  var size = '';

  if( lineObj.fade )
  {
    var clss = 'style="color:'+ colors.fontfade +';"';
    size = '---';
  }
  else
  {
    var clss = '';
    if( lineObj.subs.length == 1 )
    { size = lineObj.subs[0]; }
    else if( lineObj.subs.length > 1 )
    { size = '---'; }
    else
    { size = '[Ad Size]'; }
  }

  var row = '<tr>';
  // Operative Columns
  row += '<td '+clss+'>'+ lineObj.section +'</td>';
  row += '<td '+clss+'>'+ lineObj.slid +'</td>';
  row += '<td '+clss+'>'+ lineObj.plid +'</td>';
  row += '<td '+clss+'>'+ lineObj.slname +'</td>';
  row += '<td '+clss+'>'+ lineObj.dates +'</td>';
  row += '<td '+clss+'>'+ lineObj.datee +'</td>';
  // Ready Column
  row += '<td style="background-color:' + colors.bgreadystyle +';"></td>';
  // Client Columns
  row += '<td '+clss+'>' + size + '</td>';
  row += '<td '+clss+'></td>'; // Tag ID
  row += '<td '+clss+'></td>'; // Tag Name
  row += '<td '+clss+'></td>'; // Tag Start
  row += '<td '+clss+'></td>'; // Tag End
  // Note Column
  row += '<td '+clss+'></td>';
  row += '</tr>';

  return row;
}

// ---- General Functions Needed -----------------------------------------------
/* fadeSalesLineItemName
 * Find out if we have certain key words in the Sales_Line_Item_Name.
 */
function fadeSalesLineItemName( slname )
{
  var productionFee = "Production|Social|_fee";
  var pRe = new RegExp( '('+ productionFee + ')', 'i' );
  var pResult = pRe.exec( slname );
  if( pResult ) { return true; }
  else          { return false; }
}

function findAdSizes( linename )
{
    //var newrow      = '';
    var splitname   = '';
    var adArr = [];

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
            //newrow += addEmptyRow( adSize[0], rdystyle );
            adArr[adArr.length] = adSize[0];
        }
        else {
          adArr = '';
        }
    }

    return adArr;
}

// ---- Package Specific Functions ---------------------------------------------
function sksponsorship()
{

}
function skmaddedvalueallsizes()
{
  var adsizes = ["300x250", "728x90", "320x50"];

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
function Colors()
{ // styles need to be hardcoded for Excel, so we'll just set the colors in an object
  this.fontpageheader = '#1F4E78';  // dark ink blue
  this.bgo1header     = '#E7E6E6';  // medium grey
  this.bgclientheader = '#ffffff';  // white
  this.bgcolheader    = '#DDEBF7';  // light blue
  this.bgsection      = '#D6DCE4';  // dusky blue
  this.bgreadystyle   = '#ffffe0';  // light yellow
  this.bgnotlisted    = '#ff0000';  // red
  this.fontnotlisted  = '#ffffff';  // white
  this.fontfade       = '#808080';  // dark grey
}
function Campaigninfo( cname, cstatus )
{
  this.cname = cname;
  this.cstatus = cstatus;
}
function Parentlineitem(oid, section, slid, slname, fade, dates, datee, pkg, children )
{
  this.oid      = oid;        // Order Id
  this.section  = section;    // Media Plan Section, generally Default or Default Section
  this.slid     = slid;       // Sales Line Item ID
  this.slname   = slname;     // Sales Line Item Name - How it's been named
  if( fade )    { this.fade   = fade; } // t/f - do we fade out the SLName?
  else          { this.fade   = false; }
  this.dates    = dates;      // Start date
  this.datee    = datee;      // End Date
  this.pkg      = pkg;        // Package
  this.children = children;   // Children line items
}
function Childlineitem(oid, section, slid, plid, slname, fade, dates, datee, subs)
{
  this.oid      = oid;        // Order Id
  this.section  = section;    // Media Plan Section, generally Default or Default Section
  this.slid     = slid;       // Sales Line Item ID
  this.plid     = plid;       // Parent Sales Line Item ID
  this.slname   = slname;     // Sales Line Item Name - How it's been named
  if( fade )    { this.fade   = fade; } // t/f - do we fade out the SLName?
  else          { this.fade   = false; }
  this.dates    = dates;      // Start date
  this.datee    = datee;      // End Date
  this.subs     = subs;       // Child lines for the ad line item, with individual ad sizes
}
