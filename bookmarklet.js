(function () {



  function main() {
    log('Hello', 'bookmarklet!');

    exportCSV()
  }


  function log() {
    if ('console' in window && 'log' in console) {
      log = function () {
        var args = Array.prototype.slice.apply(arguments);
        args.unshift('Bookmarklet:');
        console.log.apply(console, args);
      }
    }
  }

  function exportCSV() {
    const rootUrl = "https://api.finary.com";
    let csvString = "account_name,asset_name,symbol,current_price,buying_price,quantity,currency,type\n";
    var a = document.createElement('a');
    date = new Date().toISOString().replaceAll(/-|:|Z/g, "").replace("T", "_").substr(0, 15);
    a.download = `finary_${date}.csv`;
    document.body.appendChild(a);

    function printFiat(account, item, index) {
      myline = `${account['slug']},${item['fiat']['name']},${item['fiat']['code']},1.0,0,${item['quantity']},${item['fiat']['code']},FIAT\n`;
      csvString += myline;
    }

    function printSecurity(account, item, index) {
      myline = `${account['slug']},${item['security']['name']},${item['security']['isin']},${item['security']['display_current_price']},${item['display_buying_price']},${item['quantity']},${item['security']['display_currency']['code']},${item['security']['security_type']}\n`;
      csvString += myline;
    }

    function printCrowdlendings(account, item, index) {
      myline = `${account['slug']},${item['name']},${item['name']},${item['display_current_price']},${item['display_initial_investment']},1.0,${item['currency']['code']},CROWDLENDING\n`;
      csvString += myline;
    }

    function printCryptos(account, item, index) {
      myline = `${account['slug']},${item['crypto']['name']},${item['crypto']['code']},${item['display_current_price']},${item['display_buying_price']},${item['quantity']},${item['buying_price_currency']['code']},CRYPTO\n`;
      csvString += myline;
    }

    function printFondEuro(account, item, index) {
      myline = `${account['slug']},${item['name']},,${item['display_current_price']},0.0,1.0,${item['currency']['code']},FOND_EURO\n`;
      csvString += myline;
    }

    function printPreciousMetal(account, item, index) {
      myline = `${account['slug']},${item['precious_metal']['name']},,${item['precious_metal']['display_current_price']},${item['display_buying_price']},${item['quantity']},${item['precious_metal']['currency']['code']},PRECIOUS_METAL\n`;
      csvString += myline;
    }

    function printStartup(account, item, index) {
      myline = `${account['slug']},${item['startup']['name']},,${item['display_user_estimated_price']},${item['display_buying_price']},${item['shares']},${item['currency']['code']},STARTUP\n`;
      csvString += myline;
    }

    function printSCPI(account, item, index) {
      myline = `${account['slug']},${item['scpi']['name']},,${item['scpi']['display_current_price']},${item['display_buying_price']},${item['shares']},${item['scpi']['currency']['code']},${item['scpi']['scpi_type']}\n`;
      csvString += myline;
    }

    function printGenericAsset(account, item, index) {
      myline = `${account['slug']},${item['name']},,${item['display_current_price']},${item['display_buying_price']},${item['quantity']},${item['currency']['code']},${item['category']}\n`;
      csvString += myline;
    }

    function printRealEstate(account, item, index) {
      myline = `${account['slug']},${item['slug']},,${item['display_current_value']},${item['display_buying_price']},1.0,${account['currency']['code']},REAL_ESTATE\n`;
      csvString += myline;
    }

    function printAccount(account) {
      account['fiats'].forEach(printFiat.bind(null, account));
      account['securities'].forEach(printSecurity.bind(null, account));
      account['crowdlendings'].forEach(printCrowdlendings.bind(null, account));
      account['cryptos'].forEach(printCryptos.bind(null, account));
      account['fonds_euro'].forEach(printFondEuro.bind(null, account));
      account['precious_metals'].forEach(printPreciousMetal.bind(null, account));
      account['startups'].forEach(printStartup.bind(null, account));
      account['scpis'].forEach(printSCPI.bind(null, account));
      account['generic_assets'].forEach(printGenericAsset.bind(null, account));
      account['real_estates'].forEach(printRealEstate.bind(null, account));
    }

    function saveCsv() {
      let blob = new Blob([csvString], { type: 'text/csv' });
      a.href = URL.createObjectURL(blob);
      a.addEventListener('click', (e) => {
        setTimeout(() => URL.revokeObjectURL(e.target.href), 30 * 1000);
      });
      a.click();
      a.parentNode.removeChild(a);
    }


    window.Clerk.session.getToken().then(
      function (value) {
        let token = value;
        let organisationUrl = `${rootUrl}/users/me/organizations`;
        const req = new XMLHttpRequest();
        req.withCredentials = true;
        req.addEventListener("load", function () {
          let orgResponse = JSON.parse(this.responseText);
          let organisationId = orgResponse['result'][0]['id'];
          const accountsUrl = `${rootUrl}/organizations/${organisationId}/holdings_accounts`;
          const reqAccounts = new XMLHttpRequest();
          reqAccounts.withCredentials = true;
          reqAccounts.addEventListener("load", function () {
            let accountsResponse = JSON.parse(this.responseText);
            let result = accountsResponse['result'];
            result.forEach(printAccount);
            saveCsv()
          });
          reqAccounts.open("GET", accountsUrl);
          reqAccounts.setRequestHeader("x-finary-client-id", "webapp");
          reqAccounts.setRequestHeader("accept", "application/json, text/plain, */*");
          reqAccounts.setRequestHeader("authorization", "Bearer " + token);
          reqAccounts.send();
        });
        req.open("GET", organisationUrl);
        req.setRequestHeader("x-finary-client-id", "webapp");
        req.setRequestHeader("accept", "application/json, text/plain, */*");
        req.setRequestHeader("authorization", "Bearer " + token);
        req.send();
      },
    )
  }


  main();

})();