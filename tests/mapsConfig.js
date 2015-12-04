define([
    'chai',
    'services/mapsConfig'
], function(chai) {
    var expect = chai.expect;
    describe('mapconfig service', function() {
        var service;

        beforeEach(function() {
            // retrieve a reference to the service to test
            service = Box.Application.getServiceForTest('mapsConfig');
        });

        describe('doSomething()', function() {

            it("should return 3.02 for given points", function(done) {
                function round(value, decimals) {
                    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
                }
                var pointA = {
                    lat:28.444225,
                    lng:77.043209
                };
                var pointB = {
                    lat:28.468243,
                    lng:77.057579
                };
                var distance = round(service.distanceBetweenPoints(pointA, pointB), 2);
                expect(distance, "same distance bro").to.equal(3.02);

                done();
            });
        });
    });
});
