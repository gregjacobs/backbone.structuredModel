/*global _, Backbone */
/*jslint forin:true */
(function() {
		
	var OrigModel = Backbone.Model,
	    origSetMethod = Backbone.Model.prototype.set,
	    origGetMethod = Backbone.Model.prototype.get;
	
	
	// Override the Backbone.Model constructor
	Backbone.Model = function( attributes, options ) {
		this.initFields();
		
		OrigModel.apply( this, arguments );
	};
	
	// Re-apply static properties to the new Backbone.Model constructor
	for( var staticProp in OrigModel ) {
		if( OrigModel.hasOwnProperty( staticProp ) ) {
			Backbone.Model[ staticProp ] = OrigModel[ staticProp ];
		}
	}
	
	// Fix prototype
	Backbone.Model.prototype = OrigModel.prototype;
	
	// Now apply new prototype methods to Backbone.Model
	_.extend( Backbone.Model.prototype, {
		
		/**
		 * Initializes the Model's fields by walking up the prototype chain from the current Model subclass
		 * up to this (the base) class, collecting their 'addFields' properties, and combining them into one single
		 * 'fields' hash.
		 * 
		 * @private
		 * @method initFields
		 */
		initFields : function() {
			this.fields = {};
			
			// Define concatenated fields array from all subclasses
			var fieldsObjects = [],
			    currentConstructor = this.constructor,
			    currentProto = currentConstructor.prototype,
			    i, len;
			
			// Walk up the prototype chain from the current object, collecting 'addFields' arrays as we go along
			do {
				if( currentProto.hasOwnProperty( 'addFields' ) && _.isArray( currentProto.addFields ) ) {    // skip over any prototype that doesn't define 'addFields' itself
					fieldsObjects = fieldsObjects.concat( currentProto.addFields );
				}
			} while( ( currentConstructor = ( currentProto = currentConstructor.__super__ ) && currentProto.constructor ) );  // extra parens to get jslint to stop complaining about an assignment in the test expression
			
			// After we have the array of fields, go backwards through them, which allows fields from subclasses to override those in superclasses
			for( i = fieldsObjects.length; i--; ) {
				var field = new Backbone.Field( fieldsObjects[ i ] );
				this.fields[ field.getName() ] = field;
			}
		},
				
		
		/**
		 * Overridden set() method, to check the presence of the Fields (attribute names) before allowing a set.
		 * 
		 * @method set
		 * @param {Object} attrs
		 */
		set : function( attrs ) {
			for( var attr in attrs ) {
				if( !( attr in this.fields ) ) {
					throw new Error( "Backbone.Model::set(): A field (attribute) with the name '" + attr + "' was not found." );
				}
			}
			
			// No error, call original set method
			return origSetMethod.apply( this, arguments );
		},
	
		
		/**
		 * Overridden get() method, to check the presence of the Fields (attribute names) before allowing a get.
		 * 
		 * @method get
		 * @param {String} attr
		 */
		get : function( attr ) {
			if( !( attr in this.fields ) ) {
				throw new Error( "Backbone.Model::get(): A field (attribute) with the name '" + attr + "' was not found." );
			}
			
			// No error, call original get method
			return origGetMethod.apply( this, arguments );
		},
		
		
		/**
		 * Overridden has() method, which redefines it to determine if the Model has a Field. 
		 * 
		 * The original implementation is fairly useless; if the field exists, we can always retrieve the value 
		 * and test to see if it is undefined or null (or whatever else we want to test it against, such as for any
		 * falsy value). Testing for both undefined and null in the original implementation makes little sense anyway, 
		 * as a Model can have an attribute that references another object, but just happens to be null at the time.
		 * This in no way, shape, or form, constitutes the model "not having" an attribute. 
		 * 
		 * @method has
		 * @param {String} fieldName
		 * @return {Boolean}
		 */
		has : function( fieldName ) {
			return !!this.fields[ fieldName ];
		}
		
	} );
		
	
	
	/**
	 * @class Backbone.Field
	 * 
	 * Field definition object for Models. The Field itself does not store data, but instead simply
	 * defines the behaviors of a Model's fields. 
	 * 
	 * @constructor
	 * @param {String} config The field object's config, which is its definition. Can also be its field name provided directly as a string.
	 */
	Backbone.Field = function( config ) {
		// If the argument wasn't an object, it must be its field name
		if( typeof config !== 'object' ) {
			config = { name: config };
		}
		
		// Copy members of the field definition (config) provided onto this object
		for( var prop in config ) {
			this[ prop ] = config[ prop ];
		}
		
		// Each Field must have a name.
		var name = this.name;
		if( name === undefined || name === null || name === "" ) {
			throw new Error( "no 'name' property provided to Backbone.Model Field" );
		}
	};
	
	_.extend( Backbone.Field.prototype, {
		
		/**
		 * @cfg {String} name (required)
		 * The name for the field, which is used by the owner Model to reference it.
		 */
		name : "",
		
		/**
		 * Retrieves the name of the field.
		 * 
		 * @method getName
		 * @return {String}
		 */
		getName : function() {
			return this.name;
		}
		
	} );
	
	
})();