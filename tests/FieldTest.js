/*global window, jQuery, module, test, strictEqual, notStrictEqual, Backbone */
jQuery( document ).ready( function() {
	
	module( "Backbone.Field" );
	
	
	// Unit tests
	
	test( "Adding a defaultValue to a Field should add a `defaults` property to the Model if it doesn't already have one", function() {
		var MockModel = function() {},
		    mockModelInstance = new MockModel();
		
		var field1 = new Backbone.Field( {
			model : mockModelInstance,
			name  : 'field1',
			defaultValue : 'value1'
		} );
		
		strictEqual( mockModelInstance.defaults.field1, 'value1', "The `defaults` property should have been added with the correct defaultValue" );
	} );
	
	
	test( "Adding 2 fields with defaultValues should add a `defaults` property, and then amend it on the Model if it doesn't already have one", function() {
		var MockModel = function() {},
		    mockModelInstance = new MockModel();
		
		var field1 = new Backbone.Field( {
			model : mockModelInstance,
			name  : 'field1',
			defaultValue : 'value1'
		} );
		var origDefaultsObject = mockModelInstance.defaults;
		
		var field2 = new Backbone.Field( {
			model : mockModelInstance,
			name  : 'field2',
			defaultValue : 'value2'
		} );
		
		// Make sure the original defaults object created by field1 is the same one that was modified by field2
		strictEqual( origDefaultsObject, mockModelInstance.defaults, "The same `defaults` object created by adding field1 should have been used by field2." );
		
		// Make sure both default values were added
		strictEqual( mockModelInstance.defaults.field1, 'value1', "The `defaults` property should have been added with the correct defaultValue for field1" );
		strictEqual( mockModelInstance.defaults.field2, 'value2', "The `defaults` property should have been added with the correct defaultValue for field2" );
	} );
	
	
	test( "Adding a field with a defaultValue should use other defaults provided in the `defaults` property (from the original Backbone.Model), but not modify the prototype `defaults`", function() {
		var MockModel = function() {};
		MockModel.prototype.defaults = { field1: 'value1' };
		
		var mockModelInstance = new MockModel();
		var origDefaultsObject = mockModelInstance.defaults;  // the prototype `defaults` object in this case
		
		var field2 = new Backbone.Field( {
			model : mockModelInstance,
			name  : 'field2',
			defaultValue : 'value2'
		} );
		
		// Make sure we don't modify the prototype's `defaults` property. A new, owned `defaults` property should be created.
		notStrictEqual( origDefaultsObject, mockModelInstance.defaults, "Backbone.Field is accidentally changing the `defaults` property on the prototype." );
		
		// Make sure both default values exist; one from the `defaults` object, and the second from the Backbone.Field
		strictEqual( mockModelInstance.defaults.field1, 'value1', "The original prototype `defaults` property should have been used for field1" );
		strictEqual( mockModelInstance.defaults.field2, 'value2', "The `defaults` property should have been modified with the correct defaultValue for field2" );
	} );
	
	
	// ----------------------------
	
	
	// Integration tests
	
	test( "Using defaultValue on a field should provide the default value after Model instantiation", function() {
		var MyModel = Backbone.Model.extend( {
			addFields: [
				{ name : 'field1', defaultValue: 'value1' },
				{ name : 'field2' }, // no default value for this one, just as a test
				{ name : 'field3', defaultValue: 'value3' }
			]
		} );
		
		
		var model = new MyModel();
		strictEqual( model.get( 'field1' ), 'value1', "field1's defaultValue should have been applied" );
		strictEqual( model.get( 'field2' ), undefined, "No defaultValue should have been applied for field2's" );
		strictEqual( model.get( 'field3' ), 'value3', "field3's defaultValue should have been applied" );
	} );
	
} );