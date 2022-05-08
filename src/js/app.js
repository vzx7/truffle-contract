App = {
  web3Provider: null,
  contracts: {},
  // if debuging
  IS_GANACHE: true,

  init: async function() {
    // Load pets.
    $.getJSON('../funds.json', function(data) {
      var fundsRow = $('#fundsRow');
      var fundTemplate = $('#fundTemplate');

      for (i = 0; i < data.length; i ++) {
        fundTemplate.find('.panel-title').text(data[i].name);
        fundTemplate.find('img').attr('src', data[i].picture);
        fundTemplate.find('.fund-address').text(data[i].address);
        fundTemplate.find('.btn-donate').attr('data-id', data[i].id);
        fundTemplate.find('.btn-donate').attr('data-address', data[i].address);

        fundsRow.append(fundTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (!App.IS_GANACHE && window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (!App.IS_GANACHE && window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('ZVToken.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var ZVTokenArtifact = data;
      App.contracts.ZVToken = TruffleContract(ZVTokenArtifact);
    
      // Set the provider for our contract
      App.contracts.ZVToken.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-donate', App.sendFunds);
  },

  getTransctionCount: function() {
    var ZVTokenInstance;

    App.contracts.ZVToken.deployed().then(function(instance) {
      ZVTokenInstance = instance;
    
      return ZVTokenInstance.getTransctionCount.call();
    }).then(function(count) {
      //TODO реализовать
/*       for (i = 0; i < tokens.length; i++) {
        if (tokens[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      } */
    }).catch(function(err) {
      console.log(err.message);
      App.errorHandler('getTransctionCount', err.message);
    });
  },

  sendFunds: function(event) {
    event.preventDefault();

    var address = $(event.target).data('address');

    var ZVTokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
    
      App.contracts.ZVToken.deployed().then(function(instance) {
        ZVTokenInstance = instance;
    
        // Execute adopt as a transaction by sending account
        return ZVTokenInstance.sendFunds(address, 10, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
        App.errorHandler('sendFunds', err.message);
      });
      App.getBalanceOwner(account);
    });
  },
  
  getBalanceOwner: function(account) {
    App.contracts.ZVToken.deployed().then(function(instance) {
      ZVTokenInstance = instance;
      return ZVTokenInstance.balanceOf(account);
    }).then(function(result) {
      console.log(result);
      $(".myAddress").text(account);
      $(".myBalance").text(result.c[0]);
    }).catch(function(err) {
      console.log(err.message);
      App.errorHandler('balanceOf', err.message);
    })
  },
  errorHandler(method, msg) {
    $("#errorLog").append(`<p> Method: ${method}(), error: ${msg}<\p>`);
  },
};



$(function() {
  $(window).load(function() {
    App.init();
  });
});
