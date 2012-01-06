/*global window, jQuery, module, test, strictEqual, raises, Backbone */
jQuery( document ).ready( function() {
	
	module( "Backbone.Model w/ Structured Fields" );
	
	test( "Fields should be created from the addFields property", function() {
		var Model = Backbone.Model.extend( {
			addFields : [
				'field1', 'field2'
			]
		} );
		
		var model = new Model();
		strictEqual( model.has( 'field1' ), true, "model should have a field 'field1'" );
		strictEqual( model.has( 'field2' ), true, "model should have a field 'field2'" );
		strictEqual( model.has( 'field3' ), false, "model should not have a field 'field3'" );
	} );
	
	
	test( "Fields should be inheritable from multiple subclasses", function() {
		var Model = Backbone.Model.extend( {
			addFields : [
				'field1', 'field2'
			]
		} );
		var SubModel = Model.extend( {
			addFields : [
				'field3'
			]
		} );
		
		var model = new SubModel();
		strictEqual( model.has( 'field1' ), true, "model should have a field 'field1'" );
		strictEqual( model.has( 'field2' ), true, "model should have a field 'field2'" );
		strictEqual( model.has( 'field3' ), true, "model should have a field 'field3'" );
		strictEqual( model.has( 'field4' ), false, "model should not have a field 'field4'" );
	} );
	
	
	test( "Fields should be inheritable, and not error from a subclass defining no 'addFields' of its own", function() {
		var Model = Backbone.Model.extend( {
			addFields : [
				'field1', 'field2'
			]
		} );
		var SubModel = Model.extend( {} );
		
		var model = new SubModel();
		strictEqual( model.has( 'field1' ), true, "model should have a field 'field1'" );
		strictEqual( model.has( 'field2' ), true, "model should have a field 'field2'" );
		strictEqual( model.has( 'field3' ), false, "model should not have a field 'field3'" );
	} );
	
	
	test( "Fields should be inheritable, and not error from a superclass definining no 'addFields' of its own", function() {
		var Model = Backbone.Model.extend( {} );
		var SubModel = Model.extend( {
			addFields : [
				'field1', 'field2'
			]
		} );
		
		var model = new SubModel();
		strictEqual( model.has( 'field1' ), true, "model should have a field 'field1'" );
		strictEqual( model.has( 'field2' ), true, "model should have a field 'field2'" );
		strictEqual( model.has( 'field3' ), false, "model should not have a field 'field3'" );
	} );
	
	
	test( "Fields should be inheritable, and not error from a class somewhere in the hierarchy definining no 'addFields' of its own", function() {
		var Model = Backbone.Model.extend( {
			addFields : [
				'field1', 'field2'
			]
		} );
		var SubModel = Model.extend( {} );
		var SubSubModel = SubModel.extend( {
			addFields : [
				'field3', 'field4'
			]
		} );
		
		var model = new SubSubModel();
		strictEqual( model.has( 'field1' ), true, "model should have a field 'field1'" );
		strictEqual( model.has( 'field2' ), true, "model should have a field 'field2'" );
		strictEqual( model.has( 'field3' ), true, "model should have a field 'field3'" );
		strictEqual( model.has( 'field4' ), true, "model should have a field 'field4'" );
		strictEqual( model.has( 'field5' ), false, "model should not have a field 'field5'" );
	} );
	
	
	// -----------------------
	
	// set() tests
	
	
	test( "set() should work correctly when setting a field that exists", function() {
		var Model = Backbone.Model.extend( {
			addFields : [
				'field1', 'field2'
			]
		} );
		
		var model = new Model();
		
		model.set( { 
			field1: 'value1'
		} ); 
		strictEqual( model.get( 'field1' ), 'value1', "The set() should have worked." );
	} );
	
	
	test( "set() should work correctly when setting multiple fields that exist", function() {
		var Model = Backbone.Model.extend( {
			addFields : [
				'field1', 'field2'
			]
		} );
		
		var model = new Model();
		
		model.set( { 
			field1: 'value1', 
			field2: 'value2' 
		} ); 
		strictEqual( model.get( 'field1' ), 'value1', "The set() for field1 should have worked." );
		strictEqual( model.get( 'field2' ), 'value2', "The set() for field2 should have worked." );
	} );
	
	
	test( "set() should throw an error when attempting to set a non-existent field", function() {
		var Model = Backbone.Model.extend( {
			addFields : [
				'field1', 'field2'
			]
		} );
		
		var model = new Model();
		
		raises(
			// block
			function() {
				model.set( { 
					field3: 'value3'
				} );
			}, 
			
			// expected
			function( ex ) {
				return ex.message === "Backbone.Model::set(): A field (attribute) with the name 'field3' was not found.";
			},
			
			// Message
			"The set() should have errored, trying to set a non-existent field"
		);
	} );
	
	
	test( "set() should throw an error when attempting to set a non-existent field, with other existing fields", function() {
		var Model = Backbone.Model.extend( {
			addFields : [
				'field1', 'field2'
			]
		} );
		
		var model = new Model();
		
		raises(
			// block
			function() {
				model.set( { 
					field1: 'value1',
					field2: 'value2',
					field3: 'value3'
				} );
			}, 
			
			// expected
			function( ex ) {
				return ex.message === "Backbone.Model::set(): A field (attribute) with the name 'field3' was not found.";
			},
			
			// Message
			"The set() should have errored, trying to set a non-existent field"
		);
	} );
	
	
	// -----------------------
	
	// get() tests
	
	test( "get() should properly retrieve a field that exists", function() {
		var Model = Backbone.Model.extend( {
			addFields : [
				'field1', 'field2'
			]
		} );
		
		var model = new Model();
		strictEqual( model.get( 'field1' ), undefined, "Should have returned undefined for an existent, but unset field." );
		
		model.set( { field1: 'value1' } );
		strictEqual( model.get( 'field1' ), 'value1', "Should have returned the value of the field." );
	} );
	
	
	test( "get() should throw an error when attempting to set a non-existent field", function() {
		var Model = Backbone.Model.extend( {
			addFields : [
				'field1', 'field2'
			]
		} );
		
		var model = new Model();
		
		raises(
			// block
			function() {
				var field3 = model.get( 'field3' );
			}, 
			
			// expected
			function( ex ) {
				return ex.message === "Backbone.Model::get(): A field (attribute) with the name 'field3' was not found.";
			},
			
			// Message
			"The get() should have errored, trying to get a non-existent field"
		);
	} );
	
	
} );