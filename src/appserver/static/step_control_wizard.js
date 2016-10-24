require.config({
    paths: {
    	step_control_wizard_view: '../app/step_control_wizard/js/views/StepControlWizardExampleView'
    }
});


require(['jquery','underscore','splunkjs/mvc', 'step_control_wizard_view', 'splunkjs/mvc/simplexml/ready!'],
	function($, _, mvc, StepControlWizardExampleView){
		
		var step_control_example = new StepControlWizardExampleView({'el' : '#step_control_wizard_holder'})
		step_control_example.render();
		
	}
);