import { ModelAccessor, ClientInterface } from '@lib/sdk-client/interfaces';

import BaseAccessor from './BaseModelAccessor';
import Task from './ModelClasses/Task';

export type TaskList<T extends Task> = T[];

export default class Tasks extends BaseAccessor {
  uuid = '';

  routePath = '/tasks/';

  parent?: ModelAccessor;

  taskList: TaskList<Task> = [];

  constructor(root: ClientInterface, props?: BaseAccessor) {
    super(root, props);
    this.parent = props?.parent;
    this.model = Task;
  }
}
