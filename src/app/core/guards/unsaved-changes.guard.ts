import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  // If the component says it's safe to leave, allow navigation
  if (component.canDeactivate()) return true;

  // Otherwise ask for confirmation
  return window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
};
