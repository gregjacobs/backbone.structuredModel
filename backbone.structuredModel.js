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
				var fieldObj = fieldsObjects[ i ];
				
				// Normalize to a Backbone.Field configuration object if it is a string
				if( typeof fieldObj === 'string' ) {
					fieldObj = { name: fieldObj };
				}
				fieldObj.model = this;  // attach the model property
				
				var field = this.createField( fieldObj );
				this.fields[ field.getName() ] = field;
			}
		},
		
		
		/**
		 * Factory method which by default creates a {@link Backbone.Field}, but may be overridden by subclasses
		 * to create different {@link Backbone.Field} subclasses. 
		 * 
		 * @protected
		 * @method createField
		 * @param {Object} fieldObj The field object provided on the prototype. If it was a string, it will have been
		 *   normalized to the object `{ name: fieldName }`.
		 * @return {Backbone.Field}
		 */
		createField : function( fieldObj ) {
			return new Backbone.Field( fieldObj );
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
	 * @param {Object} config An object (hash) with the field object's configuration options, which is its definition. See the
	 *   configs in the prototype.
	 */
	Backbone.Field = function( config ) {		
		// Copy members of the field definition (config) provided onto this object
		for( var prop in config ) {
			this[ prop ] = config[ prop ];
		}
		
		var model = this.model,
		    name = this.name;
		
		// Each Field must have a name.
		if( name === undefined || name === null || name === "" ) {
			throw new Error( "no 'name' property provided to Backbone.Model Field" );
		}
		
		// Apply the default value if there is one
		if( 'defaultValue' in this ) {
			if( !model.hasOwnProperty( 'defaults' ) ) {
				// If `defaults` doesn't exist yet on the object itself, create that now. We don't want to
				// modify the prototype object.
				model.defaults = _.extend( {}, model.defaults );  // copy properties from the prototype `defaults`
			}
			model.defaults[ name ] = this.defaultValue;
		}
	};
	
	_.extend( Backbone.Field.prototype, {
		
		/**
		 * @hide
		 * @cfg {Backbone.Model} model (required)
		 * A reference back to the Model creating the Field. This is automatically added
		 * by {@link Backbone.Model#initFields}.
		 */
		
		/**
		 * @cfg {String} name (required)
		 * The name for the field, which is used by the owner Model to reference it.
		 */
		name : "",
		
		/**
		 * @cfg {Mixed} defaultValue
		 * Any default value that the Field (attribute) should have. This is so that default values
		 * can be added inline with Field definitions, and not in a separate `defaults` property. 
		 * 
		 * It also allows for subclasses to define defaults for their fields, which the regular 
		 * Backbone.Model `defaults` property does not allow.
		 */
		
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