/**
 * This view illustrates how to use the StepWizardControl in SplunkJS. To use this control in a SplunkJS view of your own, you will need to:
 * 
 * In your HTML:
 *   1) Add the "wizard-content" class to the DIV tag of each page of the wizard
 *   2) Add an unique ID for the DIV tag of each page of the wizard (so that each wizard page can be uniquely referenced)
 *   3) Create a DIV tag with an ID of "step-control-wizard" for where you want the wizard controls to appear
 *   
 * In your Javascript view:
 *   4) Make sure to add StepWizardControl to your require statement
 *   5) Copy in the createStep() and setupStepWizard() functions from this class
 *   6) Create a function that will populate the steps; much like the initializeSteps() function in this example
 *   7) Modify your render() call such that it initializes the steps; e.g. initializeSteps() in this example
 *   8) Modify your render() call such that it creates the step wizard using the setupStepWizard() function with the first argument being the step (based on whatever you named it via the "value" attribute) you want the wizard to start in. 
 *		Note: setupStepWizard() must be called after you initialize the steps
 *      Note: make sure to call setupStepWizard() with the correct initial step; otherwise, you will get an error
 *   9) Optionally, make a validateStep() function to control whether the user can go to the next step. See validateStep() in this example.
 */



require.config({
    paths: {
        "text": "../app/step_control_wizard/js/lib/text"
    }
});

