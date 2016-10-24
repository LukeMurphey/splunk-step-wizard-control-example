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
         * Setup the defaults
         */
        defaults: {
        	
        },

        initialize: function() {
            // Apply the defaults
            this.options = _.extend({}, this.defaults, this.options);
            
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
         * Create a step.
         */
        createStep: function(step) {
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
                    
                    if(this.validateStep(selectedModel, isSteppingNext)){
                    	promise.resolve();
                    }
                    else{
                    	promise.reject();
                    }
                    
                    
                    /*
                    if (isSteppingNext) {
                        updatedSearchPromise = view.onNext();
                    } else {
                        updatedSearchPromise = view.onPrev();
                    }
                    
                    $.when(updatedSearchPromise, view).then(function(updatedSearch, view) {
                        promise.resolve();
                    }.bind(this), function(msg) {
                        promise.reject(msg);
                    });
                    */
                    
                    
                    return promise;
                	
                	/*
                    var view = selectedModel.get('view');
                    var promise = $.Deferred();
                    var updatedSearch = null;
                    if (isSteppingNext) {
                        updatedSearchPromise = view.onNext();
                    } else {
                        updatedSearchPromise = view.onPrev();
                    }
                    $.when(updatedSearchPromise, view).then(function(updatedSearch, view) {
                        promise.resolve();
                    }.bind(this), function(msg) {
                        promise.reject(msg);
                    });
                    return promise;
                    */
                }.bind(this),
            };

            return newStep;
        },

        /**
         * Make the steps.
         */
        initializeSteps: function(){
        	
        	var c = 0;
        	
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
              
              // Create the step wizar control
              this.stepWizard = new StepWizardControl({
                  model: wizard,
                  modelAttribute: 'currentStep',
                  collection: this.steps,
              });
              
              // Render the step wizard
              $('#step-control-wizard', this.$el).append(this.stepWizard.render().el);
              
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
            
            // Hide the wizard content views; the step wizard will show them when necessary
            $(".wizard-content", this.$el).hide();
            
            // Initialize the steps model
            this.initializeSteps();
            
            // Create the step wizard and set the initial step as the "bread" step
            this.setupStepWizard('ingredients');
            
        },
    });

    return StepControlWizardExample;
});
