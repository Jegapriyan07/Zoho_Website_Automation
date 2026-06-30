//$Id$
import TemplateCreator from '../../clientlibraries/TemplateCreator';
import '../../../scss/MultiStepComponent/ZAMultiStepComponent.scss';

//ignorei18n_start
const multiStepComponent = `
<section class="za-multistep-component" elname="{{:componentElName}}" data-current-step="{{:currentStep}}">
    <nav class="za-multistep-navigation" role="navigation" aria-label="{{:navigationLabel}}" elname="zaMultistepNav">
        <ul class="za-multistep-steps" role="list">
            {{for:steps}}
            <li class="za-multistep-step {{if:isFirst}}za-multistep-step-first{{fi}} {{if:isLast}}za-multistep-step-last{{fi}} za-multistep-step-disabled" 
                role="listitem" 
                {{if:elName}}elname="{{:elName}}"{{fi}}
                {{if:isDisabled}}aria-disabled="true"{{fi}}
                aria-label="{{:stepLabel}}">
                <div class="za-multistep-step-content">
                    <div class="za-multistep-step-icon-wrapper">
                        <div class="za-multistep-step-icon {{if:isCompleted}}za-multistep-step-icon-completed{{fi}} {{if:isActive}}za-multistep-step-icon-active{{fi}} {{if:isDisabled}}za-multistep-step-icon-disabled{{fi}}">
                            <span class="za-multistep-step-number" aria-hidden="true">{{:stepNumber}}</span>
                        </div>
                    </div>
                    <p class="za-multistep-step-label zaFont13Imp" tip="{{#stepLabel}}" custom-tip-func="checkLengthAndShow">{{>stepLabel}}</p>
                </div>
            </li>
            {{if:!isLast}}
            <li class="za-multistep-separator" role="separator" aria-hidden="true">
                <span class="za-multistep-separator-arrow"></span>
            </li>
            {{fi}}
            {{endfor}}
        </ul>
    </nav>
    <main class="za-multistep-content" elname="{{:contentElName}}">
    </main>
</section>`;

TemplateCreator.parseTemplateView('ZAMultiStepComponent', 'multiStepComponent', multiStepComponent);

//ignorei18n_end
