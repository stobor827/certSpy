"use strict";

var rootCertStats = {};
var tabInfo = {};

/*
On an onHeadersReceived event, if there was a successful TLS connection
established, fetch the root cert and look at its subject.

If we haven't seen this subject before, add it. If we have, increment its stats.
*/
async function logRootCert(details) {
  
  
  //if( details.documentUrl){
    //return{cancel:true};
  //}
  //console.log(url, details.documentUrl);

  //return {redirectUrl: url}
  //return {cancel: true};
  try {
    let securityInfo = await browser.webRequest.getSecurityInfo(
      details.requestId,
      {"certificateChain": true}
    );
    if ((securityInfo.state == "secure" || securityInfo.state == "weak") &&
        !securityInfo.isUntrusted) {
      let rootName = securityInfo.certificates[securityInfo.certificates.length - 1].subject;
      if(! details.documentUrl){
        console.log(securityInfo);
      }
      if(! details.documentUrl){ 
        var t = await browser.tabs.get(details.tabId);
      if( rootName.startsWith("CN=DigiCert Global Root G2")){
        
        //prevent this CA from signing anything other than 
        /*var d = new URL(details.documentUrl).hostname;
        if( !d.endsWith("")){
          var url = browser.runtime.getURL("popup.html");
          return {redirectUrl:url}
        }*/
        
          console.log("change icon", details.tabId, t.windowId);
          tabInfo[details.tabId] = "alert";

          browser.browserAction.setIcon({path:"icons/alert-32.png", windowId:t.windowId });
        
      }else{
        tabInfo[details.tabId] = "";
        browser.browserAction.setIcon({path:"icons/icon-32.png", windowId:t.windowId });
      }
    }
      
      if (rootCertStats[rootName] === undefined) {
        rootCertStats[rootName] = 1;
      } else {
        rootCertStats[rootName] = rootCertStats[rootName] + 1;
      }
    }
  }
  catch(error) {
    console.error(error);
  }
}

/*
Listen for all onHeadersReceived events.
*/
browser.webRequest.onHeadersReceived.addListener(logRootCert,
  {urls: ["<all_urls>"]},
  ["blocking"]
);

browser.tabs.onActivated.addListener((active)=>{
  //look up state...
  if( tabInfo[active.tabId] == "alert"){
    browser.browserAction.setIcon({path:"icons/alert-32.png", windowId:active.windowId });
  }else{
    browser.browserAction.setIcon({path:"icons/icon-32.png", windowId:active.windowId });
  }
  
});
