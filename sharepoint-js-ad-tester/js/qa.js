$(function(){
  $( document ).ready ( function()
  {
    $( "#tagtest" ).focus();
  });

  // display our test ad on the same page, in an iframe
  $( "#tester" ).click(function()
  {
    // grab our tag and let's have fun
    var tag = $( "#tagtest" ).val();
    tag = cleanDfpMacros( tag );
    var nsa = findTagSize( tag ); // find our tag size - [width, width+padding, height, height+padding]

    findTagServer( tag );
    httpVsHttpsTest( tag );
    displayInIframe( nsa, tag );
  });

  $( "#tester2" ).click(function()
  {
    // grab our tag and let's have fun
    var tag = $( "#tagtest" ).val();
    tag = cleanDfpMacros( tag );
    var nsa = findTagSize( tag ); // find our tag size - [width, width+padding, height, height+padding]
    findTagServer( tag );
    httpVsHttpsTest( tag );
    displayInNewWindow( tag );
  });

  /* Clear the textbox */
  $( "#cleaner" ).click(function(){
    // remove our iframe - if it exists (I click on the button sometimes even if I haven't tested anything)
    var element = document.getElementById('displaytestad');
    if( element != null ) { element.parentNode.removeChild(element); }
    // clear the info
    $( "#ttisize" ).html( " " );
    $( "#ttiprovider").html( " " );
    $( "#ttisecure").html( " " );
    $( "#ttiproviderunknown").hide(); // just to make sure this is hidden, in case we needed to show it
    $( "#ttiunsecure").hide();        // just to make sure this is hidden, in case we needed to show it
    // clear the form field and set our focus there
    $( "#tagtest" ).val( null );
    $( "#tagtest" ).focus();
  });
});


// ----- Functions ---------------------------------------------------------- //
function displayInIframe( nsa, tag )
{
  // check to see if we have this open already and close it (clicking on test without clearing)
  var element = document.getElementById('displaytestad');
  if( element != null ) { element.parentNode.removeChild(element); }

  // try inserting an iframe into the display div
  var test = linkTest( tag );

  var displayad = document.getElementById('displayad');
  var framedTag = document.createElement('iframe');
  framedTag.id='displaytestad';
  framedTag.width=nsa[1]; // '200' (test value)
  framedTag.height=nsa[3]; // '200' (test value)
  if( test )
  {
    framedTag.src = encodeURI(tag);
    displayad.appendChild(framedTag);
  }
  else
  {
    framedTag.src = 'about:blank';
    displayad.appendChild(framedTag);
    framedTag.contentWindow.document.open();
    framedTag.contentWindow.document.write(tag);
    framedTag.contentWindow.document.close();
  }
  // end iframe setup

  $( ".displayad" ).show();
}

function displayInNewWindow( tag )
{
  var test = linkTest( tag );
  if( test ) {
    var w = window.open( encodeURI(tag) );
  }
  else {
    var w = window.open();
    w.document.open();
    w.document.write( tag );
    w.document.close();
  }
}

function findTagSize( adtext )
{
  var wTagList    = '&w=|width:|ft_width=|width=|width="|width=\'';
  var hTagList    = '&h=|height:|ft_height=|height=|height="|height=\'';
  var wList       = "1034|1024|1000|980|970|768|728|680|480|468|336|320|300|270|250|240|234|216|200|180|180|168|160|125|120|91|88|47|6|5|1";
  var hList       = "1050|1024|1000|768|600|480|470|400|320|280|250|240|225|215|200|150|125|100|91|90|88|75|66|60|54|50|47|42|36|30|25|20|6|5|1";
  var szList      = "sz=|size=|unit=";
  var m;
  var padding     = 20;
  var newSizeArr  = new Array(); // width, padded width, height, padded height

  // find our width first - because that is going into the returned array first
  var wRe = new RegExp( '(' + wTagList + ')(' + wList + ')', 'i' );
  //console.log( wRe );
  var wResult = wRe.exec( adtext );
  if( wResult != null )
  {
    //console.log( wResult );
    newSizeArr.push( parseInt(wResult[2]) );
    newSizeArr.push( (parseInt(wResult[2]) + parseInt(padding)) ); // need room for padding

    // now for the height (hopefully)
    var hRe = new RegExp( '(' + hTagList + ')(' + hList + ')', 'i');
    var hResult = hRe.exec( adtext );
    newSizeArr.push( parseInt(hResult[2]) );
    newSizeArr.push( parseInt(hResult[2]) + parseInt(padding) ); // need room for padding
    //console.log( newSizeArr );
  }
  else
  {
    var szRe = new RegExp( '('+ szList + ')(\\d{2,4}x\\d{2,4})', 'i');
    var szResult = szRe.exec( adtext );
    if( szResult != null )
    {
      var sizes = szResult[2].split("x");
      newSizeArr.push( parseInt(sizes[0]) );
      newSizeArr.push( parseInt(sizes[0]) + parseInt(padding) );
      newSizeArr.push( parseInt(sizes[1]) );
      newSizeArr.push( parseInt(sizes[1]) + parseInt(padding) );
    }
    else
    { // if it doesn't have width/height or size - send back 1x1
      newSizeArr = [1,10,1,10];
    }
  }
  // write out our size info
  //$( "#ttisize" ).html( " " ); // clear before we add new stuff
  $( "#ttisize" ).html( newSizeArr[0] + " x " + newSizeArr[2] + " " );

  // return the sizes so we can still do other stuff with it
  return newSizeArr;
}

function findTagServer( adtext )
{
  var providerList = [
    'blogher',
    'BurstingPipe',
    'celtra',
    'doubleclick',
    'doubleverify',
    'flashtalking',
    'googletagservices',
    'moat',
    'mookie1',
    'voicefive'
  ];
  var providerRegEx = new RegExp( providerList.join('|'), 'i' );
  var provider = providerRegEx.exec( adtext );
  if( provider != null )
  {
    $( ".ttiprovider" ).html( provider + " ");
  }
  else
  { $( ".ttiproviderunknown" ).show(); }
}

function cleanDfpMacros( tag )
{
  var macros = new RegExp( '(\%\%[a-z_]*?\%\%)', 'gi');
  var cleantag = tag.replace( macros, "" );
  return cleantag;
}

function linkTest( tag )
{
  var linkReg = new RegExp( '^http', 'i');
  var test = linkReg.test( tag )
  return test;
}

function httpVsHttpsTest( tag )
{
  var secureReg   = new RegExp( 'https', 'i');
  var unsecureReg = new RegExp( 'http', 'i');
  var results = "secure (https)";
  var test = secureReg.test( tag )
  if( test != false )
  {
    console.log( test );
    $( ".ttisecure" ).html ( "<span class='good'>Secure (https)</span>" );
  }
  else
  {
    test = unsecureReg.test( tag );
    if( test != false )
    {
      $( ".ttisecure" ).html ( "<span class='warning'>Unsecure (http)</span><br />" );
      $( ".ttiunsecure" ).show();
    }
    else
    {
        $( ".ttisecure" ).html ( "<span class='bad'>Unknown, probably unsecure</span><br />" );
        $( ".ttiunsecure" ).show();
    }
  }

}
