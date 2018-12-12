import { SlackKnownDataSources, SlackActionTypes } from './SlackMessageModels';

export class SlackDialogModel {
  constructor(triggerId, dialog) {
    this.trigger_id = triggerId;
    this.dialog = dialog;
  }
}

export class SlackDialog {
  constructor(callbackId, title, submitLabel, notifyOnCancel, state) {
    this.callback_id = callbackId;
    this.title = title;
    this.submit_label = submitLabel;
    this.notify_on_cancel = notifyOnCancel;
    this.state = state;
  }

  addElements(elements) {
    if (Array.isArray(elements)) {
      if (this.elements && this.elements.length > 0) {
        this.elements.push(...elements);
      } else {
        this.elements = elements;
      }
    }
  }
}

export class SlackDialogElement {
  constructor(label, name) {
    this.label = label;
    this.name = name;
  }
}

export class SlackDialogError {
  constructor(name, error) {
    this.name = name;
    this.error = error;
  }
}

export class SlackDialogTextarea extends SlackDialogElement {
  constructor(label, name, placeholder, hint) {
    super(label, name);
    this.type = SlackActionTypes.textarea;
    this.hint = hint;
    this.placeholder = placeholder;
  }
}

export class SlackDialogText extends SlackDialogElement {
  constructor(label, name, placeholder, optional = false, hint) {
    super(label, name);
    this.type = SlackActionTypes.text;
    this.placeholder = placeholder;
    this.hint = hint;
    this.optional = optional;
  }
}

export class SlackDialogSelect extends SlackDialogElement {
  constructor(label, name) {
    super(label, name);
    this.type = SlackActionTypes.select;
  }
}

export class SlackDialogSelectElementWithOptions extends SlackDialogSelect {
  constructor(label, name, options) {
    super(label, name);
    this.options = options;
  }
}

export class SlackDialogElementWithDataSource extends SlackDialogSelect {
  constructor(label, name, dataSource = SlackKnownDataSources.users) {
    super(label, name);
    this.data_source = dataSource;
  }
}
