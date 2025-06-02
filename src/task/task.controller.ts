import { Controller, Get } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('api/task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get('next-execution')
  getNextExecutionTime(): string {
    return this.taskService.getTimeUntilNextExecution();
  }
}
