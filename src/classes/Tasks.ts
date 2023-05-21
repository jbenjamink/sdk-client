import BaseModelAccessor from './BaseModelAccessor';
import Task from './ModelClasses/Task';

export type TaskList<T extends Task> = T[];

export default class Tasks extends BaseModelAccessor<Task> {
  uuid = '';

  routePath = '/tasks/';

  parent?: ModelAccessor<ModelInstance<any>>;

  taskList: TaskList<Task> = [];

  constructor(root: ClientInterface, props?: any) {
    super(root, props);
    this.parent = props?.parent;
    this.model = Task;
  }
}
