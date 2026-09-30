/* bb-leaks-tracker loader */
(function(){
  var n=7, parts=[], i=0;
  function go(){
    if(i>=n){
      try{
        var code=atob(parts.join(""));
        (0,eval)(code);
      }catch(e){console.error("bb-lt load failed",e);}
      return;
    }
    var x=new XMLHttpRequest();
    x.open("GET","/bb_lt_"+i+".txt",true);
    x.onload=function(){parts.push(x.responseText.trim());i++;go();};
    x.onerror=function(){console.error("bb-lt chunk fail",i);};
    x.send();
  }
  go();
})();
