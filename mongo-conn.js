if (Meteor.isClient) {
  var queryESonTemplateInstance = function (query, templateInstance) {
    Meteor.call('queryES', query, function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      templateInstance.searchStatus.set(result.status);
      templateInstance.searchResult.set(result.status === 'success' ? result.result : result.reason);
    });
  };

  Template.hello.onCreated(function (){
    this.searchStatus = new ReactiveVar('pending');
    this.searchResult = new ReactiveVar("Waiting for response from server...");
    //queryESonTemplateInstance('', this);
  });

  Template.hello.helpers({
    isSearchSuccessful: function() {
      return Template.instance().searchStatus.get() === 'success';
    },
    searchResult: function () {
      return Template.instance().searchResult.get();
    }
  });

  Template.hello.events({
    'click button': function () {
      var query = ''; // TODO: read value from input box
      queryESonTemplateInstance(query, Template.instance());
    }
  });
}

if (Meteor.isServer) {
  BrowserPolicy.content.allowOriginForAll('localhost:9200');
  Meteor.startup(function () {
    // code to run on server at startup
  });
  Meteor.methods({
    queryES: function(query) {
      try {
        var response = HTTP.get("http://localhost:9200/test/_search/");
        return {
          status: response.statusCode === 200 ? "success" : 'failed',
          result: response.content
        };
      } catch (e) {
        console.log("Elastic serach error: " + e);
        return {
          status: 'failed',
          reason: "Search error."
        };
      }
    }
  });
}
