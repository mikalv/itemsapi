var should = require('should');
var sinon = require('sinon');
var assert = require('assert');
var setup = require('./../mocks/setup');

setup.makeSuite('add data service', function() {

  var dataService = require('./../../src/services/data');
  var projectService = require('./../../src/services/project');
  var elasticData = require('./../../src/elastic/data');

  beforeEach(function(done) {
    projectService.ensureCollection({
      projectName: 'test',
      collectionName: 'city'
    }, function(err, res) {
      assert.equal(err, null);
      done();
    });
  });

  // temporary not working - need to change all callbacks to promises
  xit('should add documents (batch) successfully', function(done) {
    var doc = {
      rating: 6,
      name: 'Berlin'
    };

    var spy = sinon.spy(elasticData, 'addDocuments');
    dataService.addDocumentsAsync({
      projectName: 'test',
      collectionName: 'city',
      body: [doc, doc, doc, doc],
    })
    .then(function(res) {
      //assert.equal(err, null);
      //assert.equal(res.items.length, 4);
      assert.equal(res.ids.length, 4);
      assert(spy.calledOnce);
      assert(spy.calledWithMatch({index: 'test'}));
      assert(spy.calledWithMatch({type: 'city'}));
      done();
    });
  });

  it('should add all documents with configuration successfully', function(done) {
    var doc = {
      rating: 6,
      name: 'Berlin'
    };

    var spy = sinon.spy(dataService, 'addDocuments');
    dataService.addAllDocuments({
      projectName: 'test',
      collectionName: 'city',
      body: [doc, doc],
    }, function(err, res) {
      assert.equal(err, null);
      assert(spy.calledOnce);
      assert(spy.firstCall.calledWithMatch({projectName: 'test'}));
      assert(spy.firstCall.calledWithMatch({collectionName: 'city'}));

      dataService.addDocuments.restore();
      done();
    });
  });

  it('should add more documents successfully', function(done) {
    var doc = {
      rating: 6,
      name: 'France'
    };

    var data = {
      projectName: 'test',
      collectionName: 'city',
      batchSize: 4,
      body: [doc, doc, doc, doc, doc, doc, doc, doc, doc, doc],
    }

    var spy = sinon.spy(dataService, 'addDocuments');
    dataService.addAllDocuments(data, function(err, res) {
      assert.equal(err, null);
      assert.equal(spy.callCount, 3);
      assert(spy.firstCall.calledWithMatch({projectName: 'test'}));
      assert(spy.firstCall.calledWithMatch({collectionName: 'city'}));
      assert(spy.firstCall.calledWith(sinon.match({collectionName: 'city'})));
      dataService.addDocuments.restore();
      done();
    })
  });

  it('should add document successfully', function(done) {

    var spy = sinon.spy(elasticData, 'addDocument');
    dataService.addDocumentAsync({
      projectName: 'test',
      collectionName: 'city',
      body: {rating: 5, name: 'Berlin', id: 5},
    }).then(function(res) {
      //assert.equal(err, null);
      assert.equal(spy.callCount, 1);
      assert(spy.firstCall.calledWithMatch({index: 'test'}));
      assert(spy.firstCall.calledWithMatch({type: 'city'}));
      assert(spy.firstCall.calledWithMatch({id: 5}));
      assert(spy.firstCall.calledWith(sinon.match({type: 'city'})));
      elasticData.addDocument.restore();
      done();
    });
  });

  it('should get document successfully', function(done) {

    var spy = sinon.spy(elasticData, 'getDocument');
    dataService.getDocument({
      projectName: 'test',
      collectionName: 'city',
      id: 5
    }, function(err, res) {
      assert.equal(err, null);
      assert.equal(spy.callCount, 1);
      assert(spy.firstCall.calledWithMatch({index: 'test'}));
      assert(spy.firstCall.calledWithMatch({type: 'city'}));
      assert(spy.firstCall.calledWithMatch({id: 5}));
      elasticData.getDocument.restore();
      done();
    });
  });
});
