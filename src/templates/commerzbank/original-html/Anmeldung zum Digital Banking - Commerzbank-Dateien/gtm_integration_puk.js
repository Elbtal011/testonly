  // for PUK_PROD_BOTH
  var gtmScriptincludeVersion = "2.4";
  // Push "Google Analytics ID" in data layer
              window.uaID = 'UA-76726625-1';  // set static to PUK PROD
        
              (window.dataLayer = window.dataLayer || []).push({
                  'uaID': window.uaID
              });


  if (window.cookieBox && window.cookieBox.isInitialised) {
      initGTM();
  } else {
      window.addEventListener('consents_initialized', function () {
          initGTM();
      })
  }

  function initGTM() {
    //Push "GTM Custom Template Restrictions" in data layer
    function gtag() {
        dataLayer.push(arguments);
    }
    // Push "GTM Start Event" in data layer
    (window.dataLayer = window.dataLayer || []).push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
    });
    // Predefined Function to get specific URL parameter
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    // Get Main Domain
    var domainParts = document.location.host.split('.');
    var mainDomain = '.' + domainParts[domainParts.length - 2] + '.' + domainParts[domainParts.length - 1];
    // Predefined Function to set Cookie
    function setCookie(name, value, days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = '; expires=' + date.toGMTString();
        document.cookie = name + '=' + value + expires + ';domain=' + mainDomain + '; path=/';
    }
    //Predefined Affiliate OptOut Function
    function affiliateOptOut() {
        setCookie('affiliateOptOut', 'true', 1095);
        document.cookie = 'afid=deleted; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=' + mainDomain + '; path=/;';
        document.cookie = 'afid=deleted; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=www' + mainDomain + '; path=/;';
        window.confirm('Ihr Widerruf wurde erfolgreich mit Wirkung für die Zukunft umgesetzt.')
    }

    // Set Affiliate ID into Cookie
    var afid = getUrlParameter('afid');
    var cookieList = document.cookie;
    if (afid != '' & cookieList.indexOf('affiliateOptOut') == -1) {
        setCookie('afid', afid, 60);
    }


    //Set Template-ID for Tag Management Service: mIEB9cNKW
    var consent = window.cookieBox.getConsents('Tag Management');

    var default_gtm_id = 'GTM-N6W8QC';  
    // //provisional fix start
    // var closedAreaRule = '.*(\/portal\/de\/system\/logout|\/lp\/login|\/lp\/approval\/start|\/startpage|\/banking|\/dailybanking|\/digitalbanking|\/mypostbox|\/_next|\/digitalassistant|\/wpfe|\/chat|\/kontoservices\/antrag|\/kontoservices\/pk|\/kontoservices\/uk|\/kredit\/ratenkredit\-kunden|\/kservice\/anfrage\-kunden|\/digitalconsent).*';

    // if (  curUrl.match(closedAreaRule)  ) {
    //     default_gtm_id = "GTM-PMKT8F";   //closed
    //     } 
    //  //provisional fix end
    // if ((window && window.gtmAreaCode && window.gtmAreaCode === 1)) {
    //     default_gtm_id = "GTM-PMKT8F";
    // }
    


    if (consent.consentStatus) {
      loadGTM();
    } else {
      // new for FK
      dataLayer.push = function (n) {
          //Basic Object Push
          dataLayer[this.length] = n;
          //GTM Integration
          if (n["event"] == "all_consents_given_status") {
              var consent = window.cookieBox.getConsents("Tag Management");
              if (consent.consentStatus) {
                loadGTM()
              }
      }
  }  
    }

    function loadGTM(){
        // Include GTM
        //window.gtmId = window.googleTrackingGTM || default_gtm_id;
        window.gtmId = default_gtm_id;
        (function (w, d, s, l, i) {
            var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src = '//tp.commerzbank.de/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', window.gtmId);
    }
  }
