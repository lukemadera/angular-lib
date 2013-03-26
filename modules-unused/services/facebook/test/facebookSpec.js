//@todo
describe('srvcFacebook', function () {
	var elm, scope, $compile;
	
  beforeEach(module('ui'));
	
	/**
	@param params
		@param searchText {String}
		@param noLoadMore {Boolean} true if want to set load-more to 0
	*/
	var createElm =function(params) {
		
		$compile(elm)(scope);
		scope.$digest();
	};
	
  beforeEach(inject(function(_$rootScope_, _$compile_) {
		$compile = _$compile_;
    scope = _$rootScope_.$new();
  }));
	
	afterEach(function() {
		angular.module('ui.config').value('ui.config', {}); // cleanup
	});
	
	it('should create the correct number of users pending what the search text is', function() {
	});
	
});