define([
    'underscore',
    'backbone',
    'splunkjs/mvc',
    'splunkjs/mvc/utils',
    'jquery',
    'splunkjs/mvc/simplesplunkview',
    'views/shared/controls/StepWizardControl',
    'text!../app/step_control_wizard/js/templates/StepControlWizardExampleView.html'
], function(_, Backbone, mvc, utils, $, SimpleSplunkView, StepWizardControl, StepControlExampleTemplate) {

    // Define the custom view class
    var StepControlWizardExample = SimpleSplunkView.extend({
        className: 'StepControlWizardExample',

        /**
         * Initialize the class.
         * 
         * For the steps, we need to instantiate a model with the steps
         */
        initialize: function() {
            // Make the model that will store the steps
            this.steps = new Backbone.Collection();
            
        },
        
        /**
         * Validate that changing steps is allowed.
         */
        validateStep: function(selectedModel, isSteppingNext){
        	
        	// Stop if we are on the ingredients step and the checkbox isn't checked
        	if(selectedModel.get("value") === 'ingredients' && !$("#have-ingredients", this.$el).is(":checked")){
        		alert("Check the checkbox when you have the ingredients!");
        		return false;
        	}
        	else{
        		return true;
        	}
        },
        
        /**
         * This is a helper function to create a step.
         */
        createStep: function(step) {
        	
            // Make the model that will store the steps if it doesn't exist yet
        	if(this.steps === undefined){
        		this.steps = new Backbone.Collection();
        	}
            
        	// This is the instance of your new step
            var newStep = {
                label: _(step.label).t(),
                value: step.value,
                showNextButton: step.showNextButton !== undefined ? step.showNextButton : true,
                showPreviousButton: step.showPreviousButton !== undefined ? step.showPreviousButton : true,
                showDoneButton: step.showDoneButton !== undefined ? step.showDoneButton : false,
                doneLabel: step.doneLabel || 'Done',
                enabled: true,
                panelID: step.panelID,
                validate: function(selectedModel, isSteppingNext) {
                	
                    var promise = $.Deferred();
                    
                    // Get the response from the validation attempt (if a validateStep function is defined)
                    var validation_response = true;
                    
                    if(this.hasOwnProperty('validateStep')){
                    	validation_response = this.validateStep(selectedModel, isSteppingNext);
                    }
                    
                    // Based on the validation action, reject or resolve the promise accordingly to let the UI know if the user should be allowed to go to the next step
                    if(validation_response === true){
                    	promise.resolve();
                    }
                    else if(validation_response === false){
                    	promise.reject();
                    }
                    else{
                    	return validation_response; // This is a promise
                    }
                    
                    return promise;
                    
                }.bind(this),
            };

            return newStep;
        },

        /**
         * Make the steps.
         */
        initializeSteps: function(){
        	
        	var c = 0;
        	
            // Make the model that will store the steps
            this.steps = new Backbone.Collection();
        	
            // Create the steps
            
        	// Step 1
            this.steps.add(this.createStep({
                label: 'Ingredients',
                value: 'ingredients',
                showNextButton: true,
                showPreviousButton: false,
                panelID: "#wizard-content-1"
            }), {at: ++c});

            // Step 2
            this.steps.add(this.createStep({
                label: 'Peanut butter',
                value: 'peanut_butter',
                showNextButton: true,
                showPreviousButton: true,
                panelID: "#wizard-content-2"
            }), {at: ++c}); 
            
            // Step 3
            this.steps.add(this.createStep({
                label: 'Jelly',
                value: 'jelly',
                showNextButton: true,
                showPreviousButton: true,
                panelID: "#wizard-content-3"
            }), {at: ++c}); 
            
            // Step 4
            this.steps.add(this.createStep({
                label: 'Assemble',
                value: 'assemble',
                showNextButton: true,
                showPreviousButton: true,
                panelID: "#wizard-content-4"
            }), {at: ++c}); 
            
            // Step 5
            this.steps.add(this.createStep({
                label: 'Enjoy',
                value: 'enjoy',
                showNextButton: false,
                showPreviousButton: true,
                showDoneButton: true,
                panelID: "#wizard-content-5"
            }), {at: ++c});  
        },
        
        /**
         * Setup the step wizard.
         */
        setupStepWizard: function(initialStep){
        	
        	var wizard = new Backbone.Model({
                'currentStep': initialStep
              });

              wizard.on('change:currentStep', function(model, currentStep) {
                  this.steps.map((step) => {
                      step.stopListening();
                  });
                  
                  // Find the associated step model
                  var step = this.steps.find(function(step) {
                      return step.get('value') == currentStep;
                  });

                  // Show or hide the next button as necessary
                  if (step.get('showNextButton')) {
                      $('button.btn-next', this.$el).show();
                  } else {
                      $('button.btn-next', this.$el).hide();
                  }

                  // Show or hide the previous button as necessary
                  if (step.get('showPreviousButton')) {
                      $('button.btn-prev', this.$el).show();
                  } else {
                      $('button.btn-prev', this.$el).hide();
                  }

                  // Show or hide the done button as necessary
                  if (step.get('showDoneButton')) {
                      $('button.btn-finalize', this.$el).show();
                      $('button.btn-finalize', this.$el).text(step.get('doneLabel'));
                  } else {
                      $('button.btn-finalize', this.$el).hide();
                  }

                  // Hide all of the existing wizard views
                  $(".wizard-content", this.$el).hide();
                  
                  // Show the next panel
                  $(step.get('panelID'), this.$el).show();
                  
              }.bind(this));
              
              // This is just the initial hidden step
              this.steps.unshift({
                  label: "",
                  value: 'initial',
                  showNextButton: false,
                  showPreviousButton: false,
                  enabled: false,
              });
              
              // Create the step wizard control
              this.stepWizard = new StepWizardControl({
                  model: wizard,
                  modelAttribute: 'currentStep',
                  collection: this.steps,
              });
              
              // Render the step wizard
              $('#step-control-wizard', this.$el).append(this.stepWizard.render().el);
              
              // Hide all of the existing wizard views
              $(".wizard-content", this.$el).hide();
              
              // Go the initial step: find it first
              var initialStep = this.steps.find(function(step) {
                  return step.get('value') == initialStep;
              });
              
              // ... now show it
              $(initialStep.get('panelID'), this.$el).show();
              
              // Go to step one
              this.stepWizard.step(1);
        },
        
        /**
         * Render the editor.
         */
        render: function() {
        	
        	// Apply the template
            this.$el.html(StepControlExampleTemplate);
            
            // Initialize the steps model
            this.initializeSteps();
            
            // Create the step wizard and set the initial step as the "ingredients" step
            this.setupStepWizard('ingredients');
            
        },
    });

    return StepControlWizardExample;
});
