function testTag()
{
  if( !document.getElementById('tagtest').value )
  {
    alert('You need to paste in a tag to test.');
  }
  else
  {
    $("#testtagbg").toggle();
    /*
    if( !document.getElementById("testtagbg").style.display )
    { // show the layer that we're going to put the ad tag in
      document.getElementById('testtagbg').style.display = "block";
    }
    var testad = document.getElementById('tagtest').value;
    var iframe = window.frames['testtagFrame'].document;
    iframe.open();
    iframe.write('<!DOCTYPE html><head><base target="adtestWin"></head><body>');
    iframe.write(testad);
    iframe.write('</body></html>');
    iframe.close();
    var adtestWin = window.open("","adtestWin");
    adtestWin.document.write( testad );
    */
  }
}
function clearTag()
{
    document.getElementById('tagtest').value = "";
    var iframe = window.frames['testtagFrame'].document;
    iframe.open();
    iframe.write('<!DOCTYPE html><head><base target="_blank"></head><body>');
    iframe.write('</body></html>');
    iframe.close();

}

function closeTest()
{
  $("#testtagbg").hide();
  //document.getElementById('testtagbg').style.display = "";
}